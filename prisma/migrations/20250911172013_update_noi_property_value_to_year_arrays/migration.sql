/*
  Warnings:

  - You are about to drop the column `currentNOI` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiNoUpgrade2024to2029` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiNoUpgrade2030to2034` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiNoUpgradePost2035` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiWithUpgrade2024to2027` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiWithUpgrade2027to2029` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiWithUpgrade2030to2034` on the `Calculations` table. All the data in the column will be lost.
  - You are about to drop the column `noiWithUpgradePost2035` on the `Calculations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Calculations" DROP COLUMN "currentNOI",
DROP COLUMN "noiNoUpgrade2024to2029",
DROP COLUMN "noiNoUpgrade2030to2034",
DROP COLUMN "noiNoUpgradePost2035",
DROP COLUMN "noiWithUpgrade2024to2027",
DROP COLUMN "noiWithUpgrade2027to2029",
DROP COLUMN "noiWithUpgrade2030to2034",
DROP COLUMN "noiWithUpgradePost2035",
ADD COLUMN     "annualBuildingNOI" DOUBLE PRECISION,
ADD COLUMN     "isRentStabilized" BOOLEAN,
ADD COLUMN     "noiByYearNoUpgrade" JSONB,
ADD COLUMN     "noiByYearWithUpgrade" JSONB,
ADD COLUMN     "propertyValueByYearNoUpgrade" JSONB,
ADD COLUMN     "propertyValueByYearWithUpgrade" JSONB;
