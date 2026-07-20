import { prisma, getTenant } from "@/lib/db";
import { formatCLP } from "@/lib/format";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const tenant = await getTenant();

  const campaigns = await prisma.campaign.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Campañas"
        subtitle="Crea y gestiona tus campañas de Meta Ads · próximamente el agente IA propondrá campañas para stock estancado"
        action={
          <button className="rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-85">
            + Nueva campaña
          </button>
        }
      />

      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[850px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.1em] text-muted">
              <th className="px-6 py-3.5 font-semibold">Estado</th>
              <th className="px-6 py-3.5 font-semibold">Campaña</th>
              <th className="px-6 py-3.5 font-semibold">Regiones</th>
              <th className="px-6 py-3.5 font-semibold text-right">
                Presupuesto
              </th>
              <th className="px-6 py-3.5 font-semibold text-right">Contactos</th>
              <th className="px-6 py-3.5 font-semibold text-right">Gasto</th>
              <th className="px-6 py-3.5 font-semibold text-right">CPL</th>
              <th className="px-6 py-3.5 font-semibold text-right">Alcance</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const cpl = c.contacts > 0 ? Math.round(c.spend / c.contacts) : null;
              return (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-4">
                    <Badge tone={c.status === "active" ? "ok" : "neutral"}>
                      {c.status === "active" ? "Activa" : c.status === "paused" ? "Pausada" : "Borrador"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-[12px] text-muted">
                      {c.kind === "ctwa" ? "WhatsApp (CTWA)" : "Catálogo"}
                      {c.vehicleIds
                        ? ` · ${c.vehicleIds.split(",").length} vehículo(s)`
                        : ""}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-silver">
                    {c.regions?.split(",").slice(0, 2).join(", ")}
                    {(c.regions?.split(",").length ?? 0) > 2 &&
                      ` +${c.regions!.split(",").length - 2}`}
                  </td>
                  <td className="px-6 py-4 text-right text-silver">
                    {c.dailyBudget ? `${formatCLP(c.dailyBudget)}/día` : "—"}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {c.contacts}
                  </td>
                  <td className="px-6 py-4 text-right text-silver">
                    {formatCLP(c.spend)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cpl === null ? (
                      "—"
                    ) : (
                      <span
                        className={
                          cpl < 1500
                            ? "font-semibold text-ok"
                            : cpl < 3500
                              ? "text-warm"
                              : "text-hot"
                        }
                      >
                        {formatCLP(cpl)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-silver">
                    {new Intl.NumberFormat("es-CL").format(c.reach)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
