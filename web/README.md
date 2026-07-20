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
| Control de Ventas: cierres mensuales + utilidad | ✅ |
| Campañas Meta (listado con CPL) | ✅ |
| Asistente IA: configuración (solo lectura) | ✅ |
| WhatsApp Cloud API + agente Claude | Fase 1 |
| Publicación real MELI / Chileautos | Fase 1 |
| Consulta de patente + tasación | Fase 1 |
