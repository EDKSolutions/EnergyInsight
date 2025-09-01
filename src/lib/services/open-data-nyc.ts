export interface PlutoData {
  bbl: string;
  bldgclass: string;
  resarea: number;
  unitsres: number;
  unitstotal?: number;
  boro: string;
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

const plutoBaseUrl = 'https://data.cityofnewyork.us/resource/64uk-42ks.json';
const localLaw84BaseUrl = 'https://data.cityofnewyork.us/resource/5zyy-y8am.json';

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