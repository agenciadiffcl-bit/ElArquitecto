// Motor del agente IA (la "Antonia" de la plataforma).
// Atiende la conversación de un lead, responde como asesor de la automotora y
// opera el CRM mediante herramientas: califica el lead (score + temperatura),
// mueve etapas del embudo, agenda visitas y deriva a un vendedor humano.
// Todo movimiento queda auditado en la bitácora del lead.
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { prisma } from "@/lib/db";
import { formatCLP, formatKm } from "@/lib/format";

const MODEL = "claude-opus-4-8";

export class AgentNotConfiguredError extends Error {}

function assertApiKey() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AgentNotConfiguredError(
      "Falta ANTHROPIC_API_KEY en el entorno. Agrégala al archivo .env para activar el agente."
    );
  }
}

async function loadContext(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({
    where: { id: leadId },
    include: {
      tenant: { include: { agentConfig: true, branches: true } },
      stage: true,
      seller: true,
      vehicle: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  const stages = await prisma.pipelineStage.findMany({
    where: { tenantId: lead.tenantId },
    orderBy: { order: "asc" },
  });
  const inventory = await prisma.vehicle.findMany({
    where: { tenantId: lead.tenantId, status: "available" },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return { lead, stages, inventory };
}

function vehicleLine(v: {
  title: string;
  price: number;
  year: number;
  km: number;
  fuel: string | null;
  transmission: string | null;
  exteriorColor: string | null;
  previousOwners: number | null;
  singleOwner: boolean;
  financingDown: number | null;
  virtualConsignment: boolean;
  code: string;
}) {
  const owners = v.singleOwner
    ? "único dueño"
    : v.previousOwners
      ? `${v.previousOwners} dueños`
      : null;
  return [
    `${v.title} — ${formatCLP(v.price)}`,
    `${v.year}, ${formatKm(v.km)}`,
    v.fuel,
    v.transmission === "automatica" ? "automática" : v.transmission,
    v.exteriorColor ? `color ${v.exteriorColor.toLowerCase()}` : null,
    owners,
    v.financingDown ? `pie desde ${formatCLP(v.financingDown)}` : null,
    v.virtualConsignment ? "CONSIGNACIÓN VIRTUAL: no está físicamente en la sucursal — no invitar a verlo sin coordinar antes con un asesor" : null,
    `(código ${v.code})`,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildSystemPrompt(ctx: Awaited<ReturnType<typeof loadContext>>) {
  const { lead, stages, inventory } = ctx;
  const config = lead.tenant.agentConfig;
  const agentName = config?.agentName ?? "Asistente";
  const now = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date());

  const services = [
    "venta de vehículos (siempre activo)",
    config?.serviceConsignment ? "consignación de vehículos" : null,
    config?.serviceDirectBuy ? "compra directa o parte de pago" : null,
  ].filter(Boolean);

  return `Eres ${agentName}, asistente de ${lead.tenant.name}, una automotora en Chile. Atiendes a clientes por WhatsApp: conversas, resuelves dudas sobre los vehículos y calificas el interés de compra. Escribes en español chileno neutro, cercano y profesional, en mensajes breves como corresponde a WhatsApp (sin markdown, sin listas con viñetas, sin emojis salvo muy ocasionalmente).

Fecha y hora actual en Chile: ${now}.

## El cliente
Nombre: ${lead.name}. Etapa actual en el CRM: ${lead.stage.name}.${lead.vehicle ? `\nVehículo por el que consultó: ${vehicleLine(lead.vehicle)}.` : "\nAún no consulta por un vehículo específico."}${lead.seller ? `\nVendedor asignado: ${lead.seller.name}${lead.seller.phone ? ` (teléfono ${lead.seller.phone})` : ""}.` : ""}

## Inventario disponible
${inventory.map((v) => "- " + vehicleLine(v)).join("\n")}

Solo hablas de vehículos de esta lista. Si preguntan por algo que no está, lo dices con honestidad y ofreces alternativas similares del inventario.

## Servicios que ofrece la automotora
${services.map((s) => "- " + s).join("\n")}
No ofrezcas servicios que no están en esta lista.

## Lo que debes saber y hacer
${config?.knowledge ?? "(sin instrucciones adicionales)"}

## Lo que NO debes hacer
${config?.restrictions ?? "(sin restricciones adicionales)"}
Además: nunca inventes precios, kilometrajes ni características; usa solo los datos del inventario. Nunca prometas reservar un vehículo. Si el cliente pide algo fuera de tu alcance (descuentos, tasaciones de su auto, condiciones de crédito), deriva al asesor.

## Tu trabajo en el CRM (herramientas)
El embudo tiene estas etapas: ${stages.map((s) => s.name).join(" → ")}.
Después de CADA mensaje del cliente evalúa si corresponde usar herramientas, además de responderle:
- Usa calificar_lead cuando tengas señal suficiente de interés: score 0–100 y temperatura (hot = quiere avanzar ya: visita, financiamiento, disponibilidad; warm = interés real pero sin urgencia; cold = solo mira, sin presupuesto o se baja). Actualízala si la señal cambia.
- Usa mover_etapa cuando el avance lo amerite: "Calificado" cuando confirmes interés real, "Visita Agendada" cuando quede coordinada una visita, "Sin Respuesta" no la uses tú.
- Usa agendar_visita cuando el cliente acuerde venir a ver un vehículo o recibir un llamado (registra fecha/hora acordada).
- Usa derivar_a_vendedor cuando el cliente pida hablar con una persona, cuando esté listo para cerrar, o cuando el tema exceda tu alcance. Al derivar fuera de horario, explica cuándo lo contactarán y desde qué número, como corresponde.
Las herramientas son internas: el cliente nunca las ve. Tu respuesta de texto es lo único que recibe.`;
}

export async function runAgentTurn(leadId: string): Promise<string> {
  assertApiKey();
  const ctx = await loadContext(leadId);
  const { lead } = ctx;
  const client = new Anthropic();

  const stageByName = new Map(ctx.stages.map((s) => [s.name.toLowerCase(), s]));

  const calificarLead = betaTool({
    name: "calificar_lead",
    description:
      "Registra la calificación del lead en el CRM: score 0-100, temperatura y la razón. Úsala cuando tengas señal suficiente y cada vez que la señal cambie.",
    inputSchema: {
      type: "object",
      properties: {
        score: { type: "integer", description: "0 a 100" },
        temperatura: { type: "string", enum: ["hot", "warm", "cold"] },
        razon: {
          type: "string",
          description: "Razón breve y concreta, citando lo que dijo el cliente",
        },
      },
      required: ["score", "temperatura", "razon"],
    },
    run: async (input) => {
      const { score, temperatura, razon } = input as {
        score: number;
        temperatura: string;
        razon: string;
      };
      await prisma.lead.update({
        where: { id: leadId },
        data: { score, temperature: temperatura, scoreReason: razon },
      });
      await prisma.leadNote.create({
        data: { leadId, body: razon, author: "agent" },
      });
      await prisma.leadEvent.create({
        data: {
          leadId,
          reason: `Calificación: ${temperatura.toUpperCase()} (score: ${score}). ${razon}`,
          actor: "agent",
        },
      });
      return "Calificación registrada.";
    },
  });

  const moverEtapa = betaTool({
    name: "mover_etapa",
    description:
      "Mueve el lead a otra etapa del embudo. Usa el nombre exacto de la etapa.",
    inputSchema: {
      type: "object",
      properties: {
        etapa: { type: "string", description: "Nombre exacto de la etapa destino" },
        razon: { type: "string" },
      },
      required: ["etapa", "razon"],
    },
    run: async (input) => {
      const { etapa, razon } = input as { etapa: string; razon: string };
      const target = stageByName.get(etapa.toLowerCase());
      if (!target) {
        return `Error: la etapa "${etapa}" no existe. Etapas válidas: ${ctx.stages.map((s) => s.name).join(", ")}.`;
      }
      const current = await prisma.lead.findUniqueOrThrow({
        where: { id: leadId },
        include: { stage: true },
      });
      await prisma.lead.update({
        where: { id: leadId },
        data: { stageId: target.id },
      });
      await prisma.leadEvent.create({
        data: {
          leadId,
          fromStage: current.stage.name,
          toStage: target.name,
          reason: razon,
          actor: "agent",
        },
      });
      return `Lead movido a ${target.name}.`;
    },
  });

  const agendarVisita = betaTool({
    name: "agendar_visita",
    description:
      "Registra una visita o llamada acordada con el cliente (crea un recordatorio para el equipo).",
    inputSchema: {
      type: "object",
      properties: {
        titulo: {
          type: "string",
          description: "Ej: 'Visita de Maite — Audi Q3, jueves 10:30'",
        },
        fecha_iso: {
          type: "string",
          description: "Fecha/hora acordada en formato ISO 8601 (hora de Chile)",
        },
      },
      required: ["titulo", "fecha_iso"],
    },
    run: async (input) => {
      const { titulo, fecha_iso } = input as { titulo: string; fecha_iso: string };
      const dueAt = new Date(fecha_iso);
      await prisma.reminder.create({
        data: {
          tenantId: lead.tenantId,
          leadId,
          title: titulo,
          dueAt: Number.isNaN(dueAt.getTime()) ? new Date() : dueAt,
        },
      });
      await prisma.leadNote.create({
        data: { leadId, body: titulo, author: "agent" },
      });
      return "Visita registrada y recordatorio creado.";
    },
  });

  const derivarAVendedor = betaTool({
    name: "derivar_a_vendedor",
    description:
      "Deriva la conversación a un vendedor humano. El agente deja de responder este chat hasta que el equipo lo reactive.",
    inputSchema: {
      type: "object",
      properties: {
        motivo: { type: "string" },
      },
      required: ["motivo"],
    },
    run: async (input) => {
      const { motivo } = input as { motivo: string };
      await prisma.lead.update({
        where: { id: leadId },
        data: { agentActive: false },
      });
      await prisma.leadEvent.create({
        data: {
          leadId,
          reason: `Derivado a vendedor: ${motivo}`,
          actor: "agent",
        },
      });
      return `Conversación derivada${lead.seller ? ` a ${lead.seller.name}` : " al equipo"}.`;
    },
  });

  const history = lead.messages.map((m) => ({
    role: (m.role === "customer" ? "user" : "assistant") as "user" | "assistant",
    content: m.body,
  }));

  const finalMessage = await client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: buildSystemPrompt(ctx),
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [calificarLead, moverEtapa, agendarVisita, derivarAVendedor],
    messages: history,
    max_iterations: 6,
  });

  const reply = finalMessage.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (reply) {
    await prisma.message.create({
      data: { leadId, role: "agent", body: reply },
    });
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        messageCount: { increment: 1 },
        lastActivityAt: new Date(),
      },
    });
  }
  return reply;
}
