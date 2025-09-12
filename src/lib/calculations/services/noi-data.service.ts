/**
 * NOI Data Service
 * Handles fetching NOI from three sources per LaTeX Section 9:
 * 1. NYC Cooperative API (for building classes C0-C9)
 * 2. NYC Condominium API (for building classes R4, R5, R6A-R9B, D4-D9)
 * 3. RGB Study data (for all other residential buildings)
 */

import { isRentStabilized, getLocationCategory, getBuildingSizeCategory, getBuildingEraCategory, BoroughCode, BoroughName, isCooperativeBuilding, isCondominiumBuilding } from '../constants/noi-constants';
import rgbStudyData from '@/lib/data/nyc_noi_2023_per_unit_month.json';

export interface NOIDataInput {
  bbl: string;
  buildingClass: string;
  unitsRes: number;
  yearBuilt: number;
  borough: BoroughCode | BoroughName; // Accept both codes (MN, BK) and names (Manhattan, Brooklyn)
  communityDistrict?: number;
  numFloors: number;
}

export interface NOIResult {
  annualBuildingNOI: number;
  source: 'cooperative_api' | 'condominium_api' | 'rgb_study';
  details?: {
    noiPerUnitPerMonth?: number;
    rentStabilized?: boolean;
    locationCategory?: string;
    sizeCategory?: string;
    eraCategory?: string;
  };
}


export class NOIDataService {
  
  /**
   * Main method to determine NOI from appropriate source
   * 🔍 BREAKPOINT: This is where NOI source determination happens
   */
  async getAnnualBuildingNOI(input: NOIDataInput): Promise<NOIResult> {
    console.log(`[NOI Data Service] Determining NOI source for BBL ${input.bbl}, Building Class: ${input.buildingClass}`);
    
    // Step 1: Check building class to determine source
    if (isCooperativeBuilding(input.buildingClass)) {
      console.log(`[NOI Data Service] Building class ${input.buildingClass} is Cooperative - calling Cooperative API`);
      return await this.fetchCooperativeNOI(input.bbl);
    }
    
    if (isCondominiumBuilding(input.buildingClass)) {
      console.log(`[NOI Data Service] Building class ${input.buildingClass} is Condominium - calling Condominium API`);
      return await this.fetchCondominiumNOI(input.bbl);
    }
    
    // Step 2: Use RGB Study fallback for all other residential buildings
    console.log(`[NOI Data Service] Building class ${input.buildingClass} - using RGB Study data`);
    return this.calculateRGBStudyNOI(input);
  }
  
  /**
   * Fetch NOI from NYC Cooperative API (Building Classes C0-C9)
   * Source: https://data.cityofnewyork.us/resource/myei-c3fa.json
   */
  private async fetchCooperativeNOI(bbl: string): Promise<NOIResult> {
    try {
      const url = `https://data.cityofnewyork.us/resource/myei-c3fa.json?bbl=${bbl}`;
      console.log(`[NOI Data Service] Fetching from Cooperative API: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error(`No cooperative data found for BBL ${bbl}`);
      }
      
      const noiValue = parseFloat(data[0].net_operating_income);
      if (isNaN(noiValue) || noiValue <= 0) {
        throw new Error(`Invalid NOI value from Cooperative API: ${data[0].net_operating_income}`);
      }
      
      console.log(`[NOI Data Service] Successfully fetched Cooperative NOI: $${noiValue.toLocaleString()}`);
      
      return {
        annualBuildingNOI: noiValue,
        source: 'cooperative_api'
      };
    } catch (error) {
      console.error(`[NOI Data Service] Failed to fetch Cooperative NOI for BBL ${bbl}:`, error);
      throw error;
    }
  }
  
  /**
   * Fetch NOI from NYC Condominium API (Building Classes R4, R5, R6A-R9B, D4-D9)
   * Source: https://data.cityofnewyork.us/resource/9ck6-2jew.json
   */
  private async fetchCondominiumNOI(bbl: string): Promise<NOIResult> {
    try {
      const url = `https://data.cityofnewyork.us/resource/9ck6-2jew.json?bbl=${bbl}`;
      console.log(`[NOI Data Service] Fetching from Condominium API: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error(`No condominium data found for BBL ${bbl}`);
      }
      
      const noiValue = parseFloat(data[0].net_operating_income);
      if (isNaN(noiValue) || noiValue <= 0) {
        throw new Error(`Invalid NOI value from Condominium API: ${data[0].net_operating_income}`);
      }
      
      console.log(`[NOI Data Service] Successfully fetched Condominium NOI: $${noiValue.toLocaleString()}`);
      
      return {
        annualBuildingNOI: noiValue,
        source: 'condominium_api'
      };
    } catch (error) {
      console.error(`[NOI Data Service] Failed to fetch Condominium NOI for BBL ${bbl}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate NOI from RGB Study data (fallback for all other residential buildings)
   * Source: nyc_noi_2023_per_unit_month.json
   */
  private calculateRGBStudyNOI(input: NOIDataInput): NOIResult {
    console.log(`[NOI Data Service] Calculating RGB Study NOI for ${input.unitsRes} units`);
    
    // Step 1: Determine rent stabilization status
    const rentStabilized = isRentStabilized(
      input.bbl,
      {
        yearBuilt: input.yearBuilt,
        numFloors: input.numFloors,
        bldgClass: input.buildingClass
      },
      new Set() // TODO: Load actual rent stabilized BBL registry
    );
    
    // Step 2: Determine location category
    const locationCategory = getLocationCategory(input.borough, input.communityDistrict);
    
    // Step 3: Determine building size bucket
    const sizeCategory = getBuildingSizeCategory(input.unitsRes);
    
    // Step 4: Determine era (for stabilized buildings only)
    const eraCategory = rentStabilized ? getBuildingEraCategory(input.yearBuilt) : null;
    
    console.log(`[NOI Data Service] RGB Study lookup: Location=${locationCategory}, Rent Stabilized=${rentStabilized}, Size=${sizeCategory}, Era=${eraCategory}`);
    
    // Step 5: Look up NOI per unit per month from RGB Study data
    const noiPerUnitPerMonth = this.lookupRGBStudyValue(locationCategory, rentStabilized, sizeCategory, eraCategory);
    
    // Step 6: Calculate annual building NOI
    const annualBuildingNOI = noiPerUnitPerMonth * input.unitsRes * 12;
    
    console.log(`[NOI Data Service] RGB Study calculation: $${noiPerUnitPerMonth}/unit/month × ${input.unitsRes} units × 12 months = $${annualBuildingNOI.toLocaleString()}`);
    
    return {
      annualBuildingNOI,
      source: 'rgb_study',
      details: {
        noiPerUnitPerMonth,
        rentStabilized,
        locationCategory,
        sizeCategory,
        eraCategory: eraCategory || 'N/A'
      }
    };
  }
  
  /**
   * Look up NOI value from RGB Study JSON data
   */
  private lookupRGBStudyValue(
    locationCategory: string,
    rentStabilized: boolean,
    sizeCategory: string,
    eraCategory: string | null
  ): number {
    const data = rgbStudyData.data as Record<string, unknown>;
    
    // Get location data
    const locationData = data[locationCategory];
    if (!locationData) {
      throw new Error(`Location category '${locationCategory}' not found in RGB Study data`);
    }
    
    // Get tenure data (stabilized vs market_rate)
    const tenureKey = rentStabilized ? 'stabilized' : 'market_rate';
    const tenureData = locationData[tenureKey];
    if (!tenureData) {
      throw new Error(`Tenure '${tenureKey}' not found for location '${locationCategory}'`);
    }
    
    let eraData;
    if (rentStabilized && eraCategory) {
      // For stabilized buildings, use specific era
      eraData = tenureData[eraCategory];
      if (!eraData) {
        console.warn(`[NOI Data Service] Era '${eraCategory}' not found, falling back to 'all'`);
        eraData = tenureData['all'];
      }
    } else {
      // For market rate buildings, no era distinction
      eraData = tenureData;
    }
    
    if (!eraData) {
      throw new Error(`Era data not found for lookup`);
    }
    
    // Get size bucket value
    const sizeData = eraData.by_size || eraData;
    const noiValue = sizeData[sizeCategory];
    
    if (noiValue === null || noiValue === undefined) {
      console.warn(`[NOI Data Service] Size category '${sizeCategory}' not available, using overall average`);
      return eraData.overall || tenureData.overall;
    }
    
    return noiValue;
  }
  
}

export const noiDataService = new NOIDataService();