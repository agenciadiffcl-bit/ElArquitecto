import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, getTenant } from "@/lib/db";
import { formatCLP, formatDate, relativeTime } from "@/lib/format";
import {
  Badge,
  Card,
  SourceBadges,
  TemperatureBadge,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();

  const lead = await prisma.lead.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      stage: true,
      vehicle: true,
      seller: true,
      notes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) notFound();

  const stages = await prisma.pipelineStage.findMany({
    where: { tenantId: tenant.id },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <Link
        href="/embudo"
        className="mb-4 inline-block text-[13px] text-silver hover:text-cream"
      >
        ← Volver al embudo
      </Link>

      <div className="flex items-start gap-6">
        {/* Ficha */}
        <div className="min-w-0 flex-1 space-y-5">
          <Card
            className={
              lead.temperature === "hot" ? "border-l-2 !border-l-hot" : ""
            }
          >
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{lead.name}</h1>
              <TemperatureBadge temperature={lead.temperature} />
              <Badge tone={lead.stage.name === "Calificado" ? "ok" : "warm"}>
                {lead.stage.name}
              </Badge>
            </div>
            <div className="mt-2">
              <SourceBadges sources={lead.sources} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-5">
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Contacto
                </p>
                <p className="mt-1.5 text-[14.5px]">{lead.phone ?? "—"}</p>
                <p className="text-[13px] text-muted">{lead.email ?? "sin email"}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Asignación
                </p>
                <p className="mt-1.5 text-[14.5px]">
                  {lead.seller?.name ?? "Sin asignar"}
                </p>
              </div>
            </div>

            {lead.vehicle && (
              <div className="mt-5 rounded-xl border border-line bg-surface-2 px-4 py-3.5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Vehículo de interés
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[14.5px] font-semibold">
                    {lead.vehicle.title}
                  </p>
                  <p className="text-[14px] text-accent">
                    {formatCLP(lead.vehicle.price)}
                  </p>
                </div>
              </div>
            )}

            {lead.score !== null && (
              <div className="mt-5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3.5">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-accent">
                  ✦ Calificación del agente IA — score {lead.score}/100
                </p>
                {lead.scoreReason && (
                  <p className="mt-1 text-[13.5px] text-cream">
                    {lead.scoreReason}
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card>
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Etapa
            </p>
            <div className="flex flex-wrap gap-2">
              {stages.map((s) => (
                <span
                  key={s.id}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium ${
                    s.id === lead.stageId
                      ? s.name === "Calificado" || s.kind === "won"
                        ? "bg-ok/20 font-bold text-ok"
                        : "bg-warm/20 font-bold text-warm"
                      : "border border-line text-silver"
                  }`}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Notas
            </p>
            {lead.notes.length === 0 && (
              <p className="text-[13.5px] text-muted">Sin notas.</p>
            )}
            <ul className="space-y-3">
              {lead.notes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl border-l-2 border-warm bg-surface-2 px-4 py-3 text-[13.5px]"
                >
                  {n.body}
                  <span className="mt-1 block text-[11px] text-muted">
                    {n.author === "agent" ? "✦ Agente IA" : "Equipo"} ·{" "}
                    {formatDate(n.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted">
              Bitácora
            </p>
            <ul className="space-y-4">
              {lead.events.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cold" />
                  <div>
                    <p className="text-[13.5px] font-semibold">
                      {e.fromStage ? `${e.fromStage} → ${e.toStage}` : e.toStage}
                    </p>
                    {e.reason && (
                      <p className="text-[12.5px] text-silver">{e.reason}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted">
                      {e.actor === "agent"
                        ? "✦ Agente IA"
                        : e.actor === "human"
                          ? "Equipo"
                          : "Sistema"}{" "}
                      · {formatDate(e.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-3 text-[11.5px] text-muted">
              Creado: {formatDate(lead.createdAt)} · Última actividad:{" "}
              {relativeTime(lead.lastActivityAt)}
            </p>
          </Card>
        </div>

        {/* Conversación (placeholder hasta conectar WhatsApp Cloud API) */}
        <aside className="sticky top-8 w-96 shrink-0">
          <Card className="!p-0">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="text-[14px] font-bold">
                Conversación ({lead.messageCount})
              </p>
              <Badge tone="gold">✦ Agente IA</Badge>
            </header>
            <div className="flex h-72 items-center justify-center px-6 text-center">
              <p className="text-[13px] leading-relaxed text-muted">
                La bandeja de WhatsApp se conectará aquí
                <br />
                (WhatsApp Cloud API — Fase 1).
              </p>
            </div>
            <footer className="flex items-center justify-between border-t border-line px-5 py-3.5">
              <p className="text-[12px] text-muted">
                El agente IA atenderá esta conversación
              </p>
              <button className="rounded-full border border-line px-4 py-1.5 text-[12px] font-semibold text-silver">
                Tomar control
              </button>
            </footer>
          </Card>
        </aside>
      </div>
    </>
  );
}
