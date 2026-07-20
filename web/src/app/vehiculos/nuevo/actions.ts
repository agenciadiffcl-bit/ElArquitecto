"use server";

import { redirect } from "next/navigation";
import { prisma, getTenant } from "@/lib/db";

function num(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(String(value).replace(/[^\d-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function str(value: FormDataEntryValue | null): string | null {
  const s = value === null ? "" : String(value).trim();
  return s === "" ? null : s;
}

export async function createVehicle(formData: FormData) {
  const tenant = await getTenant();

  const brand = str(formData.get("brand"));
  const model = str(formData.get("model"));
  const title = str(formData.get("title"));
  const year = num(formData.get("year"));
  const price = num(formData.get("price"));

  if (!brand || !model || !title || !year || !price) {
    throw new Error("Faltan campos obligatorios: marca, modelo, título, año y precio.");
  }
  if (/^\d+$/.test(title)) {
    throw new Error("El título no puede ser solo números.");
  }

  const count = await prisma.vehicle.count({ where: { tenantId: tenant.id } });
  const code = `COD${String(921900 + count).padStart(6, "0")}`;

  const publish = formData.get("intent") === "publish";
  const channels = formData.getAll("channels").map(String);

  await prisma.vehicle.create({
    data: {
      tenantId: tenant.id,
      code,
      brand,
      model,
      title,
      year,
      price,
      plate: str(formData.get("plate")),
      version: str(formData.get("version")),
      km: num(formData.get("km")) ?? 0,
      fuel: str(formData.get("fuel")),
      transmission: str(formData.get("transmission")),
      bodyType: str(formData.get("bodyType")),
      doors: num(formData.get("doors")),
      exteriorColor: str(formData.get("exteriorColor")),
      interiorColor: str(formData.get("interiorColor")),
      equipment: str(formData.get("equipment")),
      tags: str(formData.get("tags")),
      financingDown: num(formData.get("financingDown")),
      acquisitionCost: num(formData.get("acquisitionCost")),
      description: str(formData.get("description")),
      singleOwner: formData.get("singleOwner") === "on",
      virtualConsignment: formData.get("virtualConsignment") === "on",
      consignment: formData.get("consignment") === "on",
      status: publish ? "available" : "draft",
      publishedAt: publish ? new Date() : null,
      channels: {
        create: channels.map((channel) => ({
          channel,
          status: publish ? "published" : "pending",
          syncedAt: publish ? new Date() : null,
        })),
      },
    },
  });

  redirect("/vehiculos?tab=" + (publish ? "disponibles" : "pendientes"));
}
