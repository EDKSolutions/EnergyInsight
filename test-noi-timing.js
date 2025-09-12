// Test script to verify NOI timing calculations
const { NOICalculationService } = require('./src/lib/calculations/services/noi-calculation.service');

async function testNOITiming() {
  const noiService = new NOICalculationService();
  
  const testInput = {
    calculationId: 'test',
    bbl: '1234567890',
    buildingClass: 'D4',
    unitsRes: 100,
    yearBuilt: 1980,
    borough: 'Manhattan',
    numFloors: 10,
    buildingValue: 10000000,
    capRate: 5.5,
    totalRetrofitCost: 500000,
    annualEnergySavings: 80000,
    upgradeYear: 2025,
    
    // LL97 fee data for testing
    annualFeeExceedingBudget2024to2029: 50000,
    annualFeeExceedingBudget2030to2034: 75000,
    adjustedAnnualFeeBefore2027: 10000,
    adjustedAnnualFee2027to2029: 15000,
    adjustedAnnualFee2030to2034: 20000,
  };

  try {
    const result = await noiService.calculate(testInput);
    
    console.log('\n=== NOI Timing Test Results ===');
    console.log(`First 3 years of NOI projections:`);
    
    for (let i = 0; i < 3; i++) {
      const noUpgrade = result.noiByYearNoUpgrade[i];
      const withUpgrade = result.noiByYearWithUpgrade[i];
      const difference = withUpgrade.noi - noUpgrade.noi;
      
      console.log(`Year ${noUpgrade.year}:`);
      console.log(`  No Upgrade: $${noUpgrade.noi.toLocaleString()}`);
      console.log(`  With Upgrade: $${withUpgrade.noi.toLocaleString()}`);
      console.log(`  Difference: $${difference.toLocaleString()}`);
      console.log(`  Should be same in ${testInput.upgradeYear}?: ${noUpgrade.year === testInput.upgradeYear ? (difference === 0 ? 'YES ✓' : 'NO ✗') : 'N/A'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testNOITiming();