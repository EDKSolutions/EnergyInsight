-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserIdentityProvider" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UserIdentityProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Calculations" (
    "id" TEXT NOT NULL,
    "bbl" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "boro" TEXT NOT NULL,
    "yearBuilt" INTEGER NOT NULL,
    "stories" INTEGER NOT NULL,
    "buildingClass" TEXT NOT NULL,
    "totalSquareFeet" DOUBLE PRECISION NOT NULL,
    "totalResidentialUnits" INTEGER NOT NULL,
    "ptacUnits" INTEGER NOT NULL,
    "isRentStabilized" BOOLEAN,
    "unitMixBreakDown" TEXT NOT NULL,
    "capRate" DOUBLE PRECISION NOT NULL,
    "buildingValue" DOUBLE PRECISION NOT NULL,
    "annualBuildingMMBtuCoolingPTAC" DOUBLE PRECISION,
    "annualBuildingMMBtuHeatingPTAC" DOUBLE PRECISION,
    "annualBuildingMMBtuTotalPTAC" DOUBLE PRECISION,
    "annualBuildingMMBtuHeatingPTHP" DOUBLE PRECISION,
    "annualBuildingMMBtuCoolingPTHP" DOUBLE PRECISION,
    "annualBuildingMMBtuTotalPTHP" DOUBLE PRECISION,
    "energyReductionPercentage" DOUBLE PRECISION,
    "totalRetrofitCost" DOUBLE PRECISION,
    "annualBuildingThermsHeatingPTAC" DOUBLE PRECISION,
    "annualBuildingkWhCoolingPTAC" DOUBLE PRECISION,
    "annualBuildingkWhCoolingPTHP" DOUBLE PRECISION,
    "annualBuildingCostPTAC" DOUBLE PRECISION,
    "annualBuildingCostPTHP" DOUBLE PRECISION,
    "annualEnergySavings" DOUBLE PRECISION,
    "eflhHours" INTEGER,
    "annualBuildingkWhHeatingPTHP" DOUBLE PRECISION,
    "unitBreakdownSource" TEXT,
    "aiAnalysisNotes" TEXT,
    "emissionsBudget2024to2029" DOUBLE PRECISION,
    "emissionsBudget2030to2034" DOUBLE PRECISION,
    "emissionsBudget2035to2039" DOUBLE PRECISION,
    "emissionsBudget2040to2049" DOUBLE PRECISION,
    "totalBuildingEmissionsLL84" DOUBLE PRECISION,
    "annualFeeExceedingBudget2024to2029" DOUBLE PRECISION,
    "annualFeeExceedingBudget2030to2034" DOUBLE PRECISION,
    "annualFeeExceedingBudget2035to2039" DOUBLE PRECISION,
    "annualFeeExceedingBudget2040to2049" DOUBLE PRECISION,
    "beCreditBefore2027" DOUBLE PRECISION,
    "beCredit2027to2029" DOUBLE PRECISION,
    "adjustedTotalBuildingEmissions2024to2029" DOUBLE PRECISION,
    "adjustedTotalBuildingEmissions2030to2034" DOUBLE PRECISION,
    "adjustedTotalBuildingEmissions2035to2039" DOUBLE PRECISION,
    "adjustedTotalBuildingEmissions2040to2049" DOUBLE PRECISION,
    "adjustedAnnualFeeBefore2027" DOUBLE PRECISION,
    "adjustedAnnualFee2027to2029" DOUBLE PRECISION,
    "adjustedAnnualFee2030to2034" DOUBLE PRECISION,
    "adjustedAnnualFee2035to2039" DOUBLE PRECISION,
    "adjustedAnnualFee2040to2049" DOUBLE PRECISION,
    "annualLL97FeeAvoidance2024to2027" DOUBLE PRECISION,
    "annualLL97FeeAvoidance2027to2029" DOUBLE PRECISION,
    "annualLL97FeeAvoidance2030to2034" DOUBLE PRECISION,
    "annualLL97FeeAvoidance2035to2039" DOUBLE PRECISION,
    "annualLL97FeeAvoidance2040to2049" DOUBLE PRECISION,
    "simplePaybackPeriod" INTEGER,
    "cumulativeSavingsByYear" JSONB,
    "loanBalanceByYear" JSONB,
    "monthlyPayment" DOUBLE PRECISION,
    "totalInterestPaid" DOUBLE PRECISION,
    "annualBuildingNOI" DOUBLE PRECISION,
    "noiByYearNoUpgrade" JSONB,
    "noiByYearWithUpgrade" JSONB,
    "propertyValueNoUpgrade" DOUBLE PRECISION,
    "propertyValueWithUpgrade" DOUBLE PRECISION,
    "netPropertyValueGain" DOUBLE PRECISION,
    "propertyValueByYearNoUpgrade" JSONB,
    "propertyValueByYearWithUpgrade" JSONB,
    "overriddenFields" JSONB,
    "lastCalculatedService" TEXT,
    "serviceVersions" JSONB,
    "rawPlutoData" JSONB,
    "rawLL84Data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserCalculations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCalculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Calculations_bbl_idx" ON "public"."Calculations"("bbl");

-- CreateIndex
CREATE UNIQUE INDEX "UserCalculations_userId_calculationId_key" ON "public"."UserCalculations"("userId", "calculationId");

-- AddForeignKey
ALTER TABLE "public"."UserIdentityProvider" ADD CONSTRAINT "UserIdentityProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserCalculations" ADD CONSTRAINT "UserCalculations_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "public"."Calculations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
