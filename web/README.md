# DIFF Motors — Plataforma de gestión para automotoras

CRM integral para automotoras: inventario, embudo de leads con agente IA,
publicación multicanal (MercadoLibre, Chileautos, sitio propio), campañas
Meta y control de ventas con utilidad viva.

Contexto de producto: ver `../docs/ALCANCE-PRODUCTO.md` y
`../docs/ANALISIS-VENPU.md`.

## Stack

- Next.js (App Router) + TypeScript + Tailwind 4
- Prisma 7 + SQLite en desarrollo (esquema portable a PostgreSQL)
- Multi-tenant desde el modelo de datos (`tenantId` en todas las entidades)

## Desarrollo

```bash
npm install
npx prisma migrate dev   # crea dev.db
npm run seed             # datos demo (tenant Marketcar)
cp .env.example .env     # y completa ANTHROPIC_API_KEY para el agente
npm run dev
```

## Módulos (estado actual)

| Módulo | Estado |
|---|---|
| Dashboard "requiere atención" + KPIs con utilidad real | ✅ |
| Vehículos: listado con canales, margen, días en stock y % calidad | ✅ |
| Nuevo vehículo: formulario con checklist "Tu publicación" en vivo | ✅ |
| Embudo Kanban (11 etapas, HOT, score IA) | ✅ |
| Leads + ficha con bitácora, notas y calificación IA | ✅ |
| **Agente IA real (Claude) con simulador de conversación** | ✅ |
| Control de Ventas: cierres mensuales + utilidad | ✅ |
| Campañas Meta (listado con CPL) | ✅ |
| Asistente IA: configuración (solo lectura) | ✅ |
| WhatsApp Cloud API (canal real) | Fase 1 |
| Publicación real MELI / Chileautos | Fase 1 |
| Consulta de patente + tasación | Fase 1 |

### Agente IA

`src/lib/agent.ts` implementa el agente ("Antonia" en la demo) con Claude
(`claude-opus-4-8` + tool use). En la ficha de un lead (`/leads/[id]`), el
panel de conversación es un **simulador**: escribes como si fueras el cliente
y el agente responde de verdad, usando el inventario y la configuración de
`AgentConfig` (nombre, servicios, qué debe/no debe decir).

El agente tiene 4 herramientas internas — nunca visibles para el cliente:

- `calificar_lead` — score 0–100 + temperatura + razón (igual que la bitácora de Venpu)
- `mover_etapa` — avanza el embudo según la conversación
- `agendar_visita` — crea un recordatorio cuando se acuerda una visita
- `derivar_a_vendedor` — pausa el agente y pasa la conversación al equipo

Requiere `ANTHROPIC_API_KEY` en `.env` — sin ella, el simulador sigue
guardando los mensajes del cliente pero muestra un aviso en vez de romperse.
Para conectar el canal real de WhatsApp (Fase 1), el mismo `runAgentTurn(leadId)`
se reutiliza desde el webhook de WhatsApp Cloud API.
