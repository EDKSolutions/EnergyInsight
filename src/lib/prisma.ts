import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () => {
  const client = new PrismaClient();
  
  if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
    console.log('Using Accelerate');
    return client.$extends(withAccelerate());
  }
  
  console.log('Using direct connection');
  return client;
};

export const prisma = createPrismaClient();