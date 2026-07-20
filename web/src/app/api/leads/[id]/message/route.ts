import { NextRequest, NextResponse } from "next/server";
import { prisma, getTenant } from "@/lib/db";
import { runAgentTurn, AgentNotConfiguredError } from "@/lib/agent";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tenant = await getTenant();

  const lead = await prisma.lead.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
  }

  const { text } = (await request.json()) as { text?: string };
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  await prisma.message.create({
    data: { leadId: id, role: "customer", body: text.trim() },
  });
  await prisma.lead.update({
    where: { id },
    data: { messageCount: { increment: 1 }, lastActivityAt: new Date() },
  });

  let agentError: string | null = null;
  if (lead.agentActive) {
    try {
      await runAgentTurn(id);
    } catch (error) {
      if (error instanceof AgentNotConfiguredError) {
        agentError = error.message;
      } else {
        console.error("Agent error:", error);
        agentError =
          "El agente no pudo responder. Revisa la consola del servidor.";
      }
    }
  }

  const [messages, updatedLead] = await Promise.all([
    prisma.message.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.lead.findUniqueOrThrow({
      where: { id },
      include: { stage: true },
    }),
  ]);

  return NextResponse.json({
    messages,
    agentError,
    lead: {
      score: updatedLead.score,
      temperature: updatedLead.temperature,
      stage: updatedLead.stage.name,
      agentActive: updatedLead.agentActive,
    },
  });
}
