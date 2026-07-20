import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { VehicleForm } from "./vehicle-form";

export default function NewVehiclePage() {
  return (
    <>
      <Link
        href="/vehiculos"
        className="mb-4 inline-block text-[13px] text-silver hover:text-cream"
      >
        ← Volver a vehículos
      </Link>
      <PageHeader
        title="Nuevo vehículo"
        subtitle="Completa la información del vehículo"
      />
      <VehicleForm />
    </>
  );
}
