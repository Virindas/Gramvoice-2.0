import { Link } from "react-router-dom";
import { ShieldCheck, Users, Mic, ListChecks } from "lucide-react";
import { Brand } from "@/components/layout";
import { Button, LanguageSwitcher } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageContext";

const points = [
  { icon: Mic, titleKey: "landing.point1.title", textKey: "landing.point1.text" },
  { icon: ListChecks, titleKey: "landing.point2.title", textKey: "landing.point2.text" },
  { icon: ShieldCheck, titleKey: "landing.point3.title", textKey: "landing.point3.text" },
];

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-soft via-background to-secondary-soft/50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5">
        <Brand />
        <LanguageSwitcher />
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16">
        <section className="pt-8 pb-12 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary-soft px-4 py-1.5 text-sm font-bold text-secondary-foreground">
            <Users className="size-4" /> {t("landing.badge")}
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-balance sm:text-6xl">
            {t("landing.title_part1")} <span className="text-primary">{t("landing.title_part2")}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
            {t("landing.subtitle")}
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Link to="/citizen/login" className="block flex-1">
              <Button full className="whitespace-nowrap" icon={<Users className="size-5" />}>
                {t("landing.role.villager")}
              </Button>
            </Link>
            <Link to="/admin/login" className="block flex-1">
              <Button full variant="outline" className="whitespace-nowrap" icon={<ShieldCheck className="size-5" />}>
                {t("landing.role.admin")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.titleKey} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <p.icon className="size-6" />
              </div>
              <h2 className="text-lg font-bold">{t(p.titleKey)}</h2>
              <p className="mt-1 text-base text-muted-foreground">{t(p.textKey)}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

