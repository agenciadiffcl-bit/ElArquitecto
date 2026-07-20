import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "dev.db")}`,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Tenant único mientras no hay auth; el modelo ya es multi-tenant.
export const DEMO_TENANT_SLUG = "marketcar";

export async function getTenant() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: DEMO_TENANT_SLUG },
  });
  if (!tenant) throw new Error("Tenant demo no encontrado — corre `npm run seed`");
  return tenant;
}
