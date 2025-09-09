import { NextRequest, NextResponse } from 'next/server';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { ServiceName } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * Execute all calculation services for a calculation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = params;

    // Verify user has access to this calculation
    const userCalculation = await prisma.userCalculations.findFirst({
      where: {
        userId: user.userId,
        calculationId,
      },
    });

    if (!userCalculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Parse request body (optional - can specify which service to start from)
    const body = await request.json().catch(() => ({}));
    const { fromService, executeAll = true } = body;

    if (executeAll) {
      // Execute all services in dependency order
      await calculationDependencyManager.executeAllServices(calculationId);
      
      return NextResponse.json({ 
        message: 'All calculation services executed successfully',
        calculationId,
      });
    } else if (fromService) {
      // Execute from a specific service and cascade to dependents
      await calculationDependencyManager.executeService(
        calculationId,
        fromService as ServiceName,
        undefined,
        true // Enable cascading
      );

      return NextResponse.json({ 
        message: `Calculation services executed from ${fromService}`,
        calculationId,
        fromService,
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid request',
        message: 'Either set executeAll to true or specify fromService'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error executing calculation services:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get execution status of all services for a calculation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = params;

    // Verify user has access to this calculation
    const userCalculation = await prisma.userCalculations.findFirst({
      where: {
        userId: user.userId,
        calculationId,
      },
      include: { calculation: true },
    });

    if (!userCalculation) {
      return NextResponse.json({ error: 'Calculation not found' }, { status: 404 });
    }

    // Get service execution status
    const serviceStatus = await calculationDependencyManager.getServiceStatus(calculationId);

    // Get service versions and last calculated info
    const serviceVersions = userCalculation.calculation.serviceVersions as Record<string, string> || {};
    const lastCalculatedService = userCalculation.calculation.lastCalculatedService;

    const statusInfo = {
      calculationId,
      lastCalculatedService,
      lastUpdated: userCalculation.calculation.updatedAt,
      services: Object.entries(serviceStatus).map(([serviceName, executed]) => ({
        name: serviceName,
        executed,
        version: serviceVersions[serviceName] || null,
      })),
      allServicesExecuted: Object.values(serviceStatus).every(Boolean),
    };

    return NextResponse.json(statusInfo);
  } catch (error) {
    console.error('Error getting service status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}