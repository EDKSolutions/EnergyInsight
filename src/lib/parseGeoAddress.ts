export interface GeoAddress {
  number: string;
  street: string;
  borough: string;
  zip?: string;
}

export function parseGeoAddress(address: string): GeoAddress {
  // Ejemplo de entrada: "123 Main St, Brooklyn, NY 11201"
  const result: GeoAddress = {
    number: '',
    street: '',
    borough: '',
  };

  // Separar por comas
  const parts = address.split(',').map(p => p.trim());

  // Buscar número y calle
  if (parts[0]) {
    const match = parts[0].match(/^([0-9]+)\s+(.*)$/);
    if (match) {
      result.number = match[1];
      result.street = match[2];
    } else {
      result.street = parts[0];
    }
  }

  // Borough
  if (parts[1]) {
    result.borough = parts[1];
  }

  // Buscar zip en la última parte (si existe)
  if (parts.length > 2) {
    const zipMatch = parts[2].match(/([0-9]{5})$/);
    if (zipMatch) {
      result.zip = zipMatch[1];
    }
  }

  return result;
} 
