/**
 * Property Use Parser
 * Parses LL84 property use strings into structured data
 */

export interface PropertyUse {
  propertyType: string;
  squareFeet: number;
}

/**
 * Parses LL84 property use string into array of property use objects
 * 
 * @param propertyUseString - String from LL84 list_of_all_property_use field
 * @returns Array of property use objects with type and square footage
 * 
 * @example
 * parsePropertyUse("Office (264550.0), Retail Store (21700.0)")
 * // Returns: [
 * //   { propertyType: "Office", squareFeet: 264550.0 },
 * //   { propertyType: "Retail Store", squareFeet: 21700.0 }
 * // ]
 */
export function parsePropertyUse(propertyUseString: string | undefined | null): PropertyUse[] {
  if (!propertyUseString || propertyUseString.trim() === '') {
    return [];
  }

  const propertyUses: PropertyUse[] = [];
  
  try {
    // Use regex to find all "Property Type (square_feet)" patterns
    // This handles property names that contain commas, like "Personal Services (Health/Beauty, Dry Cleaning, etc.) (500.0)"
    const regex = /([^,()]+(?:\([^)]*\)[^,()]*)*)\s*\(([0-9.,]+)\)/g;
    let match;
    
    while ((match = regex.exec(propertyUseString)) !== null) {
      const propertyType = match[1].trim();
      const squareFeetStr = match[2].replace(/,/g, ''); // Remove commas
      const squareFeet = parseFloat(squareFeetStr);
      
      if (!isNaN(squareFeet) && squareFeet >= 0) {
        propertyUses.push({
          propertyType,
          squareFeet
        });
      } else {
        console.warn(`Invalid square footage in property use entry: ${match[0]}`);
      }
    }
    
    // If the regex approach didn't work, fall back to the original comma-split approach
    // This handles cases where the regex might miss something
    if (propertyUses.length === 0) {
      console.warn(`Regex parsing failed, falling back to comma-split for: ${propertyUseString}`);
      
      const entries = propertyUseString.split(',').map(entry => entry.trim());
      
      for (const entry of entries) {
        if (entry === '') continue;
        
        // Use regex to match "Property Type (square_feet)"
        const fallbackMatch = entry.match(/^(.+?)\s*\(([0-9.,]+)\)$/);
        
        if (fallbackMatch) {
          const propertyType = fallbackMatch[1].trim();
          const squareFeetStr = fallbackMatch[2].replace(/,/g, ''); // Remove commas
          const squareFeet = parseFloat(squareFeetStr);
          
          if (!isNaN(squareFeet) && squareFeet >= 0) {
            propertyUses.push({
              propertyType,
              squareFeet
            });
          } else {
            console.warn(`Invalid square footage in property use entry: ${entry}`);
          }
        } else {
          console.warn(`Unable to parse property use entry: ${entry}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error parsing property use string: ${propertyUseString}`, error);
  }
  
  return propertyUses;
}


/**
 * Normalizes property type names to match LL97 ESPM mapping
 * Maps common variations to standardized property type names
 */
export function normalizePropertyType(propertyType: string): string {
  const normalized = propertyType.trim();
  
  // Add common normalizations here as we discover them
  const normalizations: Record<string, string> = {
    // Common variations
    'Multi-family Housing': 'Multifamily Housing',
    'Multi-Family Housing': 'Multifamily Housing',
    'MultiFamily Housing': 'Multifamily Housing',
    'Pre-school/Daycare': 'Pre-school/Daycare',
    'Preschool/Daycare': 'Pre-school/Daycare',
    'K-12 School': 'K-12 School',
    'K12 School': 'K-12 School',
    
    // Handle verbose LL84 property type names
    'Personal Services (Health/Beauty, Dry Cleaning, etc.)': 'Personal Services',
    
    // Handle generic "Other" category - map to Office as fallback (has proper limits for all periods)
    'Other': 'Office',
    
    // Add more as needed
  };
  
  return normalizations[normalized] || normalized;
}