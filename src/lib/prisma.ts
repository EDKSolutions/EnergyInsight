import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Simple approach: detect environment and configure accordingly
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = isProduction && process.env.PRISMA_DATABASE_URL 
  ? process.env.PRISMA_DATABASE_URL 
  : process.env.DATABASE_URL;

console.log(`🔍 Prisma Configuration:`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Database URL prefix: ${databaseUrl?.substring(0, 25)}...`);

// Create the base Prisma client
const basePrismaClient = new PrismaClient();

// Only apply Accelerate extension if we have a Prisma Accelerate URL
const isPrismaAccelerateUrl = databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://');

console.log(`Using Prisma Accelerate: ${isPrismaAccelerateUrl}`);

// Export the appropriately configured client
export const prismaClient = isPrismaAccelerateUrl
  ? basePrismaClient.$extends(withAccelerate())
  : basePrismaClient;

// Backward compatibility export
export const prisma = prismaClient;
