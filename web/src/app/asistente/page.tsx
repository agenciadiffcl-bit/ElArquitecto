import { prisma, getTenant } from "@/lib/db";
import { Badge, Card, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-block h-5.5 w-10 rounded-full transition-colors ${on ? "bg-accent" : "bg-surface-2 border border-line"}`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-all ${on ? "right-0.5" : "left-0.5 opacity-60"}`}
      />
    </span>
  );
}

function ToggleRow({
  title,
  hint,
  on,
}: {
  title: string;
  hint: string;
  on: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line py-4 last:border-0">
      <div>
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[12.5px] text-muted">{hint}</p>
      </div>
      <Toggle on={on} />
    </div>
  );
}

export default async function AssistantPage() {
  const tenant = await getTenant();
  const config = await prisma.agentConfig.findUnique({
    where: { tenantId: tenant.id },
  });
  if (!config) return null;

  return (
    <>
      <PageHeader
        title="Asistente IA"
        subtitle="Decide a quién responde automáticamente el asistente de WhatsApp"
        action={<Badge tone="gold">✦ {config.agentName}</Badge>}
      />

      <div className="max-w-3xl space-y-6">
        <Card>
          <h2 className="text-[15px] font-bold">¿Cuándo responde el asistente?</h2>
          <p className="mt-1 text-[12.5px] text-silver">
            Se activa cuando se cumple al menos una de las condiciones. Lo que
            desactives queda en la bandeja para tu equipo.
          </p>
          <div className="mt-3">
            <ToggleRow
              title="Leads de campañas publicitarias (CTWA)"
              hint="Cuando alguien llega desde un anuncio de Meta / Facebook / Instagram Ads"
              on={config.respondCtwa}
            />
            <ToggleRow
              title="Contactos nuevos"
              hint="Números que nunca te habían escrito antes"
              on={config.respondNewContacts}
            />
            <ToggleRow
              title="Contactos existentes"
              hint="Números que ya tienen historial previo con tu automotora"
              on={config.respondExistingContacts}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-[15px] font-bold">¿Qué servicios ofrece tu agente?</h2>
          <p className="mt-1 text-[12.5px] text-silver">
            El flujo de venta de vehículos siempre está activo. El asistente
            solo habla de los servicios activados.
          </p>
          <div className="mt-3">
            <ToggleRow
              title="Consignación de vehículos"
              hint="Recibimos autos para venderlos por cuenta del cliente"
              on={config.serviceConsignment}
            />
            <ToggleRow
              title="Compra directa o parte de pago"
              hint="Compramos tu auto o lo recibimos en parte de pago"
              on={config.serviceDirectBuy}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-[15px] font-bold">Qué debe saber y decir</h2>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-line bg-surface-2 p-4 font-sans text-[13.5px] leading-relaxed text-silver">
            {config.knowledge}
          </pre>
        </Card>

        <Card>
          <h2 className="text-[15px] font-bold">Qué NO debe decir</h2>
          <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-hot/25 bg-hot/5 p-4 font-sans text-[13.5px] leading-relaxed text-silver">
            {config.restrictions}
          </pre>
        </Card>

        <p className="pb-8 text-[12.5px] text-muted">
          La edición de esta configuración y la conexión con WhatsApp Cloud API
          + Claude son parte de la Fase 1 del roadmap.
        </p>
      </div>
    </>
  );
}
