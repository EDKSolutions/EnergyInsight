import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use Prisma Accelerate only in production if DATABASE_URL starts with prisma://
const shouldUseAccelerate = process.env.NODE_ENV === 'production' && 
  (process.env.DATABASE_URL?.startsWith('prisma://') || process.env.DATABASE_URL?.startsWith('prisma+postgres://'))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prismaClient: any

if (shouldUseAccelerate) {
  prismaClient = new PrismaClient().$extends(withAccelerate())
} else {
  prismaClient = new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? prismaClient

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
