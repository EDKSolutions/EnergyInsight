/**
 * Calculation Dependency Manager
 * Handles service cascading and dependency resolution
 */

import { ServiceName } from '../types';
import { energyCalculationService } from './energy-calculation.service';
import { ll97CalculationService } from './ll97-calculation.service';
import { financialCalculationService } from './financial-calculation.service';
import { noiCalculationService } from './noi-calculation.service';
import { propertyValueCalculationService } from './property-value-calculation.service';
import { UnitBreakdownService } from '../../ai/services/unit-breakdown.service';
import { prisma } from '@/lib/prisma';

// Service instances map
const serviceInstances = {
  'ai-breakdown': new UnitBreakdownService(),
  'energy': energyCalculationService,
  'll97': ll97CalculationService,
  'financial': financialCalculationService,
  'noi': noiCalculationService,
  'property-value': propertyValueCalculationService,
} as const;

// Service dependency graph
const serviceDependencies: Record<ServiceName, ServiceName[]> = {
  'ai-breakdown': [], // No dependencies - first in chain
  'energy': ['ai-breakdown'],
  'll97': ['energy'],
  'financial': ['energy', 'll97'],
  'noi': ['financial'],
  'property-value': ['noi'],
};

export class CalculationDependencyManager {
  /**
   * Execute a single service and cascade to dependent services
   */
  async executeService(
    calculationId: string,
    serviceName: ServiceName,
    overrides?: Record<string, string | number>,
    cascade: boolean = true
  ): Promise<void> {
    console.log(`[DependencyManager] Executing service: ${serviceName} for calculation: ${calculationId}`);

    // Get calculation from database
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      throw new Error(`Calculation ${calculationId} not found`);
    }

    // Execute the requested service
    await this.executeServiceInternal(calculationId, serviceName, overrides);

    // If cascading is enabled, execute dependent services
    if (cascade) {
      const dependentServices = this.getDependentServices(serviceName);
      for (const dependentService of dependentServices) {
        await this.executeServiceInternal(calculationId, dependentService);
      }
    }

    console.log(`[DependencyManager] Completed execution for service: ${serviceName}`);
  }

  /**
   * Execute all services for a calculation in dependency order
   */
  async executeAllServices(calculationId: string): Promise<void> {
    console.log(`[DependencyManager] Executing all services for calculation: ${calculationId}`);

    const executionOrder = this.getExecutionOrder();
    
    for (const serviceName of executionOrder) {
      await this.executeServiceInternal(calculationId, serviceName);
    }

    console.log(`[DependencyManager] Completed all services for calculation: ${calculationId}`);
  }

  /**
   * Get services that depend on the given service
   */
  private getDependentServices(serviceName: ServiceName): ServiceName[] {
    const dependents: ServiceName[] = [];
    
    for (const [service, dependencies] of Object.entries(serviceDependencies)) {
      if (dependencies.includes(serviceName)) {
        dependents.push(service as ServiceName);
      }
    }

    // Sort by dependency order to ensure proper execution sequence
    return dependents.sort((a, b) => {
      const orderA = this.getServiceOrder(a);
      const orderB = this.getServiceOrder(b);
      return orderA - orderB;
    });
  }

  /**
   * Get execution order for all services
   */
  private getExecutionOrder(): ServiceName[] {
    const services: ServiceName[] = ['ai-breakdown', 'energy', 'll97', 'financial', 'noi', 'property-value'];
    return services.sort((a, b) => this.getServiceOrder(a) - this.getServiceOrder(b));
  }

  /**
   * Get execution order number for a service
   */
  private getServiceOrder(serviceName: ServiceName): number {
    const order: Record<ServiceName, number> = {
      'ai-breakdown': 1,
      'energy': 2,
      'll97': 3,
      'financial': 4,
      'noi': 5,
      'property-value': 6,
    };
    return order[serviceName] || 999;
  }

  /**
   * Execute a specific service (internal method)
   */
  private async executeServiceInternal(
    calculationId: string,
    serviceName: ServiceName,
    overrides?: Record<string, string | number>
  ): Promise<void> {
    console.log(`[DependencyManager] Executing ${serviceName} service`);

    try {
      const service = serviceInstances[serviceName];
      
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }

      // Handle AI breakdown service differently (it has a different interface)
      if (serviceName === 'ai-breakdown') {
        // AI breakdown service is handled differently - it's already executed during calculation creation
        // We don't re-execute it here to avoid overwriting user data
        console.log(`[DependencyManager] Skipping AI breakdown service re-execution`);
        return;
      }

      // For calculation services, use the executeWithOverrides method
      if ('executeWithOverrides' in service) {
        await service.executeWithOverrides(calculationId, overrides, false); // Don't cascade from here
      } else {
        throw new Error(`Service ${serviceName} does not support executeWithOverrides method`);
      }

      console.log(`[DependencyManager] Successfully executed ${serviceName} service`);
    } catch (error) {
      console.error(`[DependencyManager] Error executing ${serviceName} service:`, error);
      throw new Error(`Failed to execute ${serviceName} service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if dependencies are satisfied for a service
   */
  async areDependenciesSatisfied(calculationId: string, serviceName: ServiceName): Promise<boolean> {
    const dependencies = serviceDependencies[serviceName];
    
    if (dependencies.length === 0) {
      return true; // No dependencies
    }

    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      return false;
    }

    // Check if all dependencies have been executed
    const serviceVersions = calculation.serviceVersions as Record<string, string> || {};
    
    for (const dependency of dependencies) {
      if (!serviceVersions[dependency]) {
        console.log(`[DependencyManager] Dependency ${dependency} not satisfied for ${serviceName}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get service execution status
   */
  async getServiceStatus(calculationId: string): Promise<Record<ServiceName, boolean>> {
    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      throw new Error(`Calculation ${calculationId} not found`);
    }

    const serviceVersions = calculation.serviceVersions as Record<string, string> || {};
    
    const status: Record<ServiceName, boolean> = {
      'ai-breakdown': !!serviceVersions['ai-breakdown'],
      'energy': !!serviceVersions['energy'],
      'll97': !!serviceVersions['ll97'],
      'financial': !!serviceVersions['financial'],
      'noi': !!serviceVersions['noi'],
      'property-value': !!serviceVersions['property-value'],
    };

    return status;
  }

  /**
   * Reset calculation and mark services for re-execution
   */
  async resetCalculation(calculationId: string, fromService?: ServiceName): Promise<void> {
    console.log(`[DependencyManager] Resetting calculation ${calculationId} from service: ${fromService || 'all'}`);

    const servicesToReset = fromService 
      ? [fromService, ...this.getDependentServices(fromService)]
      : ['ai-breakdown', 'energy', 'll97', 'financial', 'noi', 'property-value'] as ServiceName[];

    const calculation = await prisma.calculations.findUnique({
      where: { id: calculationId },
    });

    if (!calculation) {
      throw new Error(`Calculation ${calculationId} not found`);
    }

    const currentServiceVersions = calculation.serviceVersions as Record<string, string> || {};
    const updatedServiceVersions = { ...currentServiceVersions };

    // Remove service versions for services being reset
    for (const service of servicesToReset) {
      delete updatedServiceVersions[service];
    }

    await prisma.calculations.update({
      where: { id: calculationId },
      data: {
        serviceVersions: updatedServiceVersions,
        lastCalculatedService: null,
      },
    });

    console.log(`[DependencyManager] Reset services: ${servicesToReset.join(', ')}`);
  }
}

export const calculationDependencyManager = new CalculationDependencyManager();