import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Serve the OpenAPI/Swagger specification for calculation services
 */
export async function GET() {
  try {
    const swaggerPath = path.join(process.cwd(), 'src/lib/swagger/calculation-services.swagger.yaml');
    const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
    
    // Parse YAML and convert to JSON
    const swaggerJson = yaml.load(swaggerContent);
    
    return NextResponse.json(swaggerJson, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error serving Swagger documentation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load API documentation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}