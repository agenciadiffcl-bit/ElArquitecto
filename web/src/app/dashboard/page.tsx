import Link from "next/link";
import { prisma, getTenant } from "@/lib/db";
import { formatCLP, daysSince } from "@/lib/format";
import { Card, Kpi, PageHeader, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const tenant = await getTenant();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [stock, salesMonth, salesPrev, leadsMonth, leadsPrev, hotUnattended, staleVehicles, cleanableLeads] =
    await Promise.all([
      prisma.vehicle.count({
        where: { tenantId: tenant.id, status: "available" },
      }),
      prisma.sale.findMany({
        where: { tenantId: tenant.id, soldAt: { gte: monthStart } },
        include: { vehicle: { include: { expenses: true } } },
      }),
      prisma.sale.count({
        where: {
          tenantId: tenant.id,
          soldAt: { gte: prevMonthStart, lt: monthStart },
        },
      }),
      prisma.lead.count({
        where: { tenantId: tenant.id, createdAt: { gte: monthStart } },
      }),
      prisma.lead.count({
        where: {
          tenantId: tenant.id,
          createdAt: { gte: prevMonthStart, lt: monthStart },
        },
      }),
      prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          temperature: "hot",
          lost: false,
          archivedAt: null,
          stage: { kind: "progress" },
        },
        orderBy: { lastActivityAt: "asc" },
        take: 5,
        include: { stage: true },
      }),
      prisma.vehicle.findMany({
        where: {
          tenantId: tenant.id,
          status: "available",
          createdAt: { lt: new Date(Date.now() - 45 * 86_400_000) },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.lead.count({
        where: {
          tenantId: tenant.id,
          lost: true,
          archivedAt: null,
          lastActivityAt: { lt: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
    ]);

  const revenue = salesMonth.reduce((sum, s) => sum + s.price, 0);
  const profit = salesMonth.reduce((sum, s) => {
    const cost = s.vehicle.acquisitionCost ?? 0;
    const expenses = s.vehicle.expenses.reduce((a, e) => a + e.amount, 0);
    return sum + (s.price - cost - expenses);
  }, 0);

  const pct = (curr: number, prev: number) =>
    prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);
  const salesDelta = pct(salesMonth.length, salesPrev);
  const leadsDelta = pct(leadsMonth, leadsPrev);

  const attention =
    hotUnattended.length + staleVehicles.length + (cleanableLeads > 0 ? 1 : 0);

  return (
    <>
      <PageHeader
        title={`Hola, ${tenant.name} 👋`}
        subtitle="Lo que requiere tu atención hoy"
        action={
          <Link
            href="/vehiculos/nuevo"
            className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-85"
          >
            + Agregar vehículo
          </Link>
        }
      />

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Stock disponible" value={String(stock)} />
        <Kpi
          label="Ventas del mes"
          value={String(salesMonth.length)}
          delta={
            salesDelta === null
              ? "Sin datos previos"
              : `${salesDelta > 0 ? "↑" : "↓"} ${Math.abs(salesDelta)}% vs mes anterior`
          }
          deltaTone={
            salesDelta === null ? "neutral" : salesDelta >= 0 ? "up" : "down"
          }
        />
        <Kpi
          label="Leads del mes"
          value={String(leadsMonth)}
          delta={
            leadsDelta === null
              ? "Sin datos previos"
              : `${leadsDelta > 0 ? "↑" : "↓"} ${Math.abs(leadsDelta)}% vs mes anterior`
          }
          deltaTone={
            leadsDelta === null ? "neutral" : leadsDelta >= 0 ? "up" : "down"
          }
        />
        <Kpi
          label="Utilidad del mes"
          value={formatCLP(profit)}
          delta={`Ingresos: ${formatCLP(revenue)}`}
        />
      </div>

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-[17px] font-bold">Requiere atención</h2>
          <Badge tone="gold">{attention}</Badge>
        </div>

        <ul className="space-y-3">
          {hotUnattended.length > 0 && (
            <li className="rounded-xl border-l-2 border-hot bg-surface-2 px-5 py-4">
              <Link href="/embudo" className="group flex items-center justify-between">
                <div>
                  <p className="text-[14.5px] font-semibold">
                    🔥 {hotUnattended.length} leads HOT esperando gestión
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-silver">
                    {hotUnattended.map((l) => l.name).join(" · ")}
                  </p>
                </div>
                <span className="text-muted transition-colors group-hover:text-cream">
                  →
                </span>
              </Link>
            </li>
          )}

          {staleVehicles.length > 0 && (
            <li className="rounded-xl border-l-2 border-warm bg-surface-2 px-5 py-4">
              <Link href="/vehiculos" className="group flex items-center justify-between">
                <div>
                  <p className="text-[14.5px] font-semibold">
                    {staleVehicles.length} autos sin movimiento (+45 días)
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-silver">
                    {staleVehicles
                      .slice(0, 3)
                      .map((v) => `${v.title} (${daysSince(v.createdAt)}d)`)
                      .join(" · ")}
                    {staleVehicles.length > 3 &&
                      ` +${staleVehicles.length - 3} más`}
                  </p>
                  <p className="mt-1.5 text-[12px] text-accent">
                    Sugerencia IA: crear campaña CTWA para reactivarlos →
                  </p>
                </div>
                <span className="text-muted transition-colors group-hover:text-cream">
                  →
                </span>
              </Link>
            </li>
          )}

          {cleanableLeads > 0 && (
            <li className="rounded-xl border-l-2 border-line-strong bg-surface-2 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14.5px] font-semibold">
                    {cleanableLeads} leads podrían limpiarse
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-silver">
                    Perdidos hace +30 días
                  </p>
                </div>
                <span className="rounded-full border border-line px-4 py-1.5 text-[12.5px] font-medium text-silver">
                  Archivar todos
                </span>
              </div>
            </li>
          )}

          {attention === 0 && (
            <li className="rounded-xl bg-surface-2 px-5 py-4 text-[14px] text-silver">
              Todo al día. Nada pendiente por ahora ✨
            </li>
          )}
        </ul>
      </Card>
    </>
  );
}
