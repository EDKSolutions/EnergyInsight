/**
 * Simple test script to verify NOI calculation service
 */

const { noiCalculationService } = require('./src/lib/calculations/services/noi-calculation.service.ts');

// Test input data
const testInput = {
  calculationId: 'test-calc-id',
  buildingValue: 10000000, // $10M building
  capRate: 5.5, // 5.5% cap rate
  totalRetrofitCost: 500000, // $500k retrofit cost
  annualEnergySavings: 50000, // $50k annual energy savings
  
  // LL97 penalty data
  annualFeeExceedingBudget2024to2029: 100000, // $100k/year penalty
  annualFeeExceedingBudget2030to2034: 150000, // $150k/year penalty 
  annualFeeExceedingBudget2035to2039: 200000, // $200k/year penalty
  annualFeeExceedingBudget2040to2049: 250000, // $250k/year penalty
  
  // Adjusted penalties with upgrade
  adjustedAnnualFeeBefore2027: 10000, // $10k/year with upgrade
  adjustedAnnualFee2027to2029: 15000, // $15k/year with upgrade
  adjustedAnnualFee2030to2034: 20000, // $20k/year with upgrade
  adjustedAnnualFee2035to2039: 30000, // $30k/year with upgrade  
  adjustedAnnualFee2040to2049: 40000, // $40k/year with upgrade
};

console.log('Testing NOI calculation service...');
console.log('Input:', testInput);

try {
  const result = noiCalculationService.calculate(testInput);
  
  console.log('\n=== NOI Calculation Results ===');
  console.log('Base NOI:', result.annualBuildingNOI.toLocaleString());
  console.log('Years of projections:', result.noiByYearNoUpgrade.length);
  
  console.log('\nFirst few years without upgrade:');
  result.noiByYearNoUpgrade.slice(0, 5).forEach(item => {
    console.log(`${item.year}: $${item.noi.toLocaleString()}`);
  });
  
  console.log('\nFirst few years with upgrade:');  
  result.noiByYearWithUpgrade.slice(0, 5).forEach(item => {
    console.log(`${item.year}: $${item.noi.toLocaleString()}`);
  });
  
  console.log('\nROI from NOI:', result.roiFromNOI.toFixed(2) + '%');
  console.log('Test completed successfully!');
  
} catch (error) {
  console.error('Test failed:', error);
}