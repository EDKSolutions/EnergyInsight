import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Crear el cliente base
const baseClient = new PrismaClient();

// Extender con Accelerate solo en producción
const extendedClient = process.env.NEXT_PUBLIC_NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('accelerate')
  ? baseClient.$extends(withAccelerate())
  : baseClient;

// Exportar con tipo explícito para evitar conflictos de tipos
export const prisma = extendedClient as PrismaClient;
