import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  Home,
  FilePlus2,
  ListChecks,
  BookOpen,
  Phone,
  HandHelping,
  MessageCircle,
  User,
  LayoutDashboard,
  ClipboardList,
  Scale,
  Megaphone,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { LanguageSwitcher, LoadingSpinner } from "@/components/ui";

export function Brand({ tone = "primary" }: { tone?: "primary" | "admin" }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl text-lg font-black",
          tone === "admin"
            ? "bg-admin text-admin-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        G
      </span>
      <span className="text-lg font-extrabold tracking-tight">
        Gram<span className={tone === "admin" ? "text-admin" : "text-primary"}>Voice</span>
      </span>
    </span>
  );
}

const citizenNav = [
  { to: "/citizen/home", label: "Home", icon: Home },
  { to: "/citizen/complaint/new", label: "Register Complaint", icon: FilePlus2 },
  { to: "/citizen/complaints", label: "Track Complaint", icon: ListChecks },
  { to: "/citizen/rulebook", label: "Rule Book", icon: BookOpen },
  { to: "/citizen/contacts", label: "Contacts", icon: Phone },
  { to: "/citizen/services", label: "Request Service", icon: HandHelping },
  { to: "/citizen/chatbot", label: "Chat Bot", icon: MessageCircle },
  { to: "/citizen/profile", label: "Profile", icon: User },
] as const;

const adminNav = [
  { to: "/admin/home", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/complaints", label: "Complaints Review", icon: ClipboardList },
  { to: "/admin/rules", label: "Manage Rules", icon: Scale },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/profile", label: "Profile", icon: ShieldCheck },
] as const;

function SideNav({ portal }: { portal: "citizen" | "admin" }) {
  const items = portal === "citizen" ? citizenNav : adminNav;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className={cn(
        "hidden w-64 shrink-0 flex-col gap-1 border-r p-4 lg:flex",
        portal === "admin" ? "border-admin/15 bg-admin-soft/50" : "border-border bg-card",
      )}
    >
      <div className="mb-4 px-2 pt-2">
        <Brand tone={portal === "admin" ? "admin" : "primary"} />
        <p
          className={cn(
            "mt-1 text-xs font-bold tracking-widest uppercase",
            portal === "admin" ? "text-admin" : "text-muted-foreground",
          )}
        >
          {portal === "admin" ? "Administration" : "Citizen portal"}
        </p>
      </div>
      {items.map((i) => {
        const active = pathname === i.to || pathname.startsWith(i.to + "/");
        return (
          <Link
            key={i.to}
            to={i.to}
            className={cn(
              "flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-semibold transition-colors",
              active
                ? portal === "admin"
                  ? "bg-admin text-admin-foreground"
                  : "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted",
            )}
          >
            <i.icon className="size-5 shrink-0" />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav({ portal }: { portal: "citizen" | "admin" }) {
  const items = (portal === "citizen" ? citizenNav : adminNav).slice(0, 5);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 flex border-t bg-card lg:hidden",
        portal === "admin" ? "border-admin/20" : "border-border",
      )}
    >
      {items.map((i) => {
        const active = pathname === i.to;
        return (
          <Link
            key={i.to}
            to={i.to}
            className={cn(
              "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-bold",
              active
                ? portal === "admin"
                  ? "text-admin"
                  : "text-primary"
                : "text-muted-foreground",
            )}
          >
            <i.icon className="size-6" />
            <span className="leading-tight">{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopBar({
  portal,
  title,
  subtitle,
  right,
}: {
  portal: "citizen" | "admin";
  title: string;
  subtitle?: string | undefined;
  right?: ReactNode | undefined;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur lg:px-8",
        portal === "admin"
          ? "border-admin/15 bg-admin-soft/80"
          : "border-border bg-background/90",
      )}
    >
      <span className="lg:hidden">
        <Brand tone={portal === "admin" ? "admin" : "primary"} />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-extrabold lg:text-2xl">{title}</h1>
        {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
      <span className="hidden sm:block">
        <LanguageSwitcher />
      </span>
    </header>
  );
}

/** Shell + mock route protection. Sessions are strictly separated. */
export function Shell({
  portal,
  title,
  subtitle,
  right,
  children,
}: {
  portal: "citizen" | "admin";
  title: string;
  subtitle?: string | undefined;
  right?: ReactNode | undefined;
  children: ReactNode;
}) {
  const { citizen, admin, hydrated } = useStore();
  const navigate = useNavigate();
  const authed = portal === "citizen" ? !!citizen : !!admin;

  useEffect(() => {
    if (hydrated && !authed) {
      navigate({ to: portal === "citizen" ? "/citizen/login" : "/admin/login", replace: true });
    }
  }, [hydrated, authed, navigate, portal]);

  if (!hydrated || !authed) return <LoadingSpinner label="Checking your session…" />;

  return (
    <div className="flex min-h-screen bg-background">
      <SideNav portal={portal} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar portal={portal} title={title} subtitle={subtitle} right={right} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav portal={portal} />
    </div>
  );
}

/** Centered card layout used by every auth screen. */
export function AuthLayout({
  portal,
  title,
  subtitle,
  children,
  footer,
}: {
  portal: "citizen" | "admin";
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode | undefined;
}) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center px-4 py-8",
        portal === "admin"
          ? "bg-gradient-to-b from-admin-soft to-background"
          : "bg-gradient-to-b from-primary-soft to-background",
      )}
    >
      <div className="mb-6 flex w-full max-w-lg items-center justify-between">
        <Link to="/">
          <Brand tone={portal === "admin" ? "admin" : "primary"} />
        </Link>
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 mb-6 text-base text-muted-foreground">{subtitle}</p>
        {children}
      </div>
      {footer && <div className="mt-5 w-full max-w-lg text-center text-base">{footer}</div>}
    </div>
  );
}

export const MenuIcon = Menu;
