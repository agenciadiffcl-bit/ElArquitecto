import { NextRequest, NextResponse } from "next/server";
import { prisma, getTenant } from "@/lib/db";

export async function POST(
  _request: NextRequest,
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

  await prisma.lead.update({
    where: { id },
    data: { agentActive: false },
  });
  await prisma.leadEvent.create({
    data: {
      leadId: id,
      reason: "Un asesor tomó el control de la conversación",
      actor: "human",
    },
  });

  return NextResponse.json({ ok: true });
}
