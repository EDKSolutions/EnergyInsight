export interface PlutoData {
  bbl: string;
  bldgclass: string;
  resarea: number;
  unitsres: number;
  unitstotal?: number;
  borough: string;
  lotarea?: number;
  bldgarea?: number;
  yearbuilt?: number;
  landuse?: string;
  numfloors?: number;
  lotdepth?: number;
  lotfront?: number;
  zip?: string;
  address?: string;
  zonedist1?: string;
  zone?: string;
  ownername?: string;
  taxclass?: string;
  [key: string]: unknown;
}

export interface LocalLaw84Data {
  nyc_borough_block_and_lot: string;
  property_name?: string;
  parent_property_id?: string;
  property_id?: string;
  report_year: string;
  property_gfa?: string;
  energy_star_score?: string;
  site_eui?: string;
  weather_normalized_site_eui?: string;
  source_eui?: string;
  weather_normalized_source_eui?: string;
  total_ghg_emissions?: string;
  electricity_use?: string;
  natural_gas_use?: string;
  district_steam_use?: string;
  fuel_oil_2_use?: string;
  fuel_oil_4_use?: string;
  fuel_oil_6_use?: string;
  diesel_2_use?: string;
  kerosene_use?: string;
  propane_use?: string;
  district_hot_water_use?: string;
  district_chilled_water_use?: string;
  other_fuel_use?: string;
  [key: string]: unknown;
}

export interface CooperativeNoiData {
  boro_block_lot: string;
  net_operating_income?: string;
  estimated_gross_income?: string;
  estimated_expense?: string;
  report_year?: string;
  address?: string;
  building_classification?: string;
  total_units?: string;
  year_built?: string;
  gross_sqft?: string;
  [key: string]: unknown;
}

export interface CondominiumNoiData {
  boro_block_lot: string;
  net_operating_income?: string;
  estimated_gross_income?: string;
  estimated_expense?: string;
  report_year?: string;
  address?: string;
  building_classification?: string;
  total_units?: string;
  year_built?: string;
  gross_sqft?: string;
  [key: string]: unknown;
}

const plutoBaseUrl = 'https://data.cityofnewyork.us/resource/64uk-42ks.json';
const localLaw84BaseUrl = 'https://data.cityofnewyork.us/resource/5zyy-y8am.json';
const cooperativeNoiBaseUrl = 'https://data.cityofnewyork.us/resource/myei-c3fa.json';
const condominiumNoiBaseUrl = 'https://data.cityofnewyork.us/resource/9ck6-2jew.json';

export async function getPlutoDataByBbl(bbl: string): Promise<PlutoData | null> {
  console.log(`Fetching PLUTO data for BBL: ${bbl}`);

  const url = new URL(plutoBaseUrl);
  url.searchParams.append('bbl', bbl);

  try {
    console.log(`Making request to PLUTO API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('PLUTO API response received', data);

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    if (data.length > 1) {
      console.warn(
        `Multiple PLUTO records found for BBL ${bbl}: ${data.length} records`,
      );
    }

    return data[0];
  } catch (error) {
    console.error(
      `Error fetching PLUTO data: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

function formatBblForLocalLaw84(bbl: string): string {
  const cleanBbl = bbl.replace(/[^0-9]/g, '');

  if (cleanBbl.length !== 10) {
    throw new Error('BBL must be exactly 10 digits');
  }

  const borough = cleanBbl.slice(0, 1);
  const block = cleanBbl.slice(1, 6);
  const lot = cleanBbl.slice(6);

  return `${borough}-${block}-${lot}`;
}

export async function getLocalLaw84DataByBbl(bbl: string): Promise<LocalLaw84Data | null> {
  const formattedBbl = formatBblForLocalLaw84(bbl);
  console.log(`Fetching Local Law 84 data for BBL: ${formattedBbl}`);

  const url = new URL(localLaw84BaseUrl);
  url.searchParams.append('nyc_borough_block_and_lot', formattedBbl);

  try {
    console.log(`Making request to Local Law 84 API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Local Law 84 API response received', data);

    if (Array.isArray(data) && data.length > 0) {
      const sortedData = data.sort(
        (a: LocalLaw84Data, b: LocalLaw84Data) =>
          parseInt(b.report_year) - parseInt(a.report_year),
      );
      return sortedData[0];
    }

    return data || null;
  } catch (error) {
    console.error(
      `Error fetching Local Law 84 data: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

export async function getCooperativeNoiByBbl(bbl: string): Promise<CooperativeNoiData | null> {
  const formattedBbl = formatBblForLocalLaw84(bbl); // Use same format as LL84 (with dashes)
  console.log(`Fetching Cooperative NOI data for BBL: ${formattedBbl}`);

  const url = new URL(cooperativeNoiBaseUrl);
  url.searchParams.append('boro_block_lot', formattedBbl); // Use correct parameter name

  try {
    console.log(`Making request to Cooperative NOI API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 400) {
        console.warn(`BBL ${formattedBbl} not found in Cooperative NOI dataset (400 error)`);
        return null; // Return null instead of throwing for missing data
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Cooperative NOI API response received', data);

    if (Array.isArray(data) && data.length > 0) {
      const sortedData = data.sort(
        (a: CooperativeNoiData, b: CooperativeNoiData) =>
          parseInt(b.report_year || '0') - parseInt(a.report_year || '0'),
      );
      return sortedData[0];
    }

    return data || null;
  } catch (error) {
    console.error(
      `Error fetching Cooperative NOI data: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}

export async function getCondominiumNoiByBbl(bbl: string): Promise<CondominiumNoiData | null> {
  const formattedBbl = formatBblForLocalLaw84(bbl); // Use same format as LL84 (with dashes)
  console.log(`Fetching Condominium NOI data for BBL: ${formattedBbl}`);

  const url = new URL(condominiumNoiBaseUrl);
  url.searchParams.append('boro_block_lot', formattedBbl); // Use correct parameter name

  try {
    console.log(`Making request to Condominium NOI API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 400) {
        console.warn(`BBL ${formattedBbl} not found in Condominium NOI dataset (400 error)`);
        return null; // Return null instead of throwing for missing data
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Condominium NOI API response received', data);

    if (Array.isArray(data) && data.length > 0) {
      const sortedData = data.sort(
        (a: CondominiumNoiData, b: CondominiumNoiData) =>
          parseInt(b.report_year || '0') - parseInt(a.report_year || '0'),
      );
      return sortedData[0];
    }

    return data || null;
  } catch (error) {
    console.error(
      `Error fetching Condominium NOI data: ${(error as Error).message}`,
      error,
    );
    throw error;
  }
}