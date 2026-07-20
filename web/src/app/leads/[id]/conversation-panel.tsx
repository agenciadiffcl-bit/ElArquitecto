"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui";

type Msg = {
  id: string;
  role: string;
  body: string;
  createdAt: string;
};

export function ConversationPanel({
  leadId,
  initialMessages,
  agentActive: initialAgentActive,
  agentName,
}: {
  leadId: string;
  initialMessages: Msg[];
  agentActive: boolean;
  agentName: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [agentActive, setAgentActive] = useState(initialAgentActive);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    setSending(true);
    setError(null);
    // optimista: mostrar el mensaje del cliente de inmediato
    setMessages((m) => [
      ...m,
      { id: `tmp-${Date.now()}`, role: "customer", body: text, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await fetch(`/api/leads/${leadId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setMessages(data.messages);
      if (data.agentError) setError(data.agentError);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  async function takeControl() {
    await fetch(`/api/leads/${leadId}/take-control`, { method: "POST" });
    setAgentActive(false);
    router.refresh();
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <p className="text-[14px] font-bold">
          Conversación ({messages.length})
        </p>
        {agentActive ? (
          <Badge tone="gold">✦ {agentName}</Badge>
        ) : (
          <Badge tone="neutral">Equipo</Badge>
        )}
      </header>

      <div className="flex h-96 flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-[13px] text-muted">
            Escribe como si fueras el cliente para probar al agente.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
              m.role === "customer"
                ? "self-end bg-cream text-black"
                : m.role === "agent"
                  ? "self-start bg-accent-soft text-cream"
                  : "self-start bg-surface-2 text-cream"
            }`}
          >
            {m.role === "agent" && (
              <p className="mb-0.5 text-[10.5px] font-bold text-accent">
                ✦ {agentName}
              </p>
            )}
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="border-t border-hot/30 bg-hot/10 px-5 py-2.5 text-[12px] text-hot">
          {error}
        </p>
      )}

      <div className="border-t border-line p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              agentActive
                ? "Escribe como el cliente…"
                : "El agente está pausado — escribe como el cliente igual"
            }
            rows={2}
            className="flex-1 resize-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-cream placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-85 disabled:opacity-40"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-line px-5 py-3.5">
        <p className="text-[12px] text-muted">
          {agentActive
            ? "El agente IA está atendiendo esta conversación"
            : "Conversación en manos del equipo"}
        </p>
        {agentActive && (
          <button
            onClick={takeControl}
            className="rounded-full border border-line px-4 py-1.5 text-[12px] font-semibold text-silver hover:text-cream"
          >
            Tomar control
          </button>
        )}
      </footer>
    </>
  );
}
