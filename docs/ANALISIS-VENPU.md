# Análisis funcional de Venpu (admin.venpu.cl)

> Levantamiento a partir de capturas reales de la cuenta del cliente (jul 2026).
> Documento en construcción — se completa a medida que llegan más pantallas.
> Estado: levantamiento completo (23+ pantallas, incluye ficha de lead y
> conversaciones reales del agente IA).

## Mapa de navegación (sidebar)

- **Dashboard**
- **GESTIÓN**: Vehículos · Consultar patente · Control de Ventas · Clientes ·
  Leads · Embudo · Recordatorios
- **MARKETING**: Campañas · Rendimiento · Estudio IA
- **ADMINISTRACIÓN**: Mi Plan · Sucursales · Equipo · Mi sitio web ·
  Asistente IA · Automatización · Asignación de leads · Integraciones

Header: chat de soporte, notificaciones (badge), banner de cobro ("Registra tu
tarjeta"), banner de estado de leads ("No estás recibiendo leads nuevos" +
botón Activar → los leads del marketplace son un servicio que se activa/paga).

---

## 1. Dashboard — "Lo que requiere tu atención hoy"

Filosofía: el dashboard NO es un panel de estadísticas, es una **lista de
acciones pendientes**. Elementos:

- Saludo personalizado + subtítulo "Lo que requiere tu atención hoy".
- CTA principal: **+ Agregar vehículo**.
- **Sugerencia de higiene de datos**: "169 leads podrían limpiarse — Perdidos
  hace +30 días" con acción masiva "Archivar todos (169)".
- **4 KPIs** con comparación vs mes anterior:
  - Stock disponible: 32
  - Ventas del mes: 4 (↓56% vs mes anterior)
  - Leads del mes: 558 (↓32% vs mes anterior)
  - Utilidad del mes: $0 ("Sin datos previos") → trackean utilidad, no solo ventas.
- **"Requiere atención (330)"** — lista priorizada de alertas operativas:
  - "291 leads HOT sin atender" (con nombres de los leads) → existe
    clasificación HOT visible y accionable.
  - "22 autos sin movimiento (+45 días)" → alerta de stock estancado.

**Para nuestro software**: replicar el patrón "atención hoy" y superarlo — que el
agente IA explique *por qué* cada ítem importa y proponga la acción (ej: bajar
precio del auto estancado, reasignar leads HOT).

## 2. Vehículos (listado)

- Contador de plan: **"32/100 vehículos publicados"** → el plan limita
  publicaciones simultáneas. "68 disponibles" (cupo restante).
- Alerta de calidad: "13 publicaciones incompletas — están perdiendo visibilidad
  frente a la competencia" + acción "Completar".
- Tabs: **Disponibles / Pendientes / Todos**.
- Búsqueda por código, título, patente + filtros: Marca, Estado, Combustible,
  "Más filtros". Botón **Exportar**.
- Columnas de la tabla:
  - Código interno (COD######)
  - Vehículo: foto miniatura + título + combustible · comuna
  - Precio / Año / Km-Horas
  - Estado (Disponible…)
  - Vendedor asignado
  - **Canales**: badges por portal publicado (ML = MercadoLibre amarillo,
    CA = Chileautos azul)
  - **% de calidad de la publicación** (91%, 97%…) con indicador de color

**Para nuestro software**: el score de calidad por publicación y los badges de
canal son excelente UX — replicar. Sumar: margen y días en stock como columnas.

## 3. Publicar vehículo (formulario "Nuevo vehículo")

### 3a. Arranque por patente
- Campo patente (formato AA1234 / AAAA12): **"Consultamos marca, modelo, año,
  motor, VIN y tasación automáticamente"** → autocompletado del vehículo +
  tasación de referencia desde la patente. Pieza clave de UX (en Chile:
  servicios tipo API de patentes — Boostr, GetAPI, AutoPress).

### 3b. Campos del formulario
- **Información básica**: Marca* → Modelo* (selects dependientes), Título*
  (validación: "no puede ser solo números"), Precio (rango validado $100.000–
  $500.000.000), Año, Km/Horas, Combustible.
- **Pie de financiamiento (opcional)**: monto $ o porcentaje %, "se mostrará en
  la ficha del vehículo".
- **Detalle**: Transmisión, Color exterior, Color interior, Tipo de vehículo,
  Carrocería, Versión, **Vencimiento permiso de circulación** (fecha),
  **Vencimiento revisión técnica** (fecha), Tags libres (separados por coma),
  Puertas, toggle "Único dueño", Dueños anteriores, Equipamiento (texto).
- **Descripción**: textarea 50–5000 caracteres con botón **"Mejorar con IA"**.
  Placeholder guía: estado, equipamiento, historial de mantenciones, razón de venta.
- **Ubicación y asignación**: Sucursal (prellenar ubicación y filtrar
  vendedores — "mostrando vendedores de la sucursal seleccionada"), Región*,
  Comuna*, Vendedor asignado.
- **Imágenes del vehículo**: hasta 50 imágenes, la primera es la principal.
  Formatos: JPEG, PNG, WebP, GIF, HEIC (máx 50MB) y video MP4, MOV, WebM
  (máx 500MB).
- **Canales de publicación (por vehículo)**: toggles de canal donde se
  publicará al activar el vehículo (en la cuenta del cliente solo aparece
  MercadoLibre activo → los canales visibles dependen de las integraciones
  conectadas de la cuenta).
- **"Consignación virtual"** (toggle por vehículo): "Actívalo si el auto no
  está físicamente en la automotora. El asistente no invitará al cliente a la
  sucursal y coordinará con un asesor cómo verlo." → **el comportamiento del
  agente IA se adapta según el vehículo** — detalle fino clave.
- Acciones: Cancelar / **Guardar borrador** / **Guardar y publicar**.
- Ítems adicionales del checklist lateral: tipo de carrocería ("categoría de
  búsqueda principal: SUV, Sedán, Hatchback"), número de puertas ("filtro de
  búsqueda frecuente"), equipamiento, ubicación.

### 3c. Panel lateral "Tu publicación X%" (gamificación)
Checklist de 12 campos con % de completitud y consejo por ítem, cada uno
explica el *por qué* en términos del portal:
- Fotos (10+; "los portales priorizan publicaciones con 10+ fotos")
- Video ("MeLi destaca publicaciones con video")
- Descripción 100+ caracteres ("generan más consultas en todos los portales")
- Precio ("los compradores filtran por precio en MELI y Yapo")
- Marca y modelo ("obligatorio en todos los portales")
- Patente ("obligatoria en MercadoLibre")
- Transmisión ("filtro de búsqueda principal en MELI y Yapo")
- Color, etc.

**Para nuestro software**: replicar completo el patrón patente→autocompletado y
el checklist con % — es la mejor pieza de UX de Venpu. Nota: mencionan Yapo como
portal (confirmar en pantalla de Integraciones qué canales soportan).

## 3c-bis. Consultar patente (herramienta suelta)

- "Consulta datos del **Registro Civil**, **tasación de mercado** y **alerta de
  encargo por robo** sin crear un vehículo." — input de patente + botón
  Consultar.
- Nota de la UI: "Los datos se cachean por 24h para reducir costos" con botón
  de refresh para forzar consulta nueva → la consulta a la fuente tiene costo
  por llamada (proveedor externo de datos de patente).

**Para nuestro software**: misma herramienta (tasación + dueño/registro +
encargo por robo) usando proveedores chilenos de datos de patente; cachear
igual. Es también el paso 1 del flujo de toma en parte de pago.

## 3d. Control de Ventas

- **Cumpleaños próximos** de clientes (sección propia; "en los próximos 30 días
  no hay cumpleaños registrados") → excusa de contacto post-venta.
- **Cierres mensuales**: períodos con botón **"Cerrar mes"** (candado). Cada
  cierre guarda: rango de fechas, fecha/hora en que se cerró, y totales de
  Ventas / Ingresos / Utilidad (ej. real: mayo 2026 — 5 ventas, $94.700.000
  ingresos, utilidad $0).
- Filtros: por vendedor, por **financiera**, por tipo. Botón **Descargar Excel**.
- Tabla de ventas: Vehículo (título + código), Tipo, Vendedor, Precio venta,
  **Gastos**, **Utilidad**, **Días** (días en stock hasta la venta, con color:
  63d rojo, 56d naranjo, 9d/16d normal), Fecha. Fila de Totales.
- Dato revelador: la utilidad del cliente aparece en $0 porque **no cargan los
  gastos por vehículo** — el campo existe pero no lo usan.

**Para nuestro software**: el "Cerrar mes" formal (congelar el período y generar
el informe) es exactamente el "balance automático" que pide el cliente —
replicar y automatizar (cierre + PDF + correo sin apretar botón). La utilidad
en $0 es una oportunidad: si la carga de gastos es fácil (foto de la factura →
IA extrae el monto), nuestro reporte de utilidad sí va a estar vivo.

## 4. Rendimiento (equipo y metas)

- Subtítulo: "Cómo atiende tu equipo las oportunidades comerciales".
- Alerta de routing: **"33 leads sin asignar (4%) — Estas oportunidades se
  enfrían cada hora"** + botón "Configurar routing" → asignación automática de
  leads configurable.
- **"Análisis del negocio" generado por IA** (con botón Actualizar): párrafo
  narrativo con diagnóstico y prioridades. Ejemplo real: "flujo constante de
  840 leads mensuales con asignación eficiente del 96%, aunque la meta de
  ventas presenta rezago al concretar solo 4 de 7 unidades. Es prioritario
  acelerar la conversión de los 33 prospectos sin asignar y reactivar el stock
  con más de 60 días en exhibición" + "Ver análisis completo".
- **Metas mensuales**: "Meta Julio — 4 de 7 ventas — 57% completado" con barra
  de progreso → metas de venta por mes (probablemente por vendedor también).
- **Rapidez en contactar (mediana 30d)**: métrica destacada (ej: **8s**) con
  umbrales explícitos: <15 min = óptimo, <1 hora = aceptable, >24 h = "lead
  frío". Mensaje: "Rapidez sana — así se gana al competidor".
- El "Análisis del negocio" se genera on-demand (estado "Analizando…" al
  refrescar) — no es estático.

**Para nuestro software**: tenemos ventaja natural aquí — nuestro análisis IA
puede ser conversacional (preguntarle al negocio) y accionable (que proponga y
ejecute: crear campaña, bajar precio, reasignar). Venpu solo narra.

## 4b. Leads (listado)

- Tabs con contadores: **Mis leads (1135) / Disponibles (983) / Todos (1135) /
  Matches (3) / Eliminados (26)**.
  - "Matches" → aparente cruce automático entre lo que busca un lead y el
    inventario disponible (confirmar con detalle de la pestaña).
- Búsqueda por nombre, email o teléfono. Filtros: **Fuente, Tipo de lead,
  Marca, Vendedor, rango de fechas** (desde/hasta). Exportar + "Agregar lead"
  manual.
- Tabla: Contacto (avatar, nombre, teléfono con botón copiar, email), Vehículo
  de interés (título + código, o "Sin vehículo"), **Etapa editable inline**
  (dropdown en la misma fila: "Calificado" verde, "Calificando" amarillo),
  **Fuente como badges combinables** (WhatsApp, Meta Ads — un lead puede tener
  ambas), Fecha relativa ("hace 3 minutos"), menú de acciones.

## 4c. Embudo (pipeline Kanban) — pieza central

- Vista Kanban de los mismos leads, con filtros arriba + **"Editar embudo"**
  (etapas personalizables) + "Añadir lead".
- **Etapas observadas**: Nuevo [etiqueta "Auto"] → Calificando [etiqueta "IA"]
  → Calificado → Contactado/Seguimiento → Visita Agendada → … (continúa a la
  derecha; confirmar etapas finales, p.ej. Negociación/Vendido/Perdido).
  - "Nuevo (Auto)": los leads entran solos desde los canales.
  - **"Calificando (IA)": el asistente IA conversa y califica en esta etapa —
    la calificación automática está embebida en el embudo.**
- Tarjeta de lead: nombre + ícono WhatsApp (abrir conversación), teléfono,
  vehículo de interés, badges de fuente (Meta Ads / WhatsApp / MercadoLibre),
  contador de mensajes (💬 3, 12, 34…), vendedor asignado, tiempo desde última
  actividad (3m, 25m, 2 días, 8 días).
- **Leads HOT**: ícono de llama roja + borde izquierdo rojo en la tarjeta.
- Badge "Perdido" en tarjetas descartadas (quedan visibles en su columna).

**Para nuestro software**: replicar completo (Kanban + etapas editables + HOT +
IA en etapa de calificación) y superar con: score numérico visible y explicable
("por qué está HOT"), SLA por etapa con alertas, movimiento automático también
post-calificación (visita agendada por el agente → mueve solo), y detección de
leads que se enfrían (sin respuesta X horas → acción sugerida).

## 4d. Campañas (Meta Ads) — Venpu YA crea campañas

- "Crea y gestiona tus campañas de Meta Ads" + botón **"Nueva campaña"** →
  la creación de campañas Meta desde la app existe en Venpu (no es vacío).
- Tabs: Activas (12) / Pausadas (0) / Borradores (0) / Todas (23).
- Nota de sincronización: "Estado local — sincronización automática cada hora"
  + botón manual **"Sincronizar con Meta"**. Exportar CSV. Filtro de período
  ("Acumulado (todo)").
- **Tipos de campaña observados**:
  - **"Catálogo"** (ej: "Consignación · 9/7 — Catálogo · 0 vehículos") →
    campañas de catálogo (Advantage+ / dynamic ads sobre feed de vehículos).
  - **"CTWA · [vehículos]"** (ej: "CTWA · FORD F150… — WhatsApp · 1 vehículo",
    "…3 vehículos", "…8 vehículos") → click-to-WhatsApp por vehículo(s)
    específico(s); el lead cae directo al asistente IA.
- Columnas: Estado, Campaña (nombre + tipo + n° vehículos), **Regiones**
  (segmentación geográfica: "Lo Barnechea, Las Condes +2", "Metropolitana,
  O'Higgins"), **Presupuesto diario** ($2.000–$10.000/día), **Contactos**
  (leads generados), Gasto, **CPL** (costo por lead: $695–$5.594), Impresiones,
  Alcance.

**Para nuestro software**: paridad = crear CTWA por vehículo y campañas de
catálogo con presupuesto/regiones, y reportar CPL por campaña. Esteroides =
el agente IA propone la campaña solo (detecta auto con 45+ días sin movimiento
→ sugiere CTWA con presupuesto y creativo del Estudio listos para aprobar),
optimiza por CPL entre campañas y cierra el loop: campaña → lead → venta
(ROAS real por vehículo, no solo CPL).

## 4e. Ficha de lead + conversación del agente IA (la joya del levantamiento)

La ficha se abre como panel lateral sobre el Kanban o como página propia
(`/leads/<id>`), dividida en ficha (izquierda) y conversación (derecha).

### Ficha (izquierda)
- Header: nombre (tal como viene de WhatsApp, con emojis), badges de fuente
  (Meta Ads, WhatsApp), **badge de temperatura** ("🔥 Caliente" rojo / "Frío"
  azul) y chip de etapa actual. Borde rojo si está caliente.
- CONTACTO: email, teléfono (copiar / abrir chat) + botón **"Registrar llamada"**.
- VEHÍCULO DE INTERÉS: vehículo vinculado + "Cambiar" + botón **"Registrar
  venta"** (la venta se registra desde el lead — cierra el loop lead→venta).
- ASIGNACIÓN: vendedor actual + "Reasignar a…".
- RECORDATORIOS: crear recordatorio desde la ficha.
- ETAPA: chips clicables con **el embudo completo**: Nuevo → Calificando →
  Calificado → Contactado/Seguimiento → Visita Agendada → Sin Respuesta →
  Ganado → Descartado → **Gestión Crédito → UPP evaluación → Consigna/Compra**
  (etapas específicas del rubro: crédito, tasación de parte de pago,
  consignación/compra directa).
- NOTAS: notas generadas por la IA ("Cliente confirma interés en el Audi Q3 y
  acepta contacto con asesor para coordinar visita", "El cliente indica
  explícitamente que no tiene…") + agregar manual.
- **BITÁCORA** (audit log de movimientos, con timestamp):
  - "Nuevo → Calificando — Agente IA inició la calificación"
  - "Calificando → Calificado — **Calificación: HOT (score: 90)**. Cliente
    confirma interés…"
  → **la calificación es un score numérico 0–100 con razón escrita**, y cada
  movimiento de etapa queda registrado con su motivo.

### Conversación (derecha)
- Header: "Conversación (N)" + badge "Agente IA". Footer: "El agente IA está
  atendiendo esta conversación" + botón **"Tomar control"** (handoff a humano).
- **El asistente tiene nombre propio**: "Hola Maite, soy **Antonia**, el
  asistente de Marketcar" — personaje configurable por automotora.
- Comportamientos observados en conversaciones reales:
  - Responde con la ficha exacta del vehículo (specs, km, dueños, precio) y
    cierra siempre ofreciendo coordinar visita con un asesor.
  - **Consciente de horario y equipo**: "hoy es domingo y estamos fuera del
    horario de atención, Martin se pondrá en contacto contigo mañana lunes.
    Te llamará desde el +56XXXXXXXXX, así podrás reconocer su número."
  - Maneja objeción de precio con empatía (explica el valor de la versión),
    ofrece alternativas según presupuesto, y si el cliente se baja ("Noooo.
    Gracias") cierra cortés y **califica Frío** — coherencia entre conversación
    y score.

## 4f. Automatización del Embudo (config por etapa)

- Página "Automatización del Embudo": "Configura qué hace el sistema en cada
  etapa. Las etapas se crean y ordenan desde el Embudo."
- Cada etapa es una tarjeta con: tipo (**entry** para "Nuevo", **progress**
  para las demás), y qué automatización tiene adjunta — en el cliente:
  "Agente IA" (activable/inactivo) en Nuevo, Calificando y **Sin Respuesta**;
  "Sin configuración" en Calificado, Contactado/Seguimiento, Visita Agendada.
- Lectura del modelo: **el agente IA se adjunta por etapa** — puede atender la
  entrada (Nuevo), calificar (Calificando) y reactivar dormidos (Sin
  Respuesta). Etapas sin automatización son manuales.

**Para nuestro software**: mismo modelo (automatización adjunta por etapa) pero
con más acciones por etapa: además de "Agente IA", permitir recordatorios
automáticos, SLA con alerta, mensajes plantilla, tareas al vendedor y
condiciones de movimiento automático.

## 4g. Integraciones

- **COMUNICACIÓN**:
  - Meta Business (Messenger, Instagram y **Lead Ads**) — conectado.
  - WhatsApp — "con tu propio número" — conectado (+56 9 XXXX XXXX).
- **ASISTENTE IA**:
  - **"Claude — Pregúntale a tus datos en lenguaje natural" — Incluido** →
    confirmado: Venpu usa Claude como motor de IA, y además expone un chat de
    consulta sobre los datos del negocio.
- **PUBLICACIÓN EN MARKETPLACES**:
  - MercadoLibre — "Incluido": **los vehículos se publican en la cuenta de
    Venpu**, no la del cliente.
  - "MercadoLibre cuenta propia" — opcional: publicar con cuenta propia "en
    paralelo a la de Venpu".
  - Yapo.cl — no conectado en el cliente.
  - Chile Autos — "Publica tu inventario y recibe leads automáticamente" — no
    conectado en el cliente.

**Observación estratégica**: el MELI "incluido" publica bajo la cuenta de
Venpu → la reputación y los avisos le pertenecen a Venpu, no a la automotora.
Nuestro producto publica SIEMPRE en las cuentas propias del cliente (MELI,
Chileautos): su reputación, sus leads, su data. Argumento de venta directo.

## 5. Estudio IA (creativos)

- Tabs: **Showrooms / Creativos / Contenido**.
- **Generador de showrooms con IA**: toma la foto del vehículo y lo ambienta en
  fondos generados. Presets: Showroom (concesionaria real, piso reflectante),
  Premium Luxury (mármol, chandelier), Montaña (carretera, cordillera,
  atardecer), Ciudad Nocturna (calle mojada, neón), Campo Rural (golden hour),
  Playa (costa, carretera costera), Minimalista (estudio, gradiente).
- Opción "Subir imagen — usa tu propio showroom" (fondos custom).
- Galería "Mis showrooms (19)" con contador de usos por fondo.

**Para nuestro software**: generación de imágenes ambientadas para avisos y
campañas. Factible con modelos de imagen actuales; el diferencial nuestro sería
conectar el creativo directo a la campaña Meta (Estudio → Campañas en un flujo).

## 6. Mi sitio web (catálogo público)

- "Catálogo público — tu catálogo de vehículos en una página lista para
  compartir. Sin configuración: se ve bien aunque no subas nada."
- Link público: **venpu.cl/<slug>** (slug personalizable, minúsculas/números/
  guiones).
- Personalización mínima: Logo, Portada (1600×600, fondo del hero), Imagen
  para compartir (1200×630, OG image para WhatsApp/redes), slider principal y
  eslogan.

**Vacío enorme para nosotros**: el "sitio" de Venpu es una subpágina dentro de
venpu.cl con branding mínimo. Nosotros ofrecemos sitio propio en dominio propio
de la automotora, nivel premium (prototipo Zentrum), con SEO local — es un
argumento de venta directo contra Venpu.

## 7. Asistente IA (agente de WhatsApp) — configuración

### 7a. ¿Cuándo responde? (condiciones de activación, OR)
Toggles independientes; si ninguna aplica, el mensaje queda en bandeja para el
equipo humano:
- **Leads de campañas publicitarias (CTWA)** — cuando alguien llega desde un
  anuncio Meta/Facebook/Instagram Ads (click-to-WhatsApp). [ON en el cliente]
- **Contactos nuevos** — números que nunca habían escrito. [ON]
- **Contactos existentes** — números con historial previo. [OFF en el cliente
  → prefieren que a clientes conocidos responda un humano]

### 7b. ¿Qué servicios ofrece tu agente?
"El flujo de venta de vehículos siempre está activo"; se activan además los
servicios que la automotora realmente ofrece (el asistente solo habla de lo
activado):
- Consignación de vehículos [ON]
- Compra directa o parte de pago [ON]
- (posibles más — pantalla cortada)

### 7c. Conocimiento e instrucciones custom (texto libre)
Campo "qué debe saber/decir" — el cliente cargó: links de Instagram, Waze y
Google Maps del local, normas de marca ("escribe siempre Marketcar, no Market
Car"), reglas de proceso ("siempre agendar visita cuando quieran venir a ver
autos"), guión de tono para responder la pregunta por comisión de consignación,
instrucciones operativas ("cuando pidan fotos envía 4 del exterior y 4 del
interior").

Campo separado **"Qué NO debe decir"** — restricciones del cliente real:
- no dar descuentos ni costos de autos
- no hablar de "compañero", siempre ofrecer la atención de un asesor
- no entregar precios de autos en parte de pago
- decir "automotora", no "concesionario/concesionaria"
- ante datos de vehículos en parte de pago/compra/consignación: sin comentarios,
  ni positivos ni negativos, no ser optimista
- no usar modismos

Hints de la UI: "si preguntan por garantía, di que todos los autos tienen 3
meses; si piden el local, comparte la dirección" / "nunca prometer descuentos;
no dar precios de financiamiento; no recomendar otra automotora".

**Para nuestro software**: este es el corazón del producto. Replicar el patrón
de configuración (condiciones de activación + servicios + saber/no decir, que
en la práctica es un system prompt editable por el dueño) y superarlo con:
agendamiento real de visitas (calendario), envío automático de fotos/ficha del
vehículo consultado, calificación del lead en la misma conversación, y handoff
con resumen al vendedor.

---

## Detalles menores sin levantar (no bloquean el diseño)

Clientes, Recordatorios, tabs Creativos/Contenido del Estudio, Asignación de
leads (routing), Mi Plan (precios), Sucursales/Equipo, pestaña "Matches" de
Leads y el flujo "Nueva campaña". Se pueden pedir al cliente puntualmente
cuando toque diseñar cada módulo.

---

# SÍNTESIS — Mapa paridad vs. esteroides

## Confirmaciones clave del levantamiento

1. **Venpu usa Claude** (visible en Integraciones). No es moat: tenemos acceso
   al mismo motor. La diferencia se hará en la profundidad de la integración.
2. La calificación de leads es **un agente de WhatsApp con nombre propio**
   ("Antonia") que conversa, califica con **score 0–100 + razón escrita**
   (bitácora: "HOT (score: 90)"), asigna temperatura (Caliente/Frío) y mueve
   la etapa solo. El agente se adjunta **por etapa** del embudo.
3. El embudo real del rubro tiene 11 etapas, incluyendo específicas:
   **Gestión Crédito, UPP evaluación, Consigna/Compra**.
4. Venpu publica en MELI **con la cuenta de Venpu** (la reputación es de
   ellos); Chileautos y Yapo existen como integraciones opcionales.
5. El dashboard es una lista de acciones ("requiere atención"), no un panel de
   estadísticas. Los reportes financieros existen pero mueren porque nadie
   carga gastos (utilidad $0).

## Paridad (replicar tal cual — es la base esperada)

- Alta por patente con autocompletado + tasación; checklist "% publicación".
- Inventario con canales por vehículo, score de calidad, export.
- Embudo Kanban con etapas editables, tarjetas ricas, HOT, bitácora.
- Agente WhatsApp: nombre configurable, condiciones de activación, servicios,
  saber/no-decir, consignación virtual por vehículo, "Tomar control".
- Campañas Meta: CTWA por vehículo + catálogo, CPL, sync con Meta.
- Control de ventas con cierre mensual + Excel; metas mensuales; rapidez de
  contacto; análisis narrado del negocio; recordatorios; cumpleaños.
- Consultar patente (Registro Civil + tasación + encargo por robo, caché 24h).
- Estudio de creativos con fondos IA.
- Catálogo público compartible.

## Esteroides (dónde ganamos)

1. **Identidad propia**: sitio en dominio del cliente (nivel Zentrum) +
   publicación en MELI/Chileautos con las cuentas del cliente. Su marca, su
   reputación, su data — no la de la plataforma.
2. **Agente que ejecuta, no solo conversa**: agenda visitas en calendario
   real, envía fotos/ficha automáticamente, registra la tasación de parte de
   pago, y hace handoff con resumen al vendedor por WhatsApp.
3. **IA operativa proactiva**: propone campañas para stock estancado (creativo
   + presupuesto listos para aprobar), detecta leads enfriándose, redacta el
   cierre mensual en lenguaje natural y lo envía solo.
4. **Utilidad viva**: captura de gastos sin fricción (foto de factura → IA
   extrae monto) para que margen/utilidad reporten de verdad.
5. **Chat con tus datos con acciones**: no solo "pregúntale a tus datos" —
   "hazlo" (crear campaña, reasignar, recordar, exportar).
6. **Post-venta**: garantías, recompra 2–3 años, referidos — Venpu no lo toca.
7. **ROAS real por vehículo**: cerrar el loop campaña → lead → venta (Venpu
   muestra CPL, nosotros mostramos qué campaña vendió autos).
