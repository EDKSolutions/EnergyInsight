import { prisma } from '@/lib/prisma';
import { fetchBblNumber } from './geo-client';
import { getPlutoDataByBbl, getLocalLaw84DataByBbl, PlutoData, LocalLaw84Data } from './open-data-nyc';
import { UnitBreakdownService } from '../ai/services/unit-breakdown.service';
import { CreateCalculationInputDto } from '../types/dtos';
import { UnitBreakdownResult, PlutoRecord } from '../ai/types';

const unitBreakdownService = new UnitBreakdownService();

export async function createCalculation(
  userId: string,
  addressData: CreateCalculationInputDto,
) {
  console.log(`Creating calculation for user ${userId}`, {
    ...addressData,
  });

  try {
    console.log('Fetching BBL from GeoClient');
    const bbl = await fetchBblNumber(addressData);
    if (!bbl) {
      console.warn(`BBL not found for address: ${addressData.address}`);
      throw new Error('cannot find BBL');
    }
    console.log(`Found BBL: ${bbl}`);

    const { plutoData, ll84Data } = await fetchBuildingData(bbl);

    // Map PlutoData to PlutoRecord format
    const plutoRecord: PlutoRecord = {
      bldgclass: plutoData.bldgclass,
      resarea: plutoData.resarea,
      unitsres: plutoData.unitsres,
      unitstotal: plutoData.unitstotal,
      boro: plutoData.borough, // Map borough to boro
      lotarea: plutoData.lotarea,
      bldgarea: plutoData.bldgarea,
      yearbuilt: plutoData.yearbuilt,
      landuse: plutoData.landuse,
      numfloors: plutoData.numfloors,
      lotdepth: plutoData.lotdepth,
      lotfront: plutoData.lotfront,
      zip: plutoData.zip,
      address: plutoData.address,
      zone: plutoData.zone || plutoData.zonedist1,
      ownername: plutoData.ownername,
    };

    console.log('Running building analysis on PLUTO and LL84 data');
    const analysisResult = await unitBreakdownService.analyzeBuilding(
      plutoRecord,
      ll84Data || undefined,
    );
    console.log('Building analysis completed successfully');

    const calculation = await saveCalculationToDatabase(
      userId,
      addressData,
      bbl,
      analysisResult,
      plutoData,
      ll84Data,
    );

    return calculation;
  } catch (error) {
    console.error(
      `Error creating calculation: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

export async function getUserCalculations(userId: string) {
  console.log(`Fetching calculations for user: ${userId}`);
  try {
    const calculations = await prisma.userCalculations.findMany({
      where: { userId },
      include: { calculation: true },
    });
    console.log(
      `Found ${calculations.length} calculations for user ${userId}`,
    );
    return calculations;
  } catch (error) {
    console.error(
      `Error fetching user calculations: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

export async function modifyCalculation(calculationId: string, data: Record<string, unknown>) {
  console.log(`Modifying calculation ${calculationId}`, data);
  try {
    const calculation = await prisma.calculations.update({
      where: { id: calculationId },
      data,
    });
    console.log(`Calculation ${calculationId} modified successfully`);
    return calculation;
  } catch (error) {
    console.error(
      `Error modifying calculation ${calculationId}: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

async function fetchBuildingData(
  bbl: string,
): Promise<{ plutoData: PlutoData; ll84Data: LocalLaw84Data | null }> {
  console.log(`Fetching PLUTO data for BBL: ${bbl}`);
  const plutoData = await getPlutoDataByBbl(bbl);
  if (!plutoData) {
    console.warn(`No PLUTO data found for BBL: ${bbl}`);
    throw new Error('No PLUTO data found for BBL');
  }
  console.log('PLUTO data retrieved successfully');

  console.log(`Fetching LL84 data for BBL: ${bbl}`);
  const ll84Data = await getLocalLaw84DataByBbl(bbl);
  console.log('LL84 data retrieved successfully');

  return { plutoData, ll84Data };
}

async function saveCalculationToDatabase(
  userId: string,
  addressData: CreateCalculationInputDto,
  bbl: string,
  analysisResult: UnitBreakdownResult,
  plutoData: PlutoData,
  ll84Data: LocalLaw84Data | null,
) {
  console.log('Saving calculation to database');
  const calculation = await prisma.calculations.create({
    data: {
      // Building analysis results
      ptacUnits: analysisResult.ptacUnits.toString(),
      capRate: analysisResult.capRate,
      buildingValue: analysisResult.buildingValue,
      unitMixBreakDown: JSON.stringify(analysisResult.unitBreakdown),
      energyProfile: analysisResult.energyProfile,
      siteEUI: analysisResult.siteEUI,
      occupancyRate: analysisResult.occupancyRate,
      maintenanceCost: analysisResult.maintenanceCost,

      // Section 2.2 - Building-Level PTAC Calculations
      annualBuildingMMBtuCoolingPTAC:
        analysisResult.annualBuildingMMBtuCoolingPTAC,
      annualBuildingMMBtuHeatingPTAC:
        analysisResult.annualBuildingMMBtuHeatingPTAC,
      annualBuildingMMBtuTotalPTAC:
        analysisResult.annualBuildingMMBtuTotalPTAC,

      // Section 3 - PTHP Building Calculations
      annualBuildingMMBtuHeatingPTHP:
        analysisResult.annualBuildingMMBtuHeatingPTHP,
      annualBuildingMMBtuCoolingPTHP:
        analysisResult.annualBuildingMMBtuCoolingPTHP,
      annualBuildingMMBtuTotalPTHP:
        analysisResult.annualBuildingMMBtuTotalPTHP,

      // Section 4 - Energy Reduction Analysis
      energyReductionPercentage: analysisResult.energyReductionPercentage,

      // Section 5 - Retrofit Cost Calculation
      totalRetrofitCost: analysisResult.totalRetrofitCost,

      // Section 6 - Energy Cost Savings Calculation
      annualBuildingThermsHeatingPTAC:
        analysisResult.annualBuildingThermsHeatingPTAC,
      annualBuildingKwhCoolingPTAC:
        analysisResult.annualBuildingKwhCoolingPTAC,
      annualBuildingKwhHeatingPTHP:
        analysisResult.annualBuildingKwhHeatingPTHP,
      annualBuildingKwhCoolingPTHP:
        analysisResult.annualBuildingKwhCoolingPTHP,
      annualBuildingCostPTAC: analysisResult.annualBuildingCostPTAC,
      annualBuildingCostPTHP: analysisResult.annualBuildingCostPTHP,
      annualEnergySavings: analysisResult.annualEnergySavings,

      bbl: bbl,
      buildingName: addressData.address,
      address: addressData.address,
      yearBuilt: plutoData.yearbuilt?.toString() || '',
      stories: plutoData.numfloors?.toString() || '',
      buildingClass: plutoData.bldgclass || '',
      taxClass: '',
      zoning: plutoData.zone || '',
      boro: plutoData.borough || '',
      totalSquareFeet: plutoData.bldgarea?.toString() || '',
      totalResidentialUnits: plutoData.unitsres?.toString() || '',
      rawPlutoData: JSON.parse(JSON.stringify(plutoData)),
      rawLL84Data: ll84Data
        ? JSON.parse(JSON.stringify(ll84Data))
        : undefined,
      users: {
        create: {
          userId,
        },
      },
    },
  });

  console.log(
    `Calculation created successfully with ID: ${calculation.id}`,
  );
  return calculation;
}

export async function getCalculationById(calculationId: string, userId: string) {
  console.log(
    `Searching calculation ${calculationId} for user ${userId}`,
  );
  try {
    const userCalculation = await prisma.userCalculations.findFirst({
      where: {
        userId,
        calculationId,
      },
      include: { calculation: true },
    });
    if (!userCalculation || !userCalculation.calculation) {
      console.warn(
        `Calculation ${calculationId} not found for user ${userId}`,
      );
      return null;
    }
    return userCalculation.calculation;
  } catch (error) {
    console.error(
      `Error searching calculation ${calculationId} for user ${userId}: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}