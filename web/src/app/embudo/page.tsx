import Link from "next/link";
import { prisma, getTenant } from "@/lib/db";
import { relativeTime } from "@/lib/format";
import { Badge, PageHeader, SourceBadges } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const tenant = await getTenant();

  const stages = await prisma.pipelineStage.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: "asc" },
    include: {
      leads: {
        where: { archivedAt: null },
        orderBy: { lastActivityAt: "desc" },
        include: { vehicle: true, seller: true },
      },
    },
  });

  const totalLeads = stages.reduce((a, s) => a + s.leads.length, 0);

  return (
    <>
      <PageHeader
        title="Embudo"
        subtitle={`${totalLeads} leads activos · las etapas con ✦ las atiende el agente IA`}
      />

      <div className="-mx-8 overflow-x-auto px-8 pb-6 lg:-mx-12 lg:px-12">
        <div className="flex items-start gap-4" style={{ minWidth: "max-content" }}>
          {stages.map((stage) => (
            <section
              key={stage.id}
              className="w-[290px] shrink-0 rounded-2xl border border-line bg-surface"
            >
              <header className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[13.5px] font-bold">{stage.name}</h2>
                  {stage.kind === "entry" && (
                    <Badge tone="neutral">Auto</Badge>
                  )}
                  {stage.agentEnabled && <Badge tone="gold">✦ IA</Badge>}
                </div>
                <span className="text-[12.5px] font-semibold text-muted">
                  {stage.leads.length}
                </span>
              </header>

              <div className="max-h-[65vh] space-y-2.5 overflow-y-auto p-2.5">
                {stage.leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className={`block rounded-xl border bg-surface-2 p-3.5 transition-colors hover:border-line-strong ${
                      lead.temperature === "hot"
                        ? "border-l-2 border-l-hot border-line"
                        : "border-line"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13.5px] font-semibold">
                        {lead.temperature === "hot" && "🔥 "}
                        {lead.name}
                      </p>
                      {lead.score !== null && (
                        <span
                          className={`shrink-0 text-[11.5px] font-bold ${
                            lead.score >= 70
                              ? "text-hot"
                              : lead.score >= 45
                                ? "text-warm"
                                : "text-cold"
                          }`}
                        >
                          {lead.score}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">{lead.phone}</p>
                    {lead.vehicle && (
                      <p className="mt-1.5 truncate text-[12px] text-silver">
                        🚗 {lead.vehicle.title}
                      </p>
                    )}
                    <div className="mt-2">
                      <SourceBadges sources={lead.sources} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted">
                      <span>
                        💬 {lead.messageCount}
                        {lead.lost && (
                          <span className="ml-2 font-semibold text-hot">
                            Perdido
                          </span>
                        )}
                      </span>
                      <span>
                        {lead.seller ? lead.seller.name.split(" ")[0] + " · " : ""}
                        {relativeTime(lead.lastActivityAt)}
                      </span>
                    </div>
                  </Link>
                ))}
                {stage.leads.length === 0 && (
                  <p className="px-2 py-6 text-center text-[12px] text-muted">
                    Sin leads
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
