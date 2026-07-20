// Seed de desarrollo: un tenant demo con datos realistas del rubro,
// calcados del levantamiento funcional (docs/ANALISIS-VENPU.md).
import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

const daysAgo = (n: number, hoursOffset = 0) =>
  new Date(Date.now() - n * 86_400_000 - hoursOffset * 3_600_000);

async function main() {
  // Limpieza (orden por dependencias)
  await prisma.leadEvent.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.monthlyClose.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.vehicleExpense.deleteMany();
  await prisma.vehicleChannel.deleteMany();
  await prisma.vehiclePhoto.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.pipelineStage.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.agentConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({
    data: { name: "Marketcar", slug: "marketcar" },
  });

  const trapenses = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: "Los Trapenses",
      region: "Metropolitana de Santiago",
      comuna: "Lo Barnechea",
    },
  });
  const chicureo = await prisma.branch.create({
    data: {
      tenantId: tenant.id,
      name: "Chicureo",
      region: "Metropolitana de Santiago",
      comuna: "Colina",
    },
  });

  const juan = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: trapenses.id,
      name: "Juan Domínguez",
      email: "juan@demo.cl",
      phone: "+56989069916",
      role: "owner",
    },
  });
  const martin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      branchId: trapenses.id,
      name: "Martín Stuckrath",
      email: "martin@demo.cl",
      phone: "+56911111111",
      role: "seller",
    },
  });

  // Embudo (11 etapas — paridad con el rubro)
  const stageDefs: Array<[string, string, boolean]> = [
    ["Nuevo", "entry", true],
    ["Calificando", "progress", true],
    ["Calificado", "progress", false],
    ["Contactado/Seguimiento", "progress", false],
    ["Visita Agendada", "progress", false],
    ["Sin Respuesta", "progress", true],
    ["Gestión Crédito", "progress", false],
    ["UPP evaluación", "progress", false],
    ["Consigna/Compra", "progress", false],
    ["Ganado", "won", false],
    ["Descartado", "lost", false],
  ];
  const stages: Record<string, string> = {};
  for (let i = 0; i < stageDefs.length; i++) {
    const [name, kind, agentEnabled] = stageDefs[i];
    const s = await prisma.pipelineStage.create({
      data: { tenantId: tenant.id, name, order: i, kind, agentEnabled },
    });
    stages[name] = s.id;
  }

  // Inventario
  const vehicleDefs = [
    {
      code: "COD921820", brand: "Chevrolet", model: "Silverado", version: "Trail Boss 5.3 LTS",
      title: "Chevrolet Silverado Trail Boss 5.3 LTS 2021", year: 2021, km: 47739,
      price: 31450000, acquisitionCost: 27500000, fuel: "bencina", transmission: "automatica",
      bodyType: "camioneta", doors: 4, exteriorColor: "Rojo", plate: "PLKW32",
      description: "Camioneta en excelente estado, único dueño, mantenciones al día en concesionario. Neumáticos nuevos, sin detalles.",
      equipment: "Aire acondicionado, cierre centralizado, alzavidrios eléctricos, cámara de retroceso",
      status: "available", createdDaysAgo: 61, seller: null, photos: 12,
      channels: ["mercadolibre"],
    },
    {
      code: "COD921802", brand: "KIA", model: "Sportage", version: "EX 2.0L MT",
      title: "KIA Sportage EX 2.0L MT 2023", year: 2023, km: 42927,
      price: 18450000, acquisitionCost: 16200000, fuel: "bencina", transmission: "manual",
      bodyType: "suv", doors: 5, exteriorColor: "Blanco", plate: "RJXP82",
      description: "SUV familiar, segundo dueño, historial de mantenciones completo. Se recibe auto en parte de pago.",
      equipment: "Pantalla táctil, Apple CarPlay, sensores de estacionamiento",
      status: "available", createdDaysAgo: 34, seller: martin.id, photos: 8,
      channels: ["mercadolibre"],
    },
    {
      code: "COD921766", brand: "Ford", model: "F-150", version: "Lariat Black 5.0 V8",
      title: "Ford F-150 Lariat Black 5.0 V8 2025 Facturable", year: 2025, km: 45000,
      price: 49450000, acquisitionCost: 44000000, fuel: "bencina", transmission: "automatica",
      bodyType: "camioneta", doors: 4, exteriorColor: "Negro", plate: "TTBB10",
      description: "Facturable. Full equipo, techo panorámico, cuero, suspensión adaptativa. Ideal empresa.",
      equipment: "Cuero, techo panorámico, asientos eléctricos, tow package",
      status: "available", createdDaysAgo: 18, seller: juan.id, photos: 15,
      channels: ["mercadolibre", "chileautos"],
    },
    {
      code: "COD921740", brand: "Chevrolet", model: "Silverado", version: "Diesel 3.0L 4X4 AT",
      title: "Chevrolet Silverado Diesel 3.0L 4X4 AT 2023", year: 2023, km: 40500,
      price: 51950000, acquisitionCost: 46500000, fuel: "diesel", transmission: "automatica",
      bodyType: "camioneta", doors: 4, exteriorColor: "Blanco", plate: "SKLM77",
      description: "Motor Duramax diesel, tracción 4x4, único dueño. Mantenciones en Salfa. Impecable.",
      equipment: "4x4, cámara 360, asistente de arrastre, Bose",
      status: "available", createdDaysAgo: 49, seller: null, photos: 11,
      channels: ["mercadolibre"],
    },
    {
      code: "COD921671", brand: "KIA", model: "Sonet", version: "1.5 EX Full 6MT",
      title: "KIA Sonet 1.5 EX Full 6MT 2025", year: 2025, km: 962,
      price: 15550000, acquisitionCost: 13900000, fuel: "bencina", transmission: "manual",
      bodyType: "suv", doors: 5, exteriorColor: "Gris", plate: "TVGH55",
      description: "Prácticamente nuevo, 962 km. Garantía de fábrica vigente hasta 2030. Oportunidad.",
      equipment: "Pantalla 10.25, cámara retroceso, control crucero, 6 airbags",
      status: "available", createdDaysAgo: 9, seller: martin.id, photos: 14,
      channels: ["mercadolibre", "chileautos", "sitio"],
    },
    {
      code: "COD921513", brand: "Audi", model: "Q3 Sportback", version: "35 TFSI 1.4",
      title: "Audi Q3 Sportback 35 TFSI 1.4 2021", year: 2021, km: 50500,
      price: 21450000, acquisitionCost: 18800000, fuel: "bencina", transmission: "automatica",
      bodyType: "suv", doors: 5, exteriorColor: "Rojo", plate: "PPRD21",
      description: "SUV coupé, 3 dueños, mantenciones al día. Cuenta con garantía mecánica de 3 meses incluida.",
      equipment: "Virtual cockpit, cuero, portalón eléctrico, keyless",
      status: "available", createdDaysAgo: 27, seller: martin.id, photos: 10,
      channels: ["mercadolibre", "sitio"],
    },
    {
      code: "COD920818", brand: "BMW", model: "550", version: "M Sport",
      title: "BMW 550 M Sport 2023", year: 2023, km: 15341,
      price: 30950000, acquisitionCost: 26900000, fuel: "bencina", transmission: "automatica",
      bodyType: "sedan", doors: 4, exteriorColor: "Negro", plate: "SSQQ90",
      description: "Sedán negro, único dueño, 15.341 km. Garantía vigente y mantenciones incluidas hasta 2027.",
      equipment: "M Sport package, Harman Kardon, head-up display",
      status: "available", createdDaysAgo: 56, seller: juan.id, photos: 9,
      channels: ["mercadolibre"], singleOwner: true,
    },
    {
      code: "COD920822", brand: "Subaru", model: "Outback", version: "2.5 Limited",
      title: "Subaru Outback 2.5 Limited 2022", year: 2022, km: 38200,
      price: 24990000, acquisitionCost: 21900000, fuel: "bencina", transmission: "automatica",
      bodyType: "suv", doors: 5, exteriorColor: "Verde", plate: "RRFF34",
      description: "AWD simétrico, EyeSight, un solo dueño. Ideal outdoor. Se recibe parte de pago.",
      equipment: "AWD, EyeSight, cuero, techo solar",
      status: "available", createdDaysAgo: 72, seller: null, photos: 7,
      channels: ["mercadolibre"], singleOwner: true, consignment: true,
    },
  ];

  const vehicles: Record<string, string> = {};
  for (const def of vehicleDefs) {
    const v = await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        branchId: trapenses.id,
        sellerId: def.seller,
        code: def.code,
        plate: def.plate,
        brand: def.brand,
        model: def.model,
        version: def.version,
        title: def.title,
        year: def.year,
        km: def.km,
        fuel: def.fuel,
        transmission: def.transmission,
        bodyType: def.bodyType,
        doors: def.doors,
        exteriorColor: def.exteriorColor,
        equipment: def.equipment,
        price: def.price,
        acquisitionCost: def.acquisitionCost,
        description: def.description,
        status: def.status,
        singleOwner: def.singleOwner ?? false,
        consignment: def.consignment ?? false,
        createdAt: daysAgo(def.createdDaysAgo),
        publishedAt: daysAgo(def.createdDaysAgo - 1),
        photos: {
          create: Array.from({ length: def.photos }, (_, i) => ({
            url: `/placeholder/vehicle.jpg`,
            position: i,
            isMain: i === 0,
          })),
        },
        channels: {
          create: def.channels.map((channel) => ({
            channel,
            status: "published",
            syncedAt: daysAgo(1),
          })),
        },
      },
    });
    vehicles[def.code] = v.id;
  }

  // Gastos cargados en algunos vehículos (utilidad viva)
  await prisma.vehicleExpense.createMany({
    data: [
      { vehicleId: vehicles["COD921820"], label: "Desabolladura y pintura", amount: 380000, date: daysAgo(55) },
      { vehicleId: vehicles["COD921820"], label: "Neumáticos", amount: 520000, date: daysAgo(50) },
      { vehicleId: vehicles["COD921513"], label: "Mantención 50.000 km", amount: 290000, date: daysAgo(20) },
      { vehicleId: vehicles["COD921671"], label: "Detailing", amount: 120000, date: daysAgo(5) },
    ],
  });

  // Leads con calificación IA, bitácora y notas
  type LeadDef = {
    name: string; phone: string; vehicle?: string; stage: string;
    sources: string; temperature?: string; score?: number; scoreReason?: string;
    seller?: string; messages: number; hoursAgo: number; lost?: boolean;
    note?: string;
  };
  const leadDefs: LeadDef[] = [
    {
      name: "Maite", phone: "+56926256839", vehicle: "COD921513", stage: "Calificado",
      sources: "whatsapp,meta_ads", temperature: "hot", score: 90,
      scoreReason: "Cliente confirma interés en el Audi Q3 y acepta contacto con asesor para coordinar visita.",
      seller: martin.id, messages: 5, hoursAgo: 3,
      note: "Cliente confirma interés en el Audi Q3 y acepta contacto con asesor para coordinar visita.",
    },
    {
      name: "Elena Cornejo", phone: "+56989869024", vehicle: "COD920822", stage: "Calificado",
      sources: "meta_ads,whatsapp", temperature: "hot", score: 85,
      scoreReason: "Pregunta por disponibilidad inmediata y financiamiento. Tiene auto para parte de pago.",
      seller: juan.id, messages: 2, hoursAgo: 1,
    },
    {
      name: "Francisco", phone: "+56993938397", vehicle: "COD920818", stage: "Calificando",
      sources: "meta_ads,whatsapp", temperature: "cold", score: 25,
      scoreReason: "El cliente indica explícitamente que no tiene presupuesto para el vehículo; solo miraba modelos.",
      seller: martin.id, messages: 16, hoursAgo: 5,
      note: "El cliente indica explícitamente que no tiene presupuesto acorde. Descartar seguimiento comercial activo.",
    },
    {
      name: "Paty", phone: "+56963544437", stage: "Calificando",
      sources: "meta_ads,whatsapp", messages: 3, hoursAgo: 4, seller: martin.id,
    },
    {
      name: "Jorge", phone: "+56984374297", vehicle: "COD921671", stage: "Calificando",
      sources: "meta_ads,whatsapp", messages: 3, hoursAgo: 4, seller: martin.id,
    },
    {
      name: "Christian", phone: "+56999790256", vehicle: "COD920818", stage: "Contactado/Seguimiento",
      sources: "meta_ads,whatsapp", temperature: "hot", score: 78,
      scoreReason: "Pidió cotización con financiamiento; espera respuesta de pie mínimo.",
      seller: juan.id, messages: 4, hoursAgo: 48,
    },
    {
      name: "Cristian Cisternas", phone: "+56975668370", vehicle: "COD920822", stage: "Contactado/Seguimiento",
      sources: "meta_ads,whatsapp", temperature: "cold", score: 30,
      scoreReason: "Sin respuesta hace 8 días tras cotización enviada.",
      seller: martin.id, messages: 34, hoursAgo: 192, lost: true,
    },
    {
      name: "Fernando", phone: "+56995423217", vehicle: "COD921802", stage: "Contactado/Seguimiento",
      sources: "meta_ads,whatsapp,mercadolibre", temperature: "hot", score: 82,
      scoreReason: "Vio el vehículo en MercadoLibre, pregunta si puede ir el sábado.",
      seller: martin.id, messages: 6, hoursAgo: 4,
    },
    {
      name: "Rodrigo", phone: "+56977665544", vehicle: "COD921802", stage: "Visita Agendada",
      sources: "meta_ads", temperature: "hot", score: 88,
      scoreReason: "Visita agendada para el jueves 10:30 en Los Trapenses.",
      seller: juan.id, messages: 9, hoursAgo: 20,
    },
    {
      name: "Graciela Hapette", phone: "+56984117226", vehicle: "COD921671", stage: "Calificando",
      sources: "meta_ads,whatsapp", messages: 3, hoursAgo: 6, seller: juan.id,
    },
    {
      name: "Escorpion", phone: "+56965414348", stage: "Sin Respuesta",
      sources: "meta_ads,whatsapp", temperature: "warm", score: 55,
      scoreReason: "Mostró interés inicial pero dejó de responder hace 2 días. Reintento programado.",
      seller: martin.id, messages: 12, hoursAgo: 52,
    },
  ];

  for (const def of leadDefs) {
    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        stageId: stages[def.stage],
        sellerId: def.seller,
        vehicleId: def.vehicle ? vehicles[def.vehicle] : undefined,
        name: def.name,
        phone: def.phone,
        sources: def.sources,
        temperature: def.temperature,
        score: def.score,
        scoreReason: def.scoreReason,
        messageCount: def.messages,
        lastActivityAt: daysAgo(0, def.hoursAgo),
        createdAt: daysAgo(0, def.hoursAgo + 2),
        lost: def.lost ?? false,
      },
    });
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id, fromStage: null, toStage: "Nuevo",
        reason: "Lead creado desde " + def.sources.split(",")[0],
        actor: "system", createdAt: daysAgo(0, def.hoursAgo + 2),
      },
    });
    if (def.stage !== "Nuevo") {
      await prisma.leadEvent.create({
        data: {
          leadId: lead.id, fromStage: "Nuevo", toStage: "Calificando",
          reason: "Agente IA inició la calificación",
          actor: "agent", createdAt: daysAgo(0, def.hoursAgo + 1.5),
        },
      });
    }
    if (def.score !== undefined && def.stage !== "Calificando") {
      await prisma.leadEvent.create({
        data: {
          leadId: lead.id, fromStage: "Calificando", toStage: def.stage,
          reason: `Calificación: ${def.temperature === "hot" ? "HOT" : def.temperature === "warm" ? "WARM" : "COLD"} (score: ${def.score}). ${def.scoreReason ?? ""}`,
          actor: "agent", createdAt: daysAgo(0, def.hoursAgo),
        },
      });
    }
    if (def.note) {
      await prisma.leadNote.create({
        data: { leadId: lead.id, body: def.note, author: "agent" },
      });
    }
  }

  // Ventas del mes + cierre del mes anterior
  const soldDefs = [
    { code: "COD920834", title: "Zodiac Medline 6.8 Semirrígido", brand: "Zodiac", model: "Medline", year: 2022, price: 27000000, cost: 24500000, seller: juan.id, days: 63, soldDaysAgo: 6 },
    { code: "COD921688", title: "Renault e-Kwid 2026", brand: "Renault", model: "e-Kwid", year: 2026, price: 11750000, cost: 10400000, seller: juan.id, days: 9, soldDaysAgo: 8 },
    { code: "COD920830", title: "Chevrolet Silverado High Country 2022", brand: "Chevrolet", model: "Silverado", year: 2022, price: 48950000, cost: 44100000, seller: juan.id, days: 56, soldDaysAgo: 12 },
    { code: "COD921421", title: "Chevrolet Silverado LTZ 2021", brand: "Chevrolet", model: "Silverado", year: 2021, price: 28950000, cost: 25900000, seller: martin.id, days: 16, soldDaysAgo: 18 },
  ];
  for (const def of soldDefs) {
    const v = await prisma.vehicle.create({
      data: {
        tenantId: tenant.id, branchId: trapenses.id, sellerId: def.seller,
        code: def.code, brand: def.brand, model: def.model, title: def.title,
        year: def.year, km: 30000, price: def.price, acquisitionCost: def.cost,
        status: "sold", createdAt: daysAgo(def.days + def.soldDaysAgo),
        soldAt: daysAgo(def.soldDaysAgo),
      },
    });
    await prisma.sale.create({
      data: {
        tenantId: tenant.id, vehicleId: v.id, sellerId: def.seller,
        price: def.price, saleType: "contado", daysInStock: def.days,
        soldAt: daysAgo(def.soldDaysAgo),
      },
    });
  }

  await prisma.monthlyClose.create({
    data: {
      tenantId: tenant.id,
      periodStart: new Date("2026-05-01"),
      periodEnd: new Date("2026-05-31"),
      closedAt: new Date("2026-06-08T12:09:00"),
      salesCount: 5,
      revenue: 94700000,
      profit: 8200000,
    },
  });

  // Campañas Meta
  await prisma.campaign.createMany({
    data: [
      {
        tenantId: tenant.id, name: "Consignación · 9/7", kind: "catalog",
        status: "active", dailyBudget: 10000, regions: "Lo Barnechea,Las Condes,Vitacura,Colina",
        contacts: 18, spend: 100699, impressions: 15133, reach: 6567,
      },
      {
        tenantId: tenant.id, name: "CTWA · Ford F-150 Lariat Black 2025", kind: "ctwa",
        status: "active", dailyBudget: 2000, regions: "Metropolitana,O'Higgins",
        vehicleIds: vehicles["COD921766"],
        contacts: 29, spend: 20165, impressions: 15755, reach: 8658,
      },
      {
        tenantId: tenant.id, name: "CTWA · KIA Sonet + Sportage", kind: "ctwa",
        status: "active", dailyBudget: 6000, regions: "Metropolitana",
        vehicleIds: [vehicles["COD921671"], vehicles["COD921802"]].join(","),
        contacts: 105, spend: 90885, impressions: 20171, reach: 11758,
      },
      {
        tenantId: tenant.id, name: "CTWA · Chevrolet Silverado Diesel 2023", kind: "ctwa",
        status: "active", dailyBudget: 4000, regions: "Metropolitana,O'Higgins",
        vehicleIds: vehicles["COD921740"],
        contacts: 19, spend: 45236, impressions: 9800, reach: 5200,
      },
    ],
  });

  // Configuración del agente IA
  await prisma.agentConfig.create({
    data: {
      tenantId: tenant.id,
      agentName: "Antonia",
      respondCtwa: true,
      respondNewContacts: true,
      respondExistingContacts: false,
      serviceConsignment: true,
      serviceDirectBuy: true,
      knowledge:
        "Siempre agendar visita cuando quieran venir a ver autos. Todos los autos tienen 3 meses de garantía mecánica. Cuando pidan fotos, enviar 4 del exterior y 4 del interior. Horario de atención: lunes a sábado 10:00–19:00.",
      restrictions:
        "No dar descuentos ni costos de autos. No entregar precios de vehículos en parte de pago. Hablar de automotora, no de concesionario. No usar modismos. Nunca recomendar otra automotora.",
    },
  });

  // Clientes post-venta y recordatorios
  await prisma.customer.createMany({
    data: [
      { tenantId: tenant.id, name: "Andrea Soto", phone: "+56911223344", birthday: new Date("1988-08-02") },
      { tenantId: tenant.id, name: "Pablo Reyes", phone: "+56922334455", birthday: new Date("1979-11-15") },
    ],
  });
  await prisma.reminder.createMany({
    data: [
      { tenantId: tenant.id, title: "Llamar a Christian por pie mínimo", dueAt: daysAgo(-1) },
      { tenantId: tenant.id, title: "Confirmar visita de Rodrigo (jueves 10:30)", dueAt: daysAgo(-2) },
    ],
  });

  console.log("Seed completo: tenant Marketcar con", vehicleDefs.length, "vehículos en stock,", soldDefs.length, "vendidos,", leadDefs.length, "leads.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
