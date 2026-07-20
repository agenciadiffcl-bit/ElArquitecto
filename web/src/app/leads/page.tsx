import Link from "next/link";
import { prisma, getTenant } from "@/lib/db";
import { relativeTime } from "@/lib/format";
import {
  Badge,
  Card,
  PageHeader,
  SourceBadges,
  TemperatureBadge,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const tenant = await getTenant();

  const leads = await prisma.lead.findMany({
    where: { tenantId: tenant.id, archivedAt: null },
    orderBy: { lastActivityAt: "desc" },
    include: { stage: true, vehicle: true, seller: true },
  });

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Gestiona las consultas de tus clientes potenciales"
      />

      <Card className="overflow-x-auto !p-0">
        <table className="w-full min-w-[850px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line text-[11.5px] uppercase tracking-[0.1em] text-muted">
              <th className="px-5 py-3.5 font-semibold">Contacto</th>
              <th className="px-5 py-3.5 font-semibold">Vehículo</th>
              <th className="px-5 py-3.5 font-semibold">Etapa</th>
              <th className="px-5 py-3.5 font-semibold">Calificación</th>
              <th className="px-5 py-3.5 font-semibold">Fuente</th>
              <th className="px-5 py-3.5 font-semibold">Vendedor</th>
              <th className="px-5 py-3.5 font-semibold">Actividad</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-line last:border-0 hover:bg-surface-2"
              >
                <td className="px-5 py-4">
                  <Link href={`/leads/${lead.id}`} className="group">
                    <p className="font-semibold group-hover:text-accent">
                      {lead.name}
                    </p>
                    <p className="text-[12px] text-muted">{lead.phone}</p>
                  </Link>
                </td>
                <td className="px-5 py-4 text-silver">
                  {lead.vehicle ? (
                    <>
                      <p className="text-cream">{lead.vehicle.title}</p>
                      <p className="font-mono text-[11px] text-muted">
                        {lead.vehicle.code}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted">Sin vehículo</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <Badge
                    tone={
                      lead.stage.kind === "won"
                        ? "ok"
                        : lead.stage.kind === "lost"
                          ? "neutral"
                          : lead.stage.name === "Calificado"
                            ? "ok"
                            : "warm"
                    }
                  >
                    {lead.stage.name}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TemperatureBadge temperature={lead.temperature} />
                    {lead.score !== null && (
                      <span className="text-[12px] font-bold text-silver">
                        {lead.score}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <SourceBadges sources={lead.sources} />
                </td>
                <td className="px-5 py-4 text-silver">
                  {lead.seller?.name.split(" ")[0] ?? "—"}
                </td>
                <td className="px-5 py-4 text-[12.5px] text-muted">
                  {relativeTime(lead.lastActivityAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
