
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Map,
  Plus,
  CalendarDays,
  CalendarCheck,
  Users,
  Menu,
  X,
} from "lucide-react";

import { useAppSelector } from "@/redux/hooks";

type DashboardRole = "admin" | "operator";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: DashboardRole;
}

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "All Tours", href: "/admin/tours", icon: Map },
  { label: "Add Tour", href: "/admin/tours/new", icon: Plus },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  {
    label: "Operators",
    href: "/admin/operator-applications",
    icon: Users,
  },
];

const operatorLinks = [
  {
    label: "Overview",
    href: "/operator/dashboard",
    icon: LayoutDashboard,
  },
  { label: "My Tours", href: "/operator/tours", icon: Map },
  { label: "Add Tour", href: "/operator/tours/new", icon: Plus },
  {
    label: "Departures",
    href: "/operator/availability",
    icon: CalendarDays,
  },
  {
    label: "Bookings",
    href: "/operator/bookings",
    icon: CalendarCheck,
  },
];

export default function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = role === "admin" ? adminLinks : operatorLinks;

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAccess =
    mounted &&
    initialized &&
    isAuthenticated &&
    !!user &&
    user.role === role;

  // Authentication and role protection
  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else if (user.role === "operator") {
        router.replace("/operator/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [initialized, isAuthenticated, user, role, router]);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close mobile drawer with Escape and prevent background scrolling
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  const isActive = (href: string) => {
    const dashboardHome =
      role === "admin" ? "/admin" : "/operator/dashboard";

    if (href === dashboardHome) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navigation = (
    <nav className="space-y-1 px-3 py-6">
      {links.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              active
                ? "bg-green-50 text-green-800"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {active && (
              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-green-700" />
            )}

            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.8}
              className={
                active
                  ? "text-green-700"
                  : "text-gray-400 group-hover:text-gray-600"
              }
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col bg-[#f8faf9]">
      <div className="flex flex-1 items-stretch">
        {/* Desktop Sidebar */}
        {hasAccess && (
          <aside
            className="
              sticky top-[72px] hidden h-[calc(100vh-72px)]
              w-[230px] shrink-0 self-start
              overflow-hidden border-r border-gray-200 bg-white
              lg:block
            "
          >
            {navigation}
          </aside>
        )}

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Mobile Menu Header */}
          {hasAccess && (
            <header className="sticky top-[72px] z-30 flex items-center border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <Menu size={20} />
                Menu
              </button>
            </header>
          )}

          <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-10">
            {!mounted || !initialized ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-gray-500">
                  Loading dashboard...
                </p>
              </div>
            ) : hasAccess ? (
              children
            ) : (
              <div className="flex min-h-[50vh] items-center justify-center">
                <p className="text-sm text-gray-500">
                  Checking dashboard access...
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && hasAccess && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-[70] bg-black/40 lg:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        aria-label="Dashboard navigation"
        aria-hidden={!sidebarOpen}
        className={`
          fixed bottom-0 left-0 top-[72px] z-[80]
          w-[270px] max-w-[85vw]
          overflow-hidden border-r border-gray-200 bg-white
          transition-transform duration-200 ease-in-out
          lg:hidden
          ${sidebarOpen && hasAccess ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="text-sm font-semibold text-gray-800">
            Navigation
          </span>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={19} />
          </button>
        </div>

        {navigation}
      </aside>
    </div>
  );
}
