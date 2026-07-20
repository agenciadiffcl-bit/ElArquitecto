import { prisma, getTenant } from "@/lib/db";
import { formatCLP, formatDate } from "@/lib/format";
import { Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SalesControlPage() {
  const tenant = await getTenant();

  const [sales, closes] = await Promise.all([
    prisma.sale.findMany({
      where: { tenantId: tenant.id, monthlyCloseId: null },
      orderBy: { soldAt: "desc" },
      include: { vehicle: { include: { expenses: true } }, seller: true },
    }),
    prisma.monthlyClose.findMany({
      where: { tenantId: tenant.id },
      orderBy: { periodStart: "desc" },
    }),
  ]);

  const totals = sales.reduce(
    (acc, s) => {
      const cost = s.vehicle.acquisitionCost ?? 0;
      const expenses = s.vehicle.expenses.reduce((a, e) => a + e.amount, 0);
      acc.revenue += s.price;
      acc.expenses += expenses;
      acc.profit += cost ? s.price - cost - expenses : 0;
      return acc;
    },
    { revenue: 0, expenses: 0, profit: 0 }
  );

  return (
    <>
      <PageHeader
        title="Control de Ventas"
        subtitle="Ventas del período abierto y cierres mensuales"
        action={
          <button className="rounded-full border border-line px-5 py-2.5 text-[13.5px] font-semibold text-silver transition-colors hover:text-cream">
            🔒 Cerrar mes
          </button>
        }
      />

      <Card className="mb-6 !p-0">
        <header className="border-b border-line px-6 py-4">
          <h2 className="text-[15px] font-bold">📅 Cierres mensuales</h2>
        </header>
        {closes.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between border-b border-line px-6 py-4 last:border-0"
          >
            <div>
              <p className="text-[14px] font-semibold">
                {formatDate(c.periodStart)} — {formatDate(c.periodEnd)}
              </p>
              <p className="text-[12px] text-muted">
                Cerrado el {formatDate(c.closedAt)}
              </p>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  Ventas
                </p>
                <p className="text-[15px] font-bold">{c.salesCount}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  Ingresos
                </p>
                <p className="text-[15px] font-bold">{formatCLP(c.revenue)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  Utilidad
                </p>
                <p className="text-[15px] font-bold text-ok">
                  {formatCLP(c.profit)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {closes.length === 0 && (
          <p className="px-6 py-6 text-[13.5px] text-muted">Sin cierres aún.</p>
        )}
      </Card>

      <Card className="overflow-x-auto !p-0">
        <header className="border-b border-line px-6 py-4">
          <h2 className="text-[15px] font-bold">Ventas del período abierto</h2>
        </header>
        <table className="w-full min-w-[800px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.1em] text-muted">
              <th className="px-6 py-3.5 font-semibold">Vehículo</th>
              <th className="px-6 py-3.5 font-semibold">Vendedor</th>
              <th className="px-6 py-3.5 font-semibold text-right">
                Precio venta
              </th>
              <th className="px-6 py-3.5 font-semibold text-right">Gastos</th>
              <th className="px-6 py-3.5 font-semibold text-right">Utilidad</th>
              <th className="px-6 py-3.5 font-semibold">Días</th>
              <th className="px-6 py-3.5 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => {
              const cost = s.vehicle.acquisitionCost ?? 0;
              const expenses = s.vehicle.expenses.reduce(
                (a, e) => a + e.amount,
                0
              );
              const profit = cost ? s.price - cost - expenses : null;
              return (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-semibold">{s.vehicle.title}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {s.vehicle.code}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-silver">
                    {s.seller?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {formatCLP(s.price)}
                  </td>
                  <td className="px-6 py-4 text-right text-silver">
                    {expenses ? formatCLP(expenses) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {profit === null ? (
                      <span
                        className="text-muted"
                        title="Carga el costo de adquisición para ver la utilidad"
                      >
                        — sin costo
                      </span>
                    ) : (
                      <span className={profit >= 0 ? "text-ok" : "text-hot"}>
                        {formatCLP(profit)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={
                        (s.daysInStock ?? 0) > 45
                          ? "font-semibold text-hot"
                          : "text-silver"
                      }
                    >
                      {s.daysInStock ?? "—"}d
                    </span>
                  </td>
                  <td className="px-6 py-4 text-silver">
                    {formatDate(s.soldAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-line-strong">
              <td className="px-6 py-4 font-bold" colSpan={2}>
                Totales
              </td>
              <td className="px-6 py-4 text-right font-bold">
                {formatCLP(totals.revenue)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-silver">
                {formatCLP(totals.expenses)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-ok">
                {formatCLP(totals.profit)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </Card>
    </>
  );
}
