import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useSimulation } from "@/store/simulation";
import { cn, formatKwh } from "@/lib/utils";
import type { ChatMessage } from "@/types";

export function AdvisorFab() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const snapshot = useSimulation((s) => s.snapshot);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: t("advisor.greeting") }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    const snap = snapshot();
    try {
      const res = await api.chat({
        messages: next.filter((m) => m.role !== "system"),
        usageContext: {
          balanceKwh: snap.balanceKwh,
          currentPowerKw: snap.currentPowerKw,
          estDaysLeft: snap.estDaysLeft,
        },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `Habari! Una ${formatKwh(snap.balanceKwh)} iliyobaki. Punguza matumizi ya vifaa vikubwa kama hita ya maji ili kuokoa nishati.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-card"
        aria-label={t("advisor.title")}
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[calc(100%-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-in">
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">{t("advisor.title")}</span>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                  ...
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("advisor.placeholder")}
              className="h-10"
            />
            <Button size="icon" className="h-10 w-10 shrink-0" onClick={send} disabled={busy}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
