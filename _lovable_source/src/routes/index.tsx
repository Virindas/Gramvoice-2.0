import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Users, Mic, ListChecks } from "lucide-react";
import { Brand } from "@/components/layout";
import { Button, LanguageSwitcher } from "@/components/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GramVoice — Your Village, Your Voice" },
      {
        name: "description",
        content:
          "Raise village complaints by voice or text, track their progress, read Panchayat rules and reach officials — all in one simple place.",
      },
      { property: "og:title", content: "GramVoice — Your Village, Your Voice" },
      {
        property: "og:description",
        content: "A simple, trustworthy way for villagers to be heard by their Panchayat.",
      },
    ],
  }),
  component: Landing,
});

const points = [
  { icon: Mic, title: "Speak, don't type", text: "Record your complaint in your own words." },
  { icon: ListChecks, title: "Track every step", text: "See exactly where your complaint stands." },
  { icon: ShieldCheck, title: "Reaches the right desk", text: "Straight to your Panchayat office." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft via-background to-secondary-soft/50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Brand />
        <LanguageSwitcher />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16">
        <section className="pt-8 pb-12 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-4 py-1.5 text-sm font-bold text-secondary-foreground">
            <Users className="size-4" /> Built for every villager
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-balance sm:text-6xl">
            Your village. <span className="text-primary">Your voice.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
            GramVoice carries your complaint straight to the Panchayat — and shows you what happens
            next. No queues, no paperwork, no waiting at the office.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link to="/citizen/login" className="block flex-1">
              <Button full className="whitespace-nowrap" icon={<Users className="size-5" />}>
                I&apos;m a Citizen
              </Button>
            </Link>
            <Link to="/admin/login" className="block flex-1">
              <Button full variant="outline" className="whitespace-nowrap" icon={<ShieldCheck className="size-5" />}>
                I&apos;m an Administrator
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <p.icon className="size-6" />
              </div>
              <h2 className="text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-base text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
