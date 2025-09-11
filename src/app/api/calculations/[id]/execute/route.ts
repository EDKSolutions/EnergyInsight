import { NextRequest, NextResponse } from 'next/server';
import { calculationDependencyManager } from '@/lib/calculations/services/calculation-dependency-manager';
import { ServiceName } from '@/lib/calculations/types';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/app/api/auth/middleware';

/**
 * @swagger
 * /api/calculations/{id}/execute:
 *   post:
 *     tags:
 *       - Calculation Execution
 *     summary: Execute calculation services
 *     description: |
 *       Executes one or all calculation services for a specific calculation with proper dependency management.
 *       This endpoint orchestrates the execution of the calculation service chain, ensuring that dependent
 *       services are executed in the correct order.
 *       
 *       **Service Dependency Chain:**
 *       1. **AI Breakdown** → Determines unit mix and building characteristics
 *       2. **Energy** → Calculates PTAC vs PTHP energy consumption and savings
 *       3. **LL97** → Analyzes Local Law 97 compliance and fee avoidance
 *       4. **Financial** → Performs ROI, NPV, and payback analysis
 *       5. **NOI** → Calculates Net Operating Income impact
 *       6. **Property Value** → Determines property value increase
 *       
 *       **Execution Options:**
 *       - **Execute All Services:** Runs the complete calculation chain from start to finish
 *       - **Execute From Service:** Starts from a specific service and cascades to all dependents
 *       
 *       **Service Versioning:** Each executed service is versioned and tracked, allowing for
 *       incremental updates and dependency management.
 *       
 *       **Error Handling:** If any service fails, execution stops and returns detailed error information.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique calculation identifier
 *         example: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceExecutionRequest'
 *           examples:
 *             execute_all:
 *               summary: Execute all services from beginning
 *               value:
 *                 executeAll: true
 *             execute_from_energy:
 *               summary: Execute from energy service onwards
 *               value:
 *                 executeAll: false
 *                 fromService: "energy"
 *             execute_from_ll97:
 *               summary: Execute from LL97 service onwards
 *               value:
 *                 executeAll: false
 *                 fromService: "ll97"
 *             execute_from_financial:
 *               summary: Execute financial and dependent services
 *               value:
 *                 executeAll: false
 *                 fromService: "financial"
 *     responses:
 *       200:
 *         description: Calculation services executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceExecutionResponse'
 *             examples:
 *               all_services_executed:
 *                 summary: All services executed successfully
 *                 value:
 *                   message: "All calculation services executed successfully"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *               partial_execution:
 *                 summary: Services executed from specific point
 *                 value:
 *                   message: "Calculation services executed successfully from energy service"
 *                   calculationId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
 *                   fromService: "energy"
 *       400:
 *         description: Invalid request - Missing required data or invalid service name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             examples:
 *               invalid_service:
 *                 summary: Invalid service name specified
 *                 value:
 *                   error: "Invalid service name"
 *                   message: "Service 'invalid-service' is not recognized"
 *               missing_data:
 *                 summary: Missing required calculation data
 *                 value:
 *                   error: "Missing required data"
 *                   message: "Building data is incomplete for energy calculations"
 *       401:
 *         description: Unauthorized - Invalid or missing JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: Calculation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Calculation not found"
 *       500:
 *         description: Internal server error during service execution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 failedService:
 *                   type: string
 *             example:
 *               error: "Service execution failed"
 *               message: "Energy calculation service failed: Invalid EUI value"
 *               failedService: "energy"
 */

/**
 * Execute all calculation services for a calculation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = await params;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: calculationId } = await params;

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