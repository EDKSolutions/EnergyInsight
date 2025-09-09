/**
 * Central export file for all calculation constants
 * Provides easy access to all constants used across the energy calculation services
 */

// Energy constants (Sections 2-6)
export * from './energy-constants';
export { 
  ENERGY_CONSTANTS,
  getEFLHFromPluto,
  calculateAnnualBuildingkWhHeatingPTHP
} from './energy-constants';

// EFLH constants (Section 3 - PTHP calculations)
export * from './eflh-constants';

// LL97 constants (Section 7)
export * from './ll97-constants';
export { LL97_CONSTANTS } from './ll97-constants';

// Financial constants (Section 8)
export * from './financial-constants';
export { FINANCIAL_CONSTANTS } from './financial-constants';

// NOI constants (Section 9)
export * from './noi-constants';
export { NOI_CONSTANTS } from './noi-constants';

// Property Value constants (Section 10)
export * from './property-value-constants';
export { PROPERTY_VALUE_CONSTANTS } from './property-value-constants';

// Combined constants object for easy access
export const ALL_CALCULATION_CONSTANTS = {
  energy: () => import('./energy-constants').then(m => m.ENERGY_CONSTANTS),
  ll97: () => import('./ll97-constants').then(m => m.LL97_CONSTANTS),
  financial: () => import('./financial-constants').then(m => m.FINANCIAL_CONSTANTS),
  noi: () => import('./noi-constants').then(m => m.NOI_CONSTANTS),
  propertyValue: () => import('./property-value-constants').then(m => m.PROPERTY_VALUE_CONSTANTS),
} as const;

// Type definitions for all constant keys
export type AllConstantKeys = 
  | import('./energy-constants').EnergyConstantKey
  | import('./ll97-constants').LL97ConstantKey
  | import('./financial-constants').FinancialConstantKey
  | import('./noi-constants').NOIConstantKey
  | import('./property-value-constants').PropertyValueConstantKey;