// This configuration is for server-side use only
// swagger-jsdoc uses Node.js modules that can't run in browser

export const swaggerDefinition = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Energy Insight API',
      version: '1.0.0',
      description: 'API for NYC building energy efficiency analysis and PTAC to PTHP conversion calculations',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'AWS Cognito JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'cuid',
              example: 'cl9ebd03y0000qz08z8z8z8z8',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              nullable: true,
              example: 'John Doe'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z'
            },
            deletedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: null
            }
          },
          required: ['id', 'email', 'createdAt', 'updatedAt']
        },
        Calculation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
              description: 'Unique calculation identifier'
            },
            bbl: {
              type: 'string',
              example: '1234567890',
              description: 'NYC Building Block and Lot number'
            },
            address: {
              type: 'string',
              example: '123 Main Street, Manhattan',
              description: 'Full building address'
            },
            yearBuilt: {
              type: 'integer',
              example: 1930,
              description: 'Year the building was constructed'
            },
            stories: {
              type: 'integer',
              example: 6,
              description: 'Number of stories in the building'
            },
            buildingClass: {
              type: 'string',
              example: 'R4',
              description: 'NYC building class code'
            },
            boro: {
              type: 'string',
              example: 'Manhattan',
              description: 'NYC borough'
            },
            totalSquareFeet: {
              type: 'number',
              format: 'float',
              example: 10000.0,
              description: 'Total building square footage'
            },
            totalResidentialUnits: {
              type: 'integer',
              example: 10,
              description: 'Total number of residential units'
            },
            ptacUnits: {
              type: 'integer',
              example: 8,
              description: 'Number of units with PTAC systems'
            },
            capRate: {
              type: 'number',
              format: 'float',
              example: 5.5,
              description: 'Capitalization rate percentage'
            },
            buildingValue: {
              type: 'number',
              format: 'float',
              example: 1000000.0,
              description: 'Total building value in USD'
            },
            unitMixBreakDown: {
              type: 'string',
              example: '{"studio": 2, "one_bed": 4, "two_bed": 3, "three_plus": 1}',
              description: 'JSON string describing unit type distribution'
            },
            annualBuildingMMBtuCoolingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 1234.56,
              description: 'Annual building cooling energy consumption in MMBtu for PTAC systems'
            },
            annualBuildingMMBtuHeatingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 2550.00,
              description: 'Annual building heating energy consumption in MMBtu for PTAC systems'
            },
            annualBuildingMMBtuTotalPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 3784.56,
              description: 'Total annual building energy consumption in MMBtu for PTAC systems'
            },
            annualBuildingMMBtuHeatingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 1200.50,
              description: 'Annual building heating energy consumption in MMBtu for PTHP systems'
            },
            annualBuildingMMBtuCoolingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 1234.56,
              description: 'Annual building cooling energy consumption in MMBtu for PTHP systems'
            },
            annualBuildingMMBtuTotalPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 2435.06,
              description: 'Total annual building energy consumption in MMBtu for PTHP systems'
            },
            energyReductionPercentage: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 35.67,
              description: 'Percentage energy reduction from PTAC to PTHP conversion'
            },
            totalRetrofitCost: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 68200.00,
              description: 'Total cost for PTAC to PTHP retrofit in USD'
            },
            annualBuildingThermsHeatingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 25500.00,
              description: 'Annual building gas heating consumption in therms for PTAC systems'
            },
            annualBuildingKwhCoolingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 1600,
              description: 'Annual building electric cooling consumption in kWh for PTAC systems'
            },
            annualBuildingKwhHeatingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 21428.57,
              description: 'Annual building electric heating consumption in kWh for PTHP systems'
            },
            annualBuildingKwhCoolingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 1600,
              description: 'Annual building electric cooling consumption in kWh for PTHP systems'
            },
            annualBuildingCostPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 77000.00,
              description: 'Annual building energy costs for PTAC systems in USD'
            },
            annualBuildingCostPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 45357.14,
              description: 'Annual building energy costs for PTHP systems in USD'
            },
            annualEnergySavings: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 31642.86,
              description: 'Annual energy cost savings from PTAC to PTHP conversion in USD'
            },
            rawPlutoData: {
              type: 'object',
              nullable: true,
              example: { "field1": "value1", "field2": "value2" },
              description: 'Raw PLUTO API response data'
            },
            rawLL84Data: {
              type: 'object',
              nullable: true,
              example: { "field1": "value1", "field2": "value2" },
              description: 'Raw Local Law 84 API response data'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
              description: 'Calculation creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00.000Z',
              description: 'Calculation last update timestamp'
            }
          },
          required: [
            'id', 'bbl', 'address', 'yearBuilt', 
            'stories', 'buildingClass', 'boro',
            'totalSquareFeet', 'totalResidentialUnits', 'ptacUnits',
            'capRate', 'buildingValue', 'unitMixBreakDown', 'createdAt', 'updatedAt'
          ]
        },
        CalculationInput: {
          type: 'object',
          properties: {
            houseNumber: {
              type: 'string',
              example: '123',
              description: 'Street number of the building'
            },
            street: {
              type: 'string',
              example: 'Main Street',
              description: 'Street name'
            },
            borough: {
              type: 'string',
              example: 'Manhattan',
              enum: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
              description: 'NYC borough name'
            },
            address: {
              type: 'string',
              example: '123 Main Street, Manhattan, NY',
              description: 'Complete building address'
            }
          },
          required: ['houseNumber', 'street', 'borough', 'address']
        },
        GeoClientResponse: {
          type: 'object',
          properties: {
            bbl: {
              type: 'string',
              example: '1234567890',
              description: 'Building Block and Lot number'
            },
            address: {
              type: 'string',
              example: '123 MAIN STREET',
              description: 'Standardized address'
            },
            borough: {
              type: 'string',
              example: 'MANHATTAN',
              description: 'Borough name'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message description'
            }
          },
          required: ['error']
        },
        ServiceExecutionResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Service executed successfully'
            },
            calculationId: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
            },
            warnings: {
              type: 'array',
              items: {
                type: 'string'
              },
              nullable: true,
              example: ['Warning: Site EUI value may be inaccurate']
            }
          },
          required: ['message', 'calculationId']
        },
        EnergyCalculationData: {
          type: 'object',
          properties: {
            calculationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique calculation identifier'
            },
            lastCalculated: {
              type: 'string',
              format: 'date-time',
              description: 'When energy calculations were last updated'
            },
            serviceVersion: {
              type: 'string',
              description: 'Version of energy calculation service used'
            },
            eflhHours: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Equivalent Full Load Hours for energy calculations'
            },
            annualBuildingMMBtuCoolingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual cooling energy consumption for PTAC systems (MMBtu)'
            },
            annualBuildingMMBtuHeatingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual heating energy consumption for PTAC systems (MMBtu)'
            },
            annualBuildingMMBtuTotalPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Total annual energy consumption for PTAC systems (MMBtu)'
            },
            annualBuildingMMBtuHeatingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual heating energy consumption for PTHP systems (MMBtu)'
            },
            annualBuildingMMBtuCoolingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual cooling energy consumption for PTHP systems (MMBtu)'
            },
            annualBuildingMMBtuTotalPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Total annual energy consumption for PTHP systems (MMBtu)'
            },
            energyReductionPercentage: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Percentage energy reduction from PTAC to PTHP conversion'
            },
            totalRetrofitCost: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Total cost for PTAC to PTHP retrofit (USD)'
            },
            annualEnergySavings: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual energy cost savings from conversion (USD)'
            }
          },
          required: ['calculationId', 'lastCalculated', 'serviceVersion']
        },
        EnergyCalculationOverrides: {
          type: 'object',
          properties: {
            siteEUI: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Override for Site Energy Use Intensity'
            },
            ptacUnits: {
              type: 'number',
              nullable: true,
              description: 'Override for number of PTAC units'
            },
            electricityCost: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Override for electricity cost per kWh'
            },
            gasCost: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Override for gas cost per therm'
            }
          }
        },
        LL97CalculationData: {
          type: 'object',
          properties: {
            calculationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique calculation identifier'
            },
            lastCalculated: {
              type: 'string',
              format: 'date-time',
              description: 'When LL97 calculations were last updated'
            },
            serviceVersion: {
              type: 'string',
              description: 'Version of LL97 calculation service used'
            },
            currentEmissionIntensity: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Current building emission intensity (kgCO2e/sqft/year)'
            },
            ll97Limit: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'LL97 emission limit for building (kgCO2e/sqft/year)'
            },
            annualLL97FeeAvoidance2024to2027: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual LL97 fee avoidance 2024-2027 period (USD)'
            },
            annualLL97FeeAvoidance2027to2029: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual LL97 fee avoidance 2027-2029 period (USD)'
            },
            annualLL97FeeAvoidance2030plus: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual LL97 fee avoidance 2030+ period (USD)'
            }
          },
          required: ['calculationId', 'lastCalculated', 'serviceVersion']
        },
        FinancialCalculationData: {
          type: 'object',
          properties: {
            calculationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique calculation identifier'
            },
            lastCalculated: {
              type: 'string',
              format: 'date-time',
              description: 'When financial calculations were last updated'
            },
            serviceVersion: {
              type: 'string',
              description: 'Version of financial calculation service used'
            },
            totalRetrofitCost: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Total retrofit investment cost (USD)'
            },
            annualEnergySavings: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Annual energy cost savings (USD)'
            },
            simplePaybackPeriod: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Simple payback period in years'
            },
            npv10Year: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: '10-year Net Present Value (USD)'
            },
            irr10Year: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: '10-year Internal Rate of Return (%)'
            }
          },
          required: ['calculationId', 'lastCalculated', 'serviceVersion']
        },
        NOICalculationData: {
          type: 'object',
          properties: {
            calculationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique calculation identifier'
            },
            lastCalculated: {
              type: 'string',
              format: 'date-time',
              description: 'When NOI calculations were last updated'
            },
            serviceVersion: {
              type: 'string',
              description: 'Version of NOI calculation service used'
            },
            currentNOI: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Current Net Operating Income (USD)'
            },
            projectedNOIIncrease: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Projected NOI increase from energy savings (USD)'
            },
            noiCalculationMethod: {
              type: 'string',
              nullable: true,
              enum: ['coop_api', 'condo_api', 'rental_calculation'],
              description: 'Method used for NOI calculation'
            }
          },
          required: ['calculationId', 'lastCalculated', 'serviceVersion']
        },
        PropertyValueCalculationData: {
          type: 'object',
          properties: {
            calculationId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique calculation identifier'
            },
            lastCalculated: {
              type: 'string',
              format: 'date-time',
              description: 'When property value calculations were last updated'
            },
            serviceVersion: {
              type: 'string',
              description: 'Version of property value calculation service used'
            },
            currentPropertyValue: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Current property value (USD)'
            },
            propertyValueIncrease: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Property value increase from retrofit (USD)'
            },
            capRate: {
              type: 'number',
              format: 'float',
              nullable: true,
              description: 'Capitalization rate used in calculation (%)'
            }
          },
          required: ['calculationId', 'lastCalculated', 'serviceVersion']
        },
        ServiceExecutionRequest: {
          type: 'object',
          properties: {
            executeAll: {
              type: 'boolean',
              description: 'Execute all services in dependency order',
              default: true
            },
            fromService: {
              type: 'string',
              enum: ['ai-breakdown', 'energy', 'll97', 'financial', 'noi', 'property-value'],
              description: 'Start execution from this service and cascade to dependents'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  }
};
