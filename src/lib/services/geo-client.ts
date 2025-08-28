export async function fetchBblNumber(data: {
  houseNumber: string;
  street: string;
  borough: string;
  zip?: string;
}): Promise<string | undefined> {
  console.log('Fetching BBL number', {
    houseNumber: data.houseNumber,
    street: data.street,
    borough: data.borough,
    zip: data.zip,
  });

  const url = new URL('https://api.nyc.gov/geo/geoclient/v2/address.json');
  const apiKey = process.env.GEO_CLIENT_API_KEY;

  if (!apiKey) {
    console.error('GEO_CLIENT_API_KEY is not set');
    throw new Error('GEO_CLIENT_API_KEY is not set');
  }

  url.searchParams.append('houseNumber', data.houseNumber);
  url.searchParams.append('street', data.street);
  url.searchParams.append('borough', data.borough);
  if (data.zip) {
    url.searchParams.append('zip', data.zip);
  }

  try {
    console.log(`Making request to GeoClient API: ${url}`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('GeoClient API response received', data);
    return data.address?.bbl;
  } catch (error) {
    console.error(
      `Error fetching BBL number: ${(error as Error).message}`,
      error,
    );
    return undefined;
  }
}