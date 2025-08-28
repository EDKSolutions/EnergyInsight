-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "bbl" TEXT NOT NULL,
    "experimentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experiment" JSONB NOT NULL,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calculations" (
    "id" TEXT NOT NULL,
    "bbl" TEXT NOT NULL,
    "buildingName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "yearBuilt" TEXT NOT NULL,
    "stories" TEXT NOT NULL,
    "buildingClass" TEXT NOT NULL,
    "taxClass" TEXT NOT NULL,
    "zoning" TEXT NOT NULL,
    "boro" TEXT NOT NULL,
    "totalSquareFeet" TEXT NOT NULL,
    "totalResidentialUnits" TEXT NOT NULL,
    "ptacUnits" TEXT NOT NULL,
    "annualEnergy" TEXT NOT NULL,
    "capRate" TEXT NOT NULL,
    "buildingValue" TEXT NOT NULL,
    "unitMixBreakDown" TEXT NOT NULL,
    "energyProfile" TEXT NOT NULL,
    "siteEUI" TEXT NOT NULL,
    "occupancyRate" TEXT NOT NULL,
    "maintenanceCost" TEXT NOT NULL,
    "rawPlutoData" JSONB,
    "rawLL84Data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCalculations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCalculations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Calculations_bbl_idx" ON "Calculations"("bbl");

-- CreateIndex
CREATE UNIQUE INDEX "UserCalculations_userId_calculationId_key" ON "UserCalculations"("userId", "calculationId");

-- AddForeignKey
ALTER TABLE "UserCalculations" ADD CONSTRAINT "UserCalculations_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
