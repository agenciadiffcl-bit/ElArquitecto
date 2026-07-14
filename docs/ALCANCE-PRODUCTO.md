# Plataforma de Gestión para Automotoras — Alcance de Producto

> Documento de trabajo. Objetivo: reemplazar GHL para el cliente actual y sentar la base
> de un producto vendible a otras automotoras en Chile.

## 1. Visión

Un sistema de gestión integral ("el sistema operativo de la automotora") con estética
premium, que centraliza inventario, ventas, publicación multicanal y marketing con IA.
No competimos con Venpu en marketplace/generación de leads; competimos en ser la
herramienta con la que la automotora **opera**: donde GHL se queda corto por ser
genérico y Venpu por ser un canal más que un sistema.

**Diferenciadores:**
- Publicar una vez → aparece en Chileautos, MercadoLibre y el sitio propio.
- Reportes y cierres mensuales automáticos (ventas, márgenes, stock, comisiones).
- Agente de IA integrado: redacta avisos, crea campañas de Meta, responde leads.
- Diseño premium (nivel del prototipo Zentrum ya existente en este repo).

## 2. Módulos

### Fase 1 — MVP (recuperar al cliente)

| Módulo | Contenido |
|---|---|
| **Inventario de vehículos** | Ficha completa por vehículo (patente, VIN, marca/modelo/versión, año, km, costo, precio, fotos, estado: disponible / reservado / vendido / en preparación). Consignaciones. Historial de costos por vehículo (preparación, comisiones). |
| **CRM / Pipeline de ventas** | Leads unificados (formulario web, Chileautos, MercadoLibre, WhatsApp, Meta). Pipeline por etapas, asignación a vendedores, recordatorios, historial de contacto. |
| **Publicación multicanal** | Publicar/actualizar/despublicar desde la app hacia Chileautos (API oficial) y MercadoLibre (API pública). Sitio público propio con el stock en vivo. |
| **Cotizaciones y ventas** | Cotización PDF con branding, registro de venta (forma de pago, parte de pago, financiamiento), nota de venta. |
| **Reportes automáticos** | Dashboard: ventas del mes, margen por vehículo, días en stock, conversión por canal, ranking de vendedores. Cierre mensual automático por correo/PDF. |
| **WhatsApp** | Bandeja de conversaciones vía WhatsApp Cloud API, vinculada al lead y al vehículo. |
| **Autocalificación de leads (IA)** | Cada lead se puntúa y clasifica automáticamente (caliente/tibio/frío) a partir de la conversación (WhatsApp, formularios) y su comportamiento (portal de origen, vehículo consultado, presupuesto, urgencia detectada). El pipeline se mueve solo: el agente detecta intención ("¿tienen financiamiento?", "¿puedo ir a verlo hoy?") y avanza la etapa, asigna prioridad y alerta al vendedor. Cola diaria "leads calientes de hoy" por vendedor. |

### Fase 2 — Producto (vender a más automotoras)

- **Agente de IA**: redacción de avisos por vehículo, creación de campañas Meta
  (Marketing API), respuestas sugeridas a leads, resumen semanal del negocio en
  lenguaje natural ("¿cómo vamos este mes?").
- **Facturación electrónica SII** vía proveedor DTE (OpenFactura/LibreDTE/Facto) —
  no certificación directa con el SII.
- **Multi-tenant + billing**: onboarding self-service, suscripción mensual.
- **Balances contables**: se alimentan de las DTE emitidas/recibidas. No construir
  contabilidad completa — reportería financiera sí, contabilidad tributaria se
  integra o se exporta al contador.
- Portal de firmas/documentos (transferencia, mandatos), integración financieras.

## 2b. Vacíos de Venpu — dónde ser "Venpu con esteroides"

Venpu es marketplace-first: sus herramientas B2B existen para alimentar su propio
portal. Eso deja vacíos estructurales que un sistema operativo de automotora sí cubre:

1. **Operación interna completa**: costos por vehículo, consignaciones, comisiones de
   vendedores, preparación/taller, márgenes reales. Venpu ve el aviso; nosotros vemos
   el negocio.
2. **Neutralidad de canal**: publicamos en *todos* los portales (Chileautos, MELI,
   sitio propio y eventualmente Venpu mismo como un canal más). Venpu nunca va a
   publicar en su competencia.
3. **La data del lead es del cliente**: conversaciones, historial y audiencias viven
   en la automotora, no en el ecosistema del portal → remarketing propio en Meta con
   esa data (audiencias personalizadas desde el CRM).
4. **Post-venta y ciclo de vida**: garantías, seguimiento, campaña de recompra a los
   2–3 años, referidos. Nadie en el nicho lo trabaja bien y es venta recurrente
   gratis para la automotora.
5. **Toma de parte de pago / tasación**: flujo de trade-in con tasación asistida por
   IA (referencias de mercado + estado del vehículo) — alimenta el inventario solo.
6. **Financiero/tributario**: DTE, cierres mensuales, reportería — Venpu no toca esto.
7. **Agente IA operativo 24/7**: no solo califica; responde de madrugada, agenda
   visitas, redacta avisos, arma campañas. El vendedor llega en la mañana con la
   pega pre-masticada.

## 2c. Núcleo multi-vertical (futuro: real estate y otros)

El patrón de fondo es genérico: **inventario de activos de alto valor + leads
multicanal + publicación en portales + agente IA**. Automotora y corretaje de
propiedades son el mismo esqueleto con distinto vocabulario:

| Núcleo | Automotora | Real estate |
|---|---|---|
| Activo | Vehículo (patente, km, versión) | Propiedad (rol, m², dormitorios) |
| Portales | Chileautos, MercadoLibre | PortalInmobiliario, Yapo, TocToc |
| Calificación IA | Presupuesto, urgencia, parte de pago | Presupuesto, pre-aprobación, comuna |
| Cierre | Transferencia, financiamiento | Promesa, crédito hipotecario |

**Regla de diseño (importante)**: NO construir la plataforma abstracta ahora — eso
mata MVPs. Se construye 100% concreto para automotoras, pero con tres separaciones
limpias que hacen barato el fork a otro nicho después: (a) el esquema del activo en
su propio módulo, (b) integraciones de portales como *adapters* intercambiables,
(c) prompts/herramientas del agente IA por vertical. La abstracción se hace recién
cuando exista el segundo vertical real.

## 3. Integraciones — factibilidad verificada

| Integración | Estado | Nota |
|---|---|---|
| **Chileautos** | ✅ API oficial de inventario y leads | Permite publicar, modificar y eliminar avisos; requiere `x-seller-identifier` de la automotora (cuenta de dealer activa). Doc: chileautos.cl/staticpages/global-inventory-integration |
| **MercadoLibre** | ✅ API pública documentada | Categoría autos usa publicaciones pagadas; se gestiona con la cuenta MELI del cliente vía OAuth. |
| **Meta (campañas)** | ✅ Marketing API pública | Crear campañas/audiencias/creativos desde la app. Requiere app de Meta con permisos de ads y la cuenta publicitaria del cliente. |
| **WhatsApp** | ✅ Cloud API de Meta | Número dedicado de la automotora. |
| **SII (DTE)** | ✅ vía proveedor | OpenFactura, LibreDTE o Facto por API. Días de trabajo, no meses. |
| **Yapo / otros portales** | ⚠️ sin API pública conocida | Fuera del MVP; evaluar acuerdos después. |
| **Financieras (Forum, Tanner…)** | ⚠️ requiere partnership | Fase posterior; no es código, es comercial. |

## 4. Arquitectura propuesta

- **Stack**: Next.js (App Router) + TypeScript + Tailwind, PostgreSQL (Supabase o
  Neon), Prisma. Jobs/colas para sincronización con portales (reintentos,
  publicación diferida). Almacenamiento de fotos en S3/R2 con optimización.
- **Diseño**: sistema visual derivado del prototipo Zentrum (dark, dorado, tipografía
  SF-style) → identidad premium consistente entre app y sitio público.
- **IA**: Claude API con tool-use para el agente (herramientas: crear campaña Meta,
  redactar aviso, consultar inventario/reportes). El agente opera *dentro* de la app.
- **Multi-tenant desde el día 1 en el modelo de datos** (columna `tenant_id`), aunque
  el MVP corra para un solo cliente — evita reescritura en Fase 2.

## 5. Plazos estimados (dedicación parcial, con Claude Code)

| Hito | Plazo acumulado |
|---|---|
| Esqueleto app + inventario + sitio público | 2–3 semanas |
| CRM/pipeline + WhatsApp | 4–5 semanas |
| Publicación Chileautos + MercadoLibre | 6–8 semanas (incluye alta de credenciales del cliente) |
| Reportes/cierre mensual + cotizaciones → **MVP entregable** | 8–10 semanas |
| Agente IA + campañas Meta | +3–4 semanas |
| DTE + multi-tenant + billing → **producto vendible** | +2–3 meses |

## 6. Modelo comercial sugerido

1. El cliente actual financia el MVP como desarrollo a medida; **la propiedad
   intelectual queda contigo** (cláusula explícita en el contrato).
2. Validar con 2–3 automotoras adicionales antes de invertir en multi-tenant/billing.
3. Suscripción mensual por automotora + escalones por volumen de stock/usuarios.
   El cliente que comercializa puede tener revenue share o precio fundador.

## 7. Riesgos

- **Credenciales de terceros**: Chileautos y MELI requieren cuentas activas del
  cliente; iniciar esos trámites la semana 1, no al final.
- **Scope de un solo cliente**: cada feature del MVP debe justificarse para "una
  automotora promedio", no solo para este cliente.
- **Mantenimiento vs. agencia**: el SaaS compite por tu tiempo; no pasar a Fase 2
  sin validación comercial real.
