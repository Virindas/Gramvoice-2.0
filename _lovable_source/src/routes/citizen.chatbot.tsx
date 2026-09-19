import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Shell } from "@/components/layout";
import { Button, ChatBubble } from "@/components/ui";
import { delay } from "@/lib/store";

export const Route = createFileRoute("/citizen/chatbot")({
  head: () => ({
    meta: [
      { title: "Ask GramVoice — Chat Assistant" },
      {
        name: "description",
        content: "Ask questions about complaints, services and village rules in plain language.",
      },
      { property: "og:title", content: "Ask GramVoice — Chat Assistant" },
      {
        property: "og:description",
        content: "Ask questions about complaints, services and village rules in plain language.",
      },
    ],
  }),
  component: ChatBot,
});

const suggestions = [
  "How do I raise a complaint?",
  "How long does it take?",
  "What is 'Under Review'?",
  "How do I get a birth certificate?",
];

function reply(q: string) {
  const t = q.toLowerCase();
  if (t.includes("complaint") && (t.includes("raise") || t.includes("how")))
    return "Open ‘Register Complaint’ from your home screen. You can press the microphone and simply speak — we turn it into text for you, and you can edit it before sending.";
  if (t.includes("long") || t.includes("time"))
    return "Most complaints are looked at within 2 working days. You will see the status change from Under Review to In Progress, and finally to Completed or Rejected.";
  if (t.includes("under review"))
    return "‘Under Review’ means your complaint has reached the Panchayat office and an officer is reading it. It is the first stage of every complaint.";
  if (t.includes("certificate") || t.includes("service"))
    return "Go to ‘Request Service’, pick the certificate you need, and describe why you need it. You can track the request on the same screen.";
  if (t.includes("rule"))
    return "The ‘Rule Book’ screen lists all village rules — water timings, waste collection days, Gram Sabha meetings and grazing rules.";
  return "I can help with complaints, their status, village rules, contacts and service requests. Try asking, for example, ‘How do I raise a complaint?’";
}

function ChatBot() {
  const [messages, setMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    {
      from: "bot",
      text: "Vanakkam! I'm the GramVoice assistant. Ask me anything about complaints, rules or services.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    await delay(900);
    setMessages((m) => [...m, { from: "bot", text: reply(q) }]);
    setTyping(false);
  }

  return (
    <Shell portal="citizen" title="Chat assistant" subtitle="Ask in your own words — no forms.">
      <div className="flex min-h-[60vh] flex-col rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <ChatBubble key={i} from={m.from} text={m.text} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span className="text-base font-medium">Assistant is typing…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border px-5 pt-4">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="min-h-10 rounded-full bg-primary-soft px-4 text-sm font-semibold text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            aria-label="Your question"
            className="min-h-12 flex-1 rounded-xl border-2 border-input bg-card px-4 text-base focus:border-primary focus:outline-none"
          />
          <Button type="submit" disabled={!input.trim() || typing} icon={<Send className="size-5" />}>
            Send
          </Button>
        </form>
      </div>
    </Shell>
  );
}
