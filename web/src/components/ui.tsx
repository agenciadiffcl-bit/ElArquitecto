import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[14px] text-silver">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-surface p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  deltaTone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
}) {
  const tone =
    deltaTone === "up"
      ? "text-ok"
      : deltaTone === "down"
        ? "text-hot"
        : "text-muted";
  return (
    <Card>
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-[32px] font-bold leading-none tracking-tight">
        {value}
      </p>
      {delta && <p className={`mt-2 text-[12.5px] ${tone}`}>{delta}</p>}
    </Card>
  );
}

const badgeTones: Record<string, string> = {
  gold: "bg-accent-soft text-accent",
  hot: "bg-hot/15 text-hot",
  warm: "bg-warm/15 text-warm",
  cold: "bg-cold/15 text-cold",
  ok: "bg-ok/15 text-ok",
  neutral: "bg-surface-2 text-silver",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${badgeTones[tone]}`}
    >
      {children}
    </span>
  );
}

export const channelLabels: Record<string, string> = {
  mercadolibre: "ML",
  chileautos: "CA",
  sitio: "Web",
  yapo: "YP",
};

export const channelTones: Record<string, string> = {
  mercadolibre: "bg-warm/20 text-warm",
  chileautos: "bg-cold/20 text-cold",
  sitio: "bg-accent-soft text-accent",
  yapo: "bg-hot/20 text-hot",
};

export function ChannelBadge({ channel }: { channel: string }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10.5px] font-bold ${channelTones[channel] ?? "bg-surface-2 text-silver"}`}
      title={channel}
    >
      {channelLabels[channel] ?? channel}
    </span>
  );
}

export function QualityDot({ score }: { score: number }) {
  const tone =
    score >= 90 ? "text-ok" : score >= 70 ? "text-warm" : "text-hot";
  return (
    <span className={`text-[12.5px] font-semibold ${tone}`}>● {score}%</span>
  );
}

export const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  meta_ads: "Meta Ads",
  mercadolibre: "MercadoLibre",
  chileautos: "Chileautos",
  sitio: "Sitio web",
};

export function SourceBadges({ sources }: { sources: string }) {
  const list = sources.split(",").filter(Boolean);
  return (
    <span className="flex flex-wrap gap-1">
      {list.map((s) => (
        <span
          key={s}
          className="inline-flex rounded-full border border-line px-2 py-0.5 text-[10.5px] font-medium text-silver"
        >
          {sourceLabels[s] ?? s}
        </span>
      ))}
    </span>
  );
}

export function TemperatureBadge({
  temperature,
}: {
  temperature: string | null;
}) {
  if (temperature === "hot") return <Badge tone="hot">🔥 Caliente</Badge>;
  if (temperature === "warm") return <Badge tone="warm">Tibio</Badge>;
  if (temperature === "cold") return <Badge tone="cold">Frío</Badge>;
  return null;
}
