/**
 * Central export file for all calculation types
 * Provides easy access to all TypeScript interfaces and types
 */

// Service input types
export * from './service-inputs';
export type {
  ServiceInput,
  ServiceName,
  ServiceInputByName,
  AIUnitBreakdownInput,
  EnergyCalculationInput,
  LL97CalculationInput,
  FinancialCalculationInput,
  NOICalculationInput,
  PropertyValueCalculationInput,
} from './service-inputs';

// Service output types
export * from './service-outputs';
export type {
  ServiceOutput,
  ServiceOutputByName,
  ServiceExecutionResult,
  AIUnitBreakdownOutput,
  EnergyCalculationOutput,
  LL97CalculationOutput,
  FinancialCalculationOutput,
  NOICalculationOutput,
  PropertyValueCalculationOutput,
} from './service-outputs';

// Override types
export * from './overrides';
export type {
  ServiceOverrides,
  ServiceOverridesByName,
  MultiServiceOverrides,
  ServiceUpdateRequest,
  OverrideMetadata,
  OverrideValidationResult,
  AIUnitBreakdownOverrides,
  EnergyCalculationOverrides,
  LL97CalculationOverrides,
  FinancialCalculationOverrides,
  NOICalculationOverrides,
  PropertyValueCalculationOverrides,
} from './overrides';

// Re-export utility functions
export {
  buildServiceInput,
  validateOverrides,
  mergeOverrides,
  isEnergyOverrides,
  isLL97Overrides,
  isFinancialOverrides,
} from './overrides';

// Common calculation context interface
export interface CalculationContext {
  calculationId: string;
  userId: string;
  triggeredBy?: ServiceName; // Which service triggered this calculation
  cascade?: boolean; // Whether to trigger dependencies
  metadata?: {
    source: 'user-initiated' | 'system-cascade' | 'api-call';
    timestamp: Date;
    version: string;
  };
}

// Service dependency definition
export interface ServiceDependency {
  serviceName: ServiceName;
  dependsOn: ServiceName[];
  triggers: ServiceName[];
}

// Complete service registry type
export interface ServiceRegistry {
  'ai-breakdown': ServiceDependency;
  'energy': ServiceDependency;
  'll97': ServiceDependency;
  'financial': ServiceDependency;
  'noi': ServiceDependency;
  'property-value': ServiceDependency;
}

// Default service dependencies
export const SERVICE_DEPENDENCIES: ServiceRegistry = {
  'ai-breakdown': {
    serviceName: 'ai-breakdown',
    dependsOn: [],
    triggers: ['energy'],
  },
  'energy': {
    serviceName: 'energy',
    dependsOn: ['ai-breakdown'],
    triggers: ['ll97', 'financial', 'noi', 'property-value'],
  },
  'll97': {
    serviceName: 'll97',
    dependsOn: ['energy'],
    triggers: ['financial', 'noi', 'property-value'],
  },
  'financial': {
    serviceName: 'financial',
    dependsOn: ['energy', 'll97'],
    triggers: ['noi'],
  },
  'noi': {
    serviceName: 'noi',
    dependsOn: ['ll97', 'financial'],
    triggers: ['property-value'],
  },
  'property-value': {
    serviceName: 'property-value',
    dependsOn: ['noi'],
    triggers: [],
  },
} as const;