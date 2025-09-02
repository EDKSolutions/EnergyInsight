import { NextResponse } from 'next/server';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerDefinition } from '@/lib/swagger/swagger-config';

// This runs server-side only where Node.js modules are available
const options: swaggerJsdoc.Options = {
  ...swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Path to the API docs
};

export async function GET() {
  try {
    const specs = swaggerJsdoc(options);
    return NextResponse.json(specs);
  } catch (error) {
    console.error('Error generating Swagger specs:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}