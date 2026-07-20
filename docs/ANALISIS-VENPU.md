# Análisis funcional de Venpu (admin.venpu.cl)

> Levantamiento a partir de capturas reales de la cuenta del cliente (jul 2026).
> Documento en construcción — se completa a medida que llegan más pantallas.
> Estado: 10 de 23 pantallas analizadas.

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
  vendedores), Región*, Comuna*, Vendedor asignado.
- Acciones: Cancelar / **Guardar borrador** / **Guardar y publicar**.

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

**Para nuestro software**: tenemos ventaja natural aquí — nuestro análisis IA
puede ser conversacional (preguntarle al negocio) y accionable (que proponga y
ejecute: crear campaña, bajar precio, reasignar). Venpu solo narra.

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

## Pendiente de levantar (pantallas que faltan)

- [ ] **Leads** (listado, ficha de un lead, calificación HOT/tibio/frío)
- [ ] **Embudo** (etapas del pipeline y movimiento automático)
- [ ] **Clientes** (ficha, historial)
- [ ] **Control de Ventas** (registro de venta, utilidad)
- [ ] **Consultar patente** (qué devuelve)
- [ ] **Recordatorios**
- [ ] **Campañas** (creación/gestión de campañas Meta)
- [ ] **Estudio IA — tabs Creativos y Contenido**
- [ ] **Automatización** (qué automatizaciones ofrece)
- [ ] **Asignación de leads** (routing)
- [ ] **Integraciones** (canales/portales conectables)
- [ ] **Mi Plan** (precios y límites por plan)
- [ ] **Sucursales / Equipo** (roles y permisos)
- [ ] **Bandeja WhatsApp** (cómo se ve la conversación + IA)
