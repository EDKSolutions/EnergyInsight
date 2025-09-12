import { prisma } from '@/lib/prisma';
import { fetchBblNumber } from './geo-client';
import { getPlutoDataByBbl, getLocalLaw84DataByBbl, PlutoData, LocalLaw84Data } from './open-data-nyc';
import { UnitBreakdownService } from '../ai/services/unit-breakdown.service';
import { CreateCalculationInputDto } from '../types/dtos';
import { UnitBreakdownResult, PlutoRecord } from '../ai/types';
import { calculationDependencyManager } from '../calculations/services/calculation-dependency-manager';

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

    // Execute all calculation services to populate the new database fields
    console.log('Executing all calculation services for new calculation:', calculation.id);
    try {
      await calculationDependencyManager.executeAllServices(calculation.id);
      console.log('Successfully executed all calculation services');
    } catch (error) {
      console.error('Error executing calculation services:', error);
      // Don't throw - we still want to return the calculation even if services fail
      // The services can be re-run later via the API endpoints
    }

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
  console.log('PLUTO data types:', {
    yearbuilt: typeof plutoData.yearbuilt,
    yearbuiltValue: plutoData.yearbuilt,
    numfloors: typeof plutoData.numfloors,
    numfloorsValue: plutoData.numfloors,
    bldgarea: typeof plutoData.bldgarea,
    bldgareaValue: plutoData.bldgarea,
    unitsres: typeof plutoData.unitsres,
    unitsresValue: plutoData.unitsres
  });
  
  const calculation = await prisma.calculations.create({
    data: {
      // AI Unit Breakdown Results
      ptacUnits: analysisResult.ptacUnits,
      capRate: parseFloat(analysisResult.capRate),
      buildingValue: parseFloat(analysisResult.buildingValue),
      unitMixBreakDown: JSON.stringify(analysisResult.unitBreakdown),

      // Store AI analysis metadata
      unitBreakdownSource: 'AI-Assumed',
      aiAnalysisNotes: analysisResult.notes,

      // Building characteristics from PLUTO - these should always be present
      bbl: bbl,
      address: addressData.address,
      yearBuilt: typeof plutoData.yearbuilt === 'string' ? parseInt(plutoData.yearbuilt) : plutoData.yearbuilt || (() => { throw new Error('yearbuilt missing from PLUTO data') })(),
      stories: typeof plutoData.numfloors === 'string' ? parseInt(plutoData.numfloors) : plutoData.numfloors || (() => { throw new Error('numfloors missing from PLUTO data') })(),
      buildingClass: plutoData.bldgclass || (() => { throw new Error('bldgclass missing from PLUTO data') })(),
      boro: plutoData.borough || (() => { throw new Error('borough missing from PLUTO data') })(),
      totalSquareFeet: typeof plutoData.bldgarea === 'string' ? parseFloat(plutoData.bldgarea) : plutoData.bldgarea || (() => { throw new Error('bldgarea missing from PLUTO data') })(),
      totalResidentialUnits: typeof plutoData.unitsres === 'string' ? parseInt(plutoData.unitsres) : plutoData.unitsres || (() => { throw new Error('unitsres missing from PLUTO data') })(),
      
      // Extract LL84 emissions data
      totalBuildingEmissionsLL84: ll84Data?.total_location_based_ghg 
        ? parseFloat(ll84Data.total_location_based_ghg)
        : (ll84Data?.total_ghg_emissions 
          ? parseFloat(ll84Data.total_ghg_emissions)
          : null),
      
      rawPlutoData: JSON.parse(JSON.stringify(plutoData)),
      rawLL84Data: ll84Data
        ? JSON.parse(JSON.stringify(ll84Data))
        : undefined,
      
      // Initialize service metadata
      serviceVersions: {
        'ai-breakdown': '1.0.0',
      },
      lastCalculatedService: 'ai-breakdown',

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