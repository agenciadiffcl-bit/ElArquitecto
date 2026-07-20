// Score de calidad de una publicación (paridad Venpu: checklist de 12 ítems,
// cada uno explica por qué importa en los portales).
import type { Vehicle, VehiclePhoto } from "@/generated/prisma/client";

export type QualityItem = {
  key: string;
  label: string;
  hint: string;
  done: boolean;
};

export function qualityChecklist(
  vehicle: Partial<Vehicle> & { photos?: Pick<VehiclePhoto, "id">[] }
): QualityItem[] {
  return [
    {
      key: "photos",
      label: "Fotos del vehículo (10+)",
      hint: "Los portales priorizan publicaciones con 10+ fotos de calidad",
      done: (vehicle.photos?.length ?? 0) >= 10,
    },
    {
      key: "description",
      label: "Descripción detallada (100+ caracteres)",
      hint: "Descripciones completas generan más consultas en todos los portales",
      done: (vehicle.description?.length ?? 0) >= 100,
    },
    {
      key: "price",
      label: "Precio definido",
      hint: "Los compradores filtran por precio en los portales",
      done: (vehicle.price ?? 0) > 0,
    },
    {
      key: "brandModel",
      label: "Marca y modelo",
      hint: "Obligatorio en todos los portales para búsquedas por marca",
      done: Boolean(vehicle.brand && vehicle.model),
    },
    {
      key: "plate",
      label: "Patente",
      hint: "Obligatoria en MercadoLibre para publicar",
      done: Boolean(vehicle.plate),
    },
    {
      key: "transmission",
      label: "Transmisión",
      hint: "Filtro de búsqueda principal en los portales",
      done: Boolean(vehicle.transmission),
    },
    {
      key: "color",
      label: "Color exterior",
      hint: "Los compradores filtran por color en los portales",
      done: Boolean(vehicle.exteriorColor),
    },
    {
      key: "bodyType",
      label: "Tipo de carrocería",
      hint: "Categoría de búsqueda principal (SUV, Sedán, Hatchback)",
      done: Boolean(vehicle.bodyType),
    },
    {
      key: "doors",
      label: "Número de puertas",
      hint: "Filtro de búsqueda frecuente",
      done: Boolean(vehicle.doors),
    },
    {
      key: "equipment",
      label: "Equipamiento listado",
      hint: "Destaca tu vehículo frente a la competencia",
      done: Boolean(vehicle.equipment),
    },
    {
      key: "km",
      label: "Kilometraje",
      hint: "Dato esencial para el comprador de usados",
      done: vehicle.km !== undefined && vehicle.km !== null,
    },
    {
      key: "year",
      label: "Año",
      hint: "Obligatorio en todos los portales",
      done: Boolean(vehicle.year),
    },
  ];
}

export function qualityScore(
  vehicle: Partial<Vehicle> & { photos?: Pick<VehiclePhoto, "id">[] }
): number {
  const items = qualityChecklist(vehicle);
  const done = items.filter((i) => i.done).length;
  return Math.round((done / items.length) * 100);
}
