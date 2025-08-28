/*
  Warnings:

  - You are about to drop the column `annualKwhCoolingPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `annualKwhHeatingPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `annualKwhPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `annualMMBtuPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `annualMMBtuPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `annualThermsPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `coefficientOfPerformancePTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `coolingHoursPerDay` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `coolingMMBtuPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `coolingMMBtuPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `dailyKwhCoolingPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `dailyKwhHeatingPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `daysCool` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `daysHeat` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `energyReductionPercentagePTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `heatingHoursPerDay` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `heatingMMBtuPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `heatingMMBtuPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `kwhPerUnitPerHourPTAC` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `kwhPerUnitPerHourPTHP` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `thermsPerUnitPerHour` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `totalAnnualKwhPTHP` on the `Calculations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Calculations" DROP COLUMN "annualKwhCoolingPTHP",
DROP COLUMN "annualKwhHeatingPTHP",
DROP COLUMN "annualKwhPTAC",
DROP COLUMN "annualMMBtuPTAC",
DROP COLUMN "annualMMBtuPTHP",
DROP COLUMN "annualThermsPTAC",
DROP COLUMN "coefficientOfPerformancePTHP",
DROP COLUMN "coolingHoursPerDay",
DROP COLUMN "coolingMMBtuPTAC",
DROP COLUMN "coolingMMBtuPTHP",
DROP COLUMN "dailyKwhCoolingPTHP",
DROP COLUMN "dailyKwhHeatingPTHP",
DROP COLUMN "daysCool",
DROP COLUMN "daysHeat",
DROP COLUMN "energyReductionPercentagePTHP",
DROP COLUMN "heatingHoursPerDay",
DROP COLUMN "heatingMMBtuPTAC",
DROP COLUMN "heatingMMBtuPTHP",
DROP COLUMN "kwhPerUnitPerHourPTAC",
DROP COLUMN "kwhPerUnitPerHourPTHP",
DROP COLUMN "thermsPerUnitPerHour",
DROP COLUMN "totalAnnualKwhPTHP",
ADD COLUMN     "annualBuildingCostPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingCostPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingKwhCoolingPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingKwhCoolingPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingKwhHeatingPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuCoolingPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuCoolingPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuHeatingPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuHeatingPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuTotalPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingMMBtuTotalPTHP" DOUBLE PRECISION,
ADD COLUMN     "annualBuildingThermsHeatingPTAC" DOUBLE PRECISION,
ADD COLUMN     "annualEnergySavings" DOUBLE PRECISION,
ADD COLUMN     "energyReductionPercentage" DOUBLE PRECISION,
ADD COLUMN     "totalRetrofitCost" DOUBLE PRECISION;
