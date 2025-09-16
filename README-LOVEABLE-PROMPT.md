# Loveable Prompt for Energy Calculations Display

## Prompt

"Create a comprehensive energy analysis dashboard for a NYC building's PTAC to PTHP conversion project. Display the results in a clean, tabbed interface with the following structure:

### Tab 1: 🏢 Building Overview

**Property Overview Section:**
- Address: [Full address with city, state, ZIP]
- Building Class: [From PLUTO data]
- Year Built: [yearBuilt]
- Borough: [boro]
- Stories: [numFloors]
- Total Square Feet: [resArea]
- Total Units: [unitsRes]
- PTAC Units: [ptacUnits - calculated from unit mix]

**Key Metrics Cards (3 cards):**
1. Total Floor Area: [resArea] sq ft (Verified from PLUTO)
2. Total Units: [unitsRes] units, [property type] (Verified)
3. PTAC Units: [ptacUnits] units, Avg age: [current year - yearBuilt] years (AI Estimate)

**Unit Mix Breakdown Section:**
Display as visual cards with percentages:
- Studio: [studio] units ([studio/unitsRes * 100]%) *(overridable)*
- 1 Bedroom: [one_bed] units ([one_bed/unitsRes * 100]%) *(overridable)*
- 2 Bedroom: [two_bed] units ([two_bed/unitsRes * 100]%) *(overridable)*
- 3+ Bedroom: [three_plus] units ([three_plus/unitsRes * 100]%) *(overridable)*

**Expandable Section: PLUTO and LL84 Raw Data**
- Show raw JSON data from PLUTO API
- Show LL84 emissions data: totalBuildingEmissionsLL84
- Include site_eui if available

### Tab 2: ⚡ Energy & Cost Analysis

**Current PTAC System:**
- Annual Heating: [annualBuildingThermsHeatingPTAC] therms ([annualBuildingMMBtuHeatingPTAC] MMBtu)
- Annual Cooling: [annualBuildingKwhCoolingPTAC] kWh ([annualBuildingMMBtuCoolingPTAC] MMBtu)
- Total Energy: [annualBuildingMMBtuTotalPTAC] MMBtu/year
- Annual Cost: $[annualBuildingCostPTAC] (@ $[priceKwhHour]/kWh, $[priceThermHour]/therm)

**Proposed PTHP System:**
- Annual Heating: [annualBuildingkWhHeatingPTHP] kWh ([annualBuildingMMBtuHeatingPTHP] MMBtu)
  - Using EFLH: [EFLH value based on building type] hours
  - COP: [pthpCOP]
- Annual Cooling: [annualBuildingKwhCoolingPTHP] kWh ([annualBuildingMMBtuCoolingPTHP] MMBtu)
- Total Energy: [annualBuildingMMBtuTotalPTHP] MMBtu/year
- Annual Cost: $[annualBuildingCostPTHP]

**Energy Savings:**
- Energy Reduction: [% reduction] ([annualBuildingMMBtuTotalPTAC - annualBuildingMMBtuTotalPTHP] MMBtu/year)
- Cost Savings: $[annualSavingsEnergy]/year
- Efficiency Gain: [Show as percentage improvement]

### Tab 3: 🌍 Emissions & LL97 Compliance

**Current Emissions Profile:**
- Total Building Emissions: [totalBuildingEmissionsLL84] tCO₂e/year
- Emissions Budget 2024-2029: [emissionsBudget2024to2029] tCO₂e/year
- Emissions Budget 2030-2034: [emissionsBudget2030to2034] tCO₂e/year
- Emissions Budget 2035-2039: [emissionsBudget2035to2039] tCO₂e/year

**Post-Retrofit Emissions:**
- Adjusted Emissions 2024-2029: [adjustedTotalBuildingEmissions2024to2029] tCO₂e/year
- Adjusted Emissions 2030-2034: [adjustedTotalBuildingEmissions2030to2034] tCO₂e/year
- Adjusted Emissions 2035+: [adjustedTotalBuildingEmissions2035to2039] tCO₂e/year

**LL97 Fee Analysis:**
- Annual Fee Without Upgrade 2024-2029: $[annualFeeExceedingBudget2024to2029]
- Annual Fee Without Upgrade 2030-2034: $[annualFeeExceedingBudget2030to2034]
- Annual Fee With Upgrade 2024-2027: $[adjustedAnnualFeeBefore2027] (includes BE credit: $[beCreditBefore2027])
- Annual Fee With Upgrade 2027-2029: $[adjustedAnnualFee2027to2029] (includes BE credit: $[beCredit2027to2029])
- Annual Fee With Upgrade 2030+: $[adjustedAnnualFee2030to2034]

**Fee Avoidance:**
- 2024-2027: $[annualLL97FeeAvoidance2024to2027]/year
- 2027-2029: $[annualLL97FeeAvoidance2027to2029]/year
- 2030-2034: $[annualLL97FeeAvoidance2030to2034]/year
- 2035+: $[annualLL97FeeAvoidance2035to2039]/year

### Tab 4: 📊 Financial Analysis & ROI

**Retrofit Investment:**
- Equipment Cost: $[pthpUnitCost × ptacUnits] *(pthpUnitCost overridable)*
- Installation Cost: $[pthpInstallationCost × ptacUnits] *(pthpInstallationCost overridable)*
- Contingency (10%): $[contingency amount] *(pthpContingency overridable)*
- Total Retrofit Cost: $[totalRetrofitCost]

**Payback Analysis:**
- Simple Payback Period: [X] years
- Cumulative Savings by Year: [Show year-by-year progression]
- Break-even Year: [Year when cumulative savings exceed totalRetrofitCost]

**NOI Impact:**
- Current NOI: $[currentNOI]/year *(overridable)*
- NOI Without Upgrade (2026-2029): $[noiNoUpgrade2024to2029]/year
- NOI Without Upgrade (2030+): $[noiNoUpgrade2030to2034]/year
- NOI With Upgrade (2026-2029): $[noiWithUpgrade2024to2027]/year
- NOI With Upgrade (2030+): $[noiWithUpgrade2030to2034]/year
- Annual NOI Improvement: $[difference]/year

**Property Value Impact:**
- Current Property Value: $[currentNOI / 0.04] (at 4% cap rate)
- Value Without Upgrade (2030+): $[propertyValueNoUpgrade]
- Value With Upgrade (2030+): $[propertyValueWithUpgrade]
- Net Property Value Gain: $[propertyValueWithUpgrade - propertyValueNoUpgrade]

### Tab 5: 📈 Scenarios & Sensitivities

**Financing Scenarios:**
- Cash Purchase: [Show cash flow without loan]
- 5-Year Loan @ 6%: [Show monthly payment, total interest]
- 10-Year Loan @ 6%: [Show monthly payment, total interest]
- 15-Year Loan @ 6%: [Show monthly payment, total interest]

**Sensitivity Analysis:**
- Energy Price Variations: ±20% impact on savings
- LL97 Fee Changes: Impact if fees increase to $350/tCO₂e
- Cap Rate Sensitivity: Property value at 3%, 4%, 5% cap rates

**Risk Factors:**
- Technology obsolescence risk
- Regulatory change risk
- Energy price volatility
- Maintenance cost considerations

### Methodology Footer (Collapsible)

**Data Sources:**
- Building data: NYC PLUTO Database (verified)
- Unit mix: AI analysis using GPT-4 based on building characteristics
- Emissions data: NYC Local Law 84 reporting (total_location_based_ghg)
- Energy calculations: Based on industry standards and ASHRAE methodologies
- EFLH values: NYC-specific data by building type and era
- Financial data: 2025 RGB Study for NOI, market rates for energy costs

**Key Assumptions:**
- PTAC heating: [annualUnitThermsHeatingPTAC] therms/unit/year *(overridable)*
- PTAC cooling: [annualUnitKwhCoolingPTAC] kWh/unit/year *(overridable)*
- PTHP COP: [pthpCOP] *(overridable)*
- PTHP heating capacity: [heatingCapacityPTHP] KBtu *(overridable)*
- Electricity rate: $[priceKwhHour]/kWh *(overridable)*
- Natural gas rate: $[priceThermHour]/therm *(overridable)*
- LL97 fee: $[feePerTonCO2e]/tCO₂e *(overridable)*
- Cap rate: 4% *(overridable)*

**Calculation Methodology:**
1. Unit distribution determined by AI analysis of PLUTO data
2. PTAC units calculated: studios×1 + 1BR×2 + 2BR×3 + 3BR+×4
3. PTHP heating energy: (Capacity/3.412) × (1/COP) × EFLH × Units
4. LL97 fees calculated per compliance period with BE credits where applicable
5. NOI and property values use actual building income data or RGB estimates

**Visual Elements to Include:**
- Progress bars for energy reduction percentages
- Color coding: Green for savings, red for costs/penalties
- Verified badges for data from official sources
- AI Estimate badges for ML-generated values
- Interactive charts for financial projections
- Expandable sections for detailed breakdowns

**Important Notes:**
- All monetary values should be formatted with commas and $ symbol
- All energy values should show both original units and MMBtu conversions
- Percentages should be shown to 1 decimal place
- Years should be clearly labeled for time-sensitive values
- Include tooltips explaining technical terms and acronyms"

## Overridable Fields

The prompt should include clear indicators for fields that users can override to customize their analysis. These overridable fields allow users to:
- Correct inaccurate AI estimates with known building data
- Test sensitivity scenarios with different assumptions
- Accommodate unique building characteristics not captured by standard models

### Building Characteristics (Overridable)
- **yearBuilt**: Override if PLUTO data is incorrect or if major renovations changed building performance
- **numFloors**: Correct if actual floor count differs from PLUTO records  
- **resArea**: Override with actual measured square footage if available
- **unitsRes**: Correct total unit count if different from PLUTO data
- **ptacUnits**: Override if actual PTAC unit count is known (bypasses unit mix calculation)

### Unit Mix Distribution (Overridable)
- **studio**: Number of studio units
- **one_bed**: Number of one-bedroom units  
- **two_bed**: Number of two-bedroom units
- **three_plus**: Number of three+ bedroom units
*(Note: These should auto-update to maintain unitsRes total when modified)*

### Energy Performance Assumptions (Overridable)
- **annualUnitThermsHeatingPTAC**: Per-unit heating consumption (default: 255 therms/year)
- **annualUnitKwhCoolingPTAC**: Per-unit cooling consumption (default: 1,600 kWh/year)
- **pthpCOP**: Heat pump coefficient of performance (default: 1.51)
- **heatingCapacityPTHP**: Heat pump heating capacity (default: 8 KBtu)

### Economic Assumptions (Overridable)
- **priceKwhHour**: Electricity rate (default: $0.24/kWh)
- **priceThermHour**: Natural gas rate (default: $1.45/therm)
- **feePerTonCO2e**: LL97 penalty fee (default: $268/tCO₂e)

### Financial Parameters (Overridable)
- **pthpUnitCost**: Equipment cost per PTHP unit (default: $1,100)
- **pthpInstallationCost**: Installation cost per unit (default: $450)  
- **pthpContingency**: Contingency percentage (default: 10%)
- **currentNOI**: Building's net operating income (overrides API lookup)
- **capRate**: Capitalization rate for property valuation (default: 4%)

### Loan Parameters (Overridable - for Financing Scenarios tab)
- **loanTerm**: Loan duration in years (default: 15)
- **interestRate**: Annual interest rate (default: 6%)
- **loanStartYear**: Year loan begins (default: 2025)

### UI Considerations for Overridable Fields
- Show original/calculated values alongside override inputs
- Use different styling (e.g., italic text) to indicate overridden values
- Include "Reset to Default" options for each override
- Validate override inputs (e.g., unit mix must sum to total units)
- Show impact of overrides on key metrics in real-time
- Include tooltips explaining the significance of each override

## Implementation Notes

This prompt is designed to generate a comprehensive, user-friendly dashboard that:

1. **Presents complex data simply**: Technical calculations are shown with context and explanations
2. **Uses actual variable names**: All variables match the LaTeX documentation exactly
3. **Provides transparency**: Shows data sources and whether values are verified or AI-estimated
4. **Enables decision-making**: Clear financial metrics and scenario analysis
5. **Maintains accuracy**: All formulas and methodologies align with the technical documentation

## Usage

When implementing this prompt:
1. Replace bracketed placeholders with actual calculated values
2. Ensure all variable names match those in the codebase
3. Include hover tooltips for technical terms
4. Make expandable sections actually collapsible
5. Use charts/graphs where appropriate (especially for time-series data)
6. Maintain consistent number formatting throughout

## Visual Design Recommendations

- Use a clean, modern design with plenty of whitespace
- Implement a tab navigation that's easy to use
- Use icons to make sections more scannable
- Include a summary card at the top of each tab
- Use green/red color coding for positive/negative values
- Make the interface responsive for different screen sizes