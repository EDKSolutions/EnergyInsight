/**
 * Base Calculation Service
 * Abstract base class for all calculation services providing common functionality
 */

import { prisma } from '@/lib/prisma';
import { Calculations } from '@prisma/client';
import {
  ServiceName,
  ServiceInput,
  ServiceOutput,
  ServiceExecutionResult,
  ServiceOverrides,
  CalculationContext,
  OverrideValidationResult,
} from '../types';

export abstract class BaseCalculationService<
  TInput extends ServiceInput,
  TOutput extends ServiceOutput,
  TOverrides extends ServiceOverrides = ServiceOverrides
> {
  // Abstract properties that each service must define
  abstract readonly serviceName: ServiceName;
  abstract readonly version: string;
  abstract readonly dependencies: ServiceName[];

  // Abstract methods that each service must implement
  abstract calculate(input: TInput): Promise<TOutput> | TOutput;
  abstract buildInputFromCalculation(
    calculation: Calculations,
    overrides?: TOverrides
  ): TInput;
  abstract validateInput(input: TInput): OverrideValidationResult;
  abstract saveResultsToDatabase(
    calculationId: string,
    output: TOutput
  ): Promise<void>;

  /**
   * Main entry point for service execution with overrides and cascade support
   */
  async executeWithOverrides(
    calculationId: string,
    overrides?: TOverrides,
    cascade: boolean = true,
    context?: CalculationContext
  ): Promise<ServiceExecutionResult<TOutput>> {
    const startTime = Date.now();
    
    try {
      console.log(`[${this.serviceName}] Starting calculation for ${calculationId}`);
      
      // 1. Get calculation record from database
      const calculation = await this.getCalculation(calculationId);
      if (!calculation) {
        return {
          success: false,
          error: {
            code: 'CALCULATION_NOT_FOUND',
            message: `Calculation ${calculationId} not found`,
          },
          executionTime: Date.now() - startTime,
        };
      }

      // 2. Build input with overrides
      const input = this.buildInputFromCalculation(calculation, overrides);
      
      // 3. Validate input
      const validation = this.validateInput(input);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: { errors: validation.errors, warnings: validation.warnings },
          },
          executionTime: Date.now() - startTime,
        };
      }

      // 4. Execute calculation
      const output = await this.calculate(input);
      
      // 5. Save results to database
      await this.saveResultsToDatabase(calculationId, output);
      
      // 6. Track overrides in metadata
      if (overrides) {
        await this.trackOverrides(calculationId, overrides, context?.userId);
      }

      console.log(`[${this.serviceName}] Completed calculation for ${calculationId}`);

      const result: ServiceExecutionResult<TOutput> = {
        success: true,
        output,
        executionTime: Date.now() - startTime,
      };

      // 7. Trigger dependencies if cascade is enabled
      if (cascade) {
        result.dependenciesTriggered = await this.triggerDependencies(
          calculationId
        );
      }

      return result;

    } catch (error) {
      console.error(`[${this.serviceName}] Error calculating for ${calculationId}:`, error);
      
      return {
        success: false,
        error: {
          code: 'CALCULATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: { stack: error instanceof Error ? error.stack : undefined },
        },
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute calculation without overrides (use stored values)
   */
  async execute(calculationId: string, cascade: boolean = true): Promise<ServiceExecutionResult<TOutput>> {
    return this.executeWithOverrides(calculationId, undefined, cascade);
  }

  /**
   * Get calculation record from database
   */
  protected async getCalculation(calculationId: string): Promise<Calculations | null> {
    try {
      return await prisma.calculations.findUnique({
        where: { id: calculationId },
      });
    } catch (error) {
      console.error(`[${this.serviceName}] Error fetching calculation:`, error);
      throw new Error('Failed to fetch calculation from database');
    }
  }

  /**
   * Update service metadata in database
   */
  protected async updateServiceMetadata(
    calculationId: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    try {
      const currentVersions = await this.getCurrentServiceVersions(calculationId);
      const updatedVersions = {
        ...currentVersions,
        [this.serviceName]: this.version,
      };

      await prisma.calculations.update({
        where: { id: calculationId },
        data: {
          lastCalculatedService: this.serviceName,
          serviceVersions: updatedVersions,
          updatedAt: new Date(),
          ...additionalData,
        },
      });
    } catch (error) {
      console.error(`[${this.serviceName}] Error updating service metadata:`, error);
      // Don't throw here as it's non-critical
    }
  }

  /**
   * Get current service versions from database
   */
  private async getCurrentServiceVersions(calculationId: string): Promise<Record<string, string>> {
    try {
      const calculation = await prisma.calculations.findUnique({
        where: { id: calculationId },
        select: { serviceVersions: true },
      });
      
      return (calculation?.serviceVersions as Record<string, string>) || {};
    } catch (error) {
      console.error(`[${this.serviceName}] Error getting service versions:`, error);
      return {};
    }
  }

  /**
   * Track field overrides in database for audit trail
   */
  protected async trackOverrides(
    calculationId: string,
    overrides: TOverrides,
    userId?: string
  ): Promise<void> {
    try {
      const currentOverrides = await this.getCurrentOverrides(calculationId);
      const timestamp = new Date().toISOString();

      // Build override metadata
      const overrideMetadata = { ...currentOverrides };
      
      for (const [field, value] of Object.entries(overrides)) {
        if (value !== undefined && value !== null) {
          overrideMetadata[`${this.serviceName}.${field}`] = {
            value,
            overriddenAt: timestamp,
            overriddenBy: userId || 'system',
            service: this.serviceName,
          };
        }
      }

      await prisma.calculations.update({
        where: { id: calculationId },
        data: {
          overriddenFields: JSON.stringify(overrideMetadata),
        },
      });
    } catch (error) {
      console.error(`[${this.serviceName}] Error tracking overrides:`, error);
      // Don't throw as this is non-critical
    }
  }

  /**
   * Get current overrides from database
   */
  private async getCurrentOverrides(calculationId: string): Promise<Record<string, unknown>> {
    try {
      const calculation = await prisma.calculations.findUnique({
        where: { id: calculationId },
        select: { overriddenFields: true },
      });
      
      return (calculation?.overriddenFields as Record<string, unknown>) || {};
    } catch (error) {
      console.error(`[${this.serviceName}] Error getting current overrides:`, error);
      return {};
    }
  }

  /**
   * Trigger dependent services (to be implemented by dependency manager)
   */
  protected async triggerDependencies(
    calculationId: string
  ): Promise<string[]> {
    // This will be implemented by the dependency manager
    // For now, return empty array
    console.log(`[${this.serviceName}] Would trigger dependencies for ${calculationId}`);
    return [];
  }

  /**
   * Check if all required dependencies have been calculated
   */
  protected async validateDependencies(calculationId: string): Promise<boolean> {
    if (this.dependencies.length === 0) return true;

    try {
      const calculation = await this.getCalculation(calculationId);
      if (!calculation) return false;

      const serviceVersions = (calculation.serviceVersions as Record<string, string>) || {};
      
      // Check if all required dependencies have been calculated
      return this.dependencies.every(dep => serviceVersions[dep] !== undefined);
    } catch (error) {
      console.error(`[${this.serviceName}] Error validating dependencies:`, error);
      return false;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(calculationId?: string): Promise<{
    service: ServiceName;
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    dependencies: { service: ServiceName; available: boolean }[];
    lastExecution?: Date;
  }> {
    const health: {
      service: ServiceName;
      status: 'healthy' | 'degraded' | 'unhealthy';
      version: string;
      dependencies: { service: ServiceName; available: boolean }[];
      lastExecution?: Date;
    } = {
      service: this.serviceName,
      status: 'healthy',
      version: this.version,
      dependencies: this.dependencies.map(dep => ({
        service: dep,
        available: true, // Would check actual dependency health
      })),
    };

    if (calculationId) {
      try {
        const calculation = await this.getCalculation(calculationId);
        health.lastExecution = calculation?.updatedAt;
      } catch {
        health.status = 'degraded';
      }
    }

    return health;
  }
}
