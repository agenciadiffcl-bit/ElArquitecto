"use client";

import { useMemo, useState } from "react";
import { createVehicle } from "./actions";

// Checklist "Tu publicación" (paridad Venpu): cada ítem explica por qué
// importa en los portales; el % se actualiza en vivo mientras se completa.
type Draft = {
  brand: string;
  model: string;
  title: string;
  plate: string;
  price: string;
  year: string;
  km: string;
  transmission: string;
  exteriorColor: string;
  bodyType: string;
  doors: string;
  equipment: string;
  description: string;
};

const emptyDraft: Draft = {
  brand: "",
  model: "",
  title: "",
  plate: "",
  price: "",
  year: "",
  km: "",
  transmission: "",
  exteriorColor: "",
  bodyType: "",
  doors: "",
  equipment: "",
  description: "",
};

function checklist(d: Draft) {
  return [
    {
      label: "Agrega fotos para atraer compradores",
      hint: "Los portales priorizan publicaciones con 10+ fotos de calidad",
      done: false, // subida de fotos: siguiente iteración
    },
    {
      label: "Escribe una descripción detallada (100+ caracteres)",
      hint: "Descripciones completas generan más consultas en todos los portales",
      done: d.description.length >= 100,
    },
    {
      label: "Define el precio",
      hint: "Los compradores filtran por precio en los portales",
      done: d.price.trim() !== "",
    },
    {
      label: "Completa marca y modelo",
      hint: "Obligatorio en todos los portales para búsquedas por marca",
      done: d.brand !== "" && d.model !== "",
    },
    {
      label: "Ingresa la patente",
      hint: "Obligatoria en MercadoLibre para publicar",
      done: /^[A-Za-z]{2}\d{4}$|^[A-Za-z]{4}\d{2}$/.test(d.plate.trim()),
    },
    {
      label: "Indica la transmisión",
      hint: "Filtro de búsqueda principal en los portales",
      done: d.transmission !== "",
    },
    {
      label: "Agrega el color",
      hint: "Los compradores filtran por color en los portales",
      done: d.exteriorColor !== "",
    },
    {
      label: "Define el tipo de carrocería",
      hint: "Categoría de búsqueda principal (SUV, Sedán, Hatchback)",
      done: d.bodyType !== "",
    },
    {
      label: "Indica el número de puertas",
      hint: "Filtro de búsqueda frecuente",
      done: d.doors !== "",
    },
    {
      label: "Lista el equipamiento",
      hint: "Destaca tu vehículo frente a la competencia",
      done: d.equipment.trim() !== "",
    },
    {
      label: "Ingresa el kilometraje",
      hint: "Dato esencial para el comprador de usados",
      done: d.km.trim() !== "",
    },
    {
      label: "Completa el año",
      hint: "Obligatorio en todos los portales",
      done: d.year.trim() !== "",
    },
  ];
}

const inputCls =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-[14px] text-cream placeholder:text-muted focus:border-accent focus:outline-none";
const labelCls = "mb-1.5 block text-[12.5px] font-semibold text-silver";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export function VehicleForm() {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const items = useMemo(() => checklist(draft), [draft]);
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  const set =
    (key: keyof Draft) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) =>
      setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <form action={createVehicle} className="flex items-start gap-8">
      <div className="min-w-0 flex-1 space-y-6">
        {/* Patente primero: aquí se conectará el autocompletado + tasación */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-[16px] font-bold">Comienza por la patente</h2>
          <p className="mt-1 text-[12.5px] text-silver">
            Próximamente: consulta automática de marca, modelo, año, VIN y
            tasación de mercado.
          </p>
          <div className="mt-4 max-w-56">
            <input
              name="plate"
              placeholder="ABCD12"
              value={draft.plate}
              onChange={set("plate")}
              className={inputCls + " uppercase tracking-widest"}
              maxLength={6}
            />
            <p className="mt-1.5 text-[11.5px] text-muted">
              Formato: AA1234 o AAAA12
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-5 text-[16px] font-bold">Información básica</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Marca *">
              <input name="brand" value={draft.brand} onChange={set("brand")} className={inputCls} placeholder="Toyota" required />
            </Field>
            <Field label="Modelo *">
              <input name="model" value={draft.model} onChange={set("model")} className={inputCls} placeholder="RAV4" required />
            </Field>
            <div className="col-span-2">
              <Field label="Título *">
                <input name="title" value={draft.title} onChange={set("title")} className={inputCls} placeholder="Toyota RAV4 2.0 XLE 2023" required />
              </Field>
            </div>
            <Field label="Precio *">
              <input name="price" value={draft.price} onChange={set("price")} className={inputCls} placeholder="$ 15.000.000" inputMode="numeric" required />
            </Field>
            <Field label="Año *">
              <input name="year" value={draft.year} onChange={set("year")} className={inputCls} placeholder="2023" inputMode="numeric" required />
            </Field>
            <Field label="Kilometraje">
              <input name="km" value={draft.km} onChange={set("km")} className={inputCls} placeholder="50.000" inputMode="numeric" />
            </Field>
            <Field label="Combustible">
              <select name="fuel" className={inputCls} defaultValue="">
                <option value="">Selecciona</option>
                <option value="bencina">Bencina</option>
                <option value="diesel">Diésel</option>
                <option value="hibrido">Híbrido</option>
                <option value="electrico">Eléctrico</option>
              </select>
            </Field>
            <Field label="Pie de financiamiento (opcional)">
              <input name="financingDown" className={inputCls} placeholder="$ 2.000.000" inputMode="numeric" />
            </Field>
            <Field label="Costo de adquisición (interno)">
              <input name="acquisitionCost" className={inputCls} placeholder="$ 13.000.000 — no se publica" inputMode="numeric" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-5 text-[16px] font-bold">Detalle</h2>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            <Field label="Transmisión">
              <select name="transmission" value={draft.transmission} onChange={set("transmission")} className={inputCls}>
                <option value="">Selecciona</option>
                <option value="automatica">Automática</option>
                <option value="manual">Manual</option>
              </select>
            </Field>
            <Field label="Color exterior">
              <input name="exteriorColor" value={draft.exteriorColor} onChange={set("exteriorColor")} className={inputCls} placeholder="Negro" />
            </Field>
            <Field label="Color interior">
              <input name="interiorColor" className={inputCls} placeholder="Cuero beige" />
            </Field>
            <Field label="Carrocería">
              <select name="bodyType" value={draft.bodyType} onChange={set("bodyType")} className={inputCls}>
                <option value="">Selecciona</option>
                <option value="suv">SUV</option>
                <option value="sedan">Sedán</option>
                <option value="hatchback">Hatchback</option>
                <option value="camioneta">Camioneta</option>
                <option value="coupe">Coupé</option>
                <option value="furgon">Furgón</option>
              </select>
            </Field>
            <Field label="Puertas">
              <select name="doors" value={draft.doors} onChange={set("doors")} className={inputCls}>
                <option value="">Selecciona</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </Field>
            <Field label="Versión">
              <input name="version" className={inputCls} placeholder="1.8 XLi" />
            </Field>
            <div className="col-span-2 xl:col-span-3">
              <Field label="Equipamiento">
                <input name="equipment" value={draft.equipment} onChange={set("equipment")} className={inputCls} placeholder="Aire acondicionado, cierre centralizado, alzavidrios eléctricos" />
              </Field>
            </div>
            <div className="col-span-2 xl:col-span-3">
              <Field label="Tags (separados por coma)">
                <input name="tags" className={inputCls} placeholder="familiar, económico" />
              </Field>
            </div>
          </div>
          <label className="mt-5 flex w-fit cursor-pointer items-center gap-2.5 text-[13.5px] text-silver">
            <input type="checkbox" name="singleOwner" className="h-4 w-4 accent-[#c8a96e]" />
            Único dueño
          </label>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Descripción</h2>
            <button
              type="button"
              className="rounded-full border border-accent/40 bg-accent-soft px-4 py-1.5 text-[12.5px] font-semibold text-accent"
              title="Se conectará al agente IA"
            >
              ✦ Mejorar con IA
            </button>
          </div>
          <textarea
            name="description"
            value={draft.description}
            onChange={set("description")}
            rows={6}
            className={inputCls + " resize-y"}
            placeholder="Describe el vehículo: estado, equipamiento, historial de mantenciones, razón de venta…"
            maxLength={5000}
          />
          <p className={`mt-1.5 text-[11.5px] ${draft.description.length < 50 ? "text-hot" : "text-muted"}`}>
            {draft.description.length}/5000 caracteres (mínimo 50)
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="mb-2 text-[16px] font-bold">Canales de publicación</h2>
          <p className="mb-4 text-[12.5px] text-silver">
            Selecciona dónde se publicará al activar el vehículo. Se publica con
            las cuentas propias de tu automotora.
          </p>
          <div className="space-y-3">
            {[
              ["mercadolibre", "MercadoLibre", "Cuenta propia de la automotora"],
              ["chileautos", "Chileautos", "API oficial de inventario y leads"],
              ["sitio", "Sitio web propio", "Tu catálogo en tu dominio"],
            ].map(([value, label, hint]) => (
              <label key={value} className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-surface-2 px-4 py-3">
                <span>
                  <span className="block text-[14px] font-semibold">{label}</span>
                  <span className="block text-[12px] text-muted">{hint}</span>
                </span>
                <input type="checkbox" name="channels" value={value} defaultChecked={value === "sitio"} className="h-4.5 w-4.5 accent-[#c8a96e]" />
              </label>
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13px] text-silver">
            <input type="checkbox" name="virtualConsignment" className="mt-0.5 h-4 w-4 accent-[#c8a96e]" />
            <span>
              <strong className="text-cream">Consignación virtual</strong> — el
              auto no está físicamente en la automotora. El asistente IA no
              invitará al cliente a la sucursal y coordinará con un asesor cómo
              verlo.
            </span>
          </label>
        </section>

        <div className="flex items-center justify-end gap-3 pb-10">
          <button
            type="submit"
            name="intent"
            value="draft"
            className="rounded-full border border-line px-6 py-2.5 text-[13.5px] font-semibold text-silver transition-colors hover:text-cream"
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            className="rounded-full bg-accent px-6 py-2.5 text-[13.5px] font-semibold text-black transition-opacity hover:opacity-85"
          >
            ✈ Guardar y publicar
          </button>
        </div>
      </div>

      {/* Panel lateral: % de completitud en vivo */}
      <aside className="sticky top-8 w-80 shrink-0 rounded-2xl border-l-2 border-accent bg-surface p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[15px] font-bold">Tu publicación</h3>
          <span className={`text-2xl font-bold ${pct >= 80 ? "text-ok" : pct >= 40 ? "text-warm" : "text-hot"}`}>
            {pct}%
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] text-muted">
          {done} de {items.length} campos completados
        </p>
        <ul className="mt-5 space-y-3.5">
          {items.map((item) => (
            <li key={item.label} className="flex gap-2.5">
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                  item.done
                    ? "border-ok bg-ok/20 text-ok"
                    : "border-line-strong text-transparent"
                }`}
              >
                ✓
              </span>
              <span>
                <span className={`block text-[13px] font-medium ${item.done ? "text-muted line-through" : "text-cream"}`}>
                  {item.label}
                </span>
                {!item.done && (
                  <span className="block text-[11.5px] leading-snug text-muted">
                    {item.hint}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </form>
  );
}
