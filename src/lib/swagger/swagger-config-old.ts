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
          ? 'https://your-domain.com/api'
          : 'http://localhost:3000/api',
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
            buildingName: {
              type: 'string',
              example: '123 Main Street, Manhattan',
              description: 'Building name or address'
            },
            address: {
              type: 'string',
              example: '123 Main Street, Manhattan',
              description: 'Full building address'
            },
            yearBuilt: {
              type: 'string',
              example: '1930',
              description: 'Year the building was constructed'
            },
            stories: {
              type: 'string',
              example: '6',
              description: 'Number of stories in the building'
            },
            buildingClass: {
              type: 'string',
              example: 'R4',
              description: 'NYC building class code'
            },
            taxClass: {
              type: 'string',
              example: '2',
              description: 'NYC tax class'
            },
            zoning: {
              type: 'string',
              example: 'R6',
              description: 'Zoning district designation'
            },
            boro: {
              type: 'string',
              example: 'Manhattan',
              description: 'NYC borough'
            },
            totalSquareFeet: {
              type: 'string',
              example: '10000',
              description: 'Total building square footage'
            },
            totalResidentialUnits: {
              type: 'string',
              example: '10',
              description: 'Total number of residential units'
            },
            ptacUnits: {
              type: 'string',
              example: '8',
              description: 'Number of units with PTAC systems'
            },
            capRate: {
              type: 'string',
              example: '5.5',
              description: 'Capitalization rate percentage'
            },
            buildingValue: {
              type: 'string',
              example: '1000000',
              description: 'Total building value in USD'
            },
            unitMixBreakDown: {
              type: 'string',
              example: '{"studio": 2, "one_bed": 4, "two_bed": 3, "three_plus": 1}',
              description: 'JSON string describing unit type distribution'
            },
            energyProfile: {
              type: 'string',
              example: '{"electric": "60%", "gas": "40%"}',
              description: 'JSON string describing energy usage profile'
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
            annualBuildingkWhCoolingPTAC: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 160000.00,
              description: 'Annual building electric cooling consumption in kWh for PTAC systems'
            },
            annualBuildingkWhHeatingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 21428.57,
              description: 'Annual building electric heating consumption in kWh for PTHP systems'
            },
            annualBuildingkWhCoolingPTHP: {
              type: 'number',
              format: 'float',
              nullable: true,
              example: 160000.00,
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
            siteEUI: {
              type: 'string',
              example: '65.5',
              description: 'Site Energy Use Intensity'
            },
            occupancyRate: {
              type: 'string',
              example: '95',
              description: 'Building occupancy rate percentage'
            },
            maintenanceCost: {
              type: 'string',
              example: '75000',
              description: 'Annual maintenance cost in USD'
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
            'id', 'bbl', 'buildingName', 'address', 'yearBuilt', 
            'stories', 'buildingClass', 'taxClass', 'zoning', 'boro',
            'totalSquareFeet', 'totalResidentialUnits', 'ptacUnits',
            'capRate', 'buildingValue', 'unitMixBreakDown', 'energyProfile',
            'siteEUI', 'occupancyRate', 'maintenanceCost', 'createdAt', 'updatedAt'
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