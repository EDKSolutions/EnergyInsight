import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient();

// Only use Accelerate if DATABASE_URL starts with prisma://
export const prismaClient = process.env.DATABASE_URL?.startsWith('prisma://') 
  ? prisma.$extends(withAccelerate())
  : prisma;
