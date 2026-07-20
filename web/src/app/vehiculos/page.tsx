import Link from "next/link";
import { prisma, getTenant } from "@/lib/db";
import { formatCLP, formatKm, daysSince } from "@/lib/format";
import { qualityScore } from "@/lib/quality";
import {
  Badge,
  Card,
  ChannelBadge,
  PageHeader,
  QualityDot,
} from "@/components/ui";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; tone: "ok" | "gold" | "neutral" | "warm" }> = {
  available: { label: "Disponible", tone: "ok" },
  reserved: { label: "Reservado", tone: "warm" },
  sold: { label: "Vendido", tone: "neutral" },
  draft: { label: "Borrador", tone: "neutral" },
  preparing: { label: "En preparación", tone: "gold" },
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "disponibles" } = await searchParams;
  const tenant = await getTenant();

  const where =
    tab === "disponibles"
      ? { tenantId: tenant.id, status: "available" }
      : tab === "pendientes"
        ? { tenantId: tenant.id, status: { in: ["draft", "preparing"] } }
        : { tenantId: tenant.id };

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { photos: true, channels: true, seller: true, expenses: true },
  });

  const total = await prisma.vehicle.count({ where: { tenantId: tenant.id } });
  const incomplete = vehicles.filter((v) => qualityScore(v) < 100).length;

  const tabs = [
    { key: "disponibles", label: "Disponibles" },
    { key: "pendientes", label: "Pendientes" },
    { key: "todos", label: "Todos" },
  ];

  return (
    <>
      <PageHeader
        title="Vehículos"
        subtitle={`Gestiona tu inventario · ${total} vehículos en total`}
        action={
          <Link
            href="/vehiculos/nuevo"
            className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-85"
          >
            + Nuevo vehículo
          </Link>
        }
      />

      {incomplete > 0 && tab === "disponibles" && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-warm/30 bg-warm/10 px-5 py-3.5">
          <p className="text-[13.5px]">
            💡 <strong>{incomplete} publicaciones incompletas</strong>
            <span className="text-silver">
              {" "}
              — están perdiendo visibilidad frente a la competencia
            </span>
          </p>
        </div>
      )}

      <div className="mb-5 flex gap-1 rounded-full border border-line bg-surface p-1 w-fit">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/vehiculos?tab=${t.key}`}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              tab === t.key
                ? "bg-cream text-black"
                : "text-silver hover:text-cream"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[900px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3.5 font-semibold">Código</th>
              <th className="px-5 py-3.5 font-semibold">Vehículo</th>
              <th className="px-5 py-3.5 font-semibold text-right">Precio</th>
              <th className="px-5 py-3.5 font-semibold text-right">Margen est.</th>
              <th className="px-5 py-3.5 font-semibold">Km</th>
              <th className="px-5 py-3.5 font-semibold">Estado</th>
              <th className="px-5 py-3.5 font-semibold">Días</th>
              <th className="px-5 py-3.5 font-semibold">Canales</th>
              <th className="px-5 py-3.5 font-semibold">Calidad</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const status = statusLabels[v.status] ?? statusLabels.draft;
              const expenses = v.expenses.reduce((a, e) => a + e.amount, 0);
              const margin = v.acquisitionCost
                ? v.price - v.acquisitionCost - expenses
                : null;
              const days = daysSince(v.createdAt);
              return (
                <tr
                  key={v.id}
                  className="border-b border-line last:border-0 hover:bg-surface-2"
                >
                  <td className="px-5 py-4 font-mono text-[12px] text-muted">
                    {v.code}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{v.title}</p>
                    <p className="text-[12px] text-muted">
                      {[v.fuel, v.year, v.consignment ? "Consignación" : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatCLP(v.price)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {margin === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className={margin >= 0 ? "text-ok" : "text-hot"}>
                        {formatCLP(margin)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-silver">{formatKm(v.km)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        days > 45
                          ? "font-semibold text-hot"
                          : days > 30
                            ? "font-semibold text-warm"
                            : "text-silver"
                      }
                    >
                      {days}d
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex gap-1">
                      {v.channels
                        .filter((c) => c.status === "published")
                        .map((c) => (
                          <ChannelBadge key={c.id} channel={c.channel} />
                        ))}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <QualityDot score={qualityScore(v)} />
                  </td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-silver">
                  No hay vehículos en esta vista.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
