
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/redux/hooks";

const operatorLinks = [
  {
    title: "My Tours",
    description: "View and manage the tours you have created.",
    href: "/operator/tours",
    action: "View my tours",
  },
  {
    title: "Add Tour",
    description: "Create a new tour and publish it on Traverse.",
    href: "/operator/tours/new",
    action: "Create tour",
  },
  {
    title: "Availability",
    description: "Manage schedules, dates and available capacity.",
    href: "/operator/availability",
    action: "Manage availability",
  },
  {
    title: "Bookings",
    description: "View bookings made for your tours.",
    href: "/operator/bookings",
    action: "View bookings",
  },
];

export default function OperatorDashboardPage() {
  const router = useRouter();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user.role !== "operator") {
      router.replace("/tours");
    }
  }, [initialized, isAuthenticated, user, router]);

  if (
    !initialized ||
    !isAuthenticated ||
    !user ||
    user.role !== "operator"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Dashboard Header */}

        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-green-700">
            OPERATOR PANEL
          </p>

          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome, {user.name}
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your tours, availability and bookings.
          </p>
        </div>

        {/* Operator Account Information */}

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Operator account
          </p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            {user.name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {user.email}
          </p>

          <p className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            Operator Account
          </p>
        </div>

        {/* Operator Dashboard Navigation */}

        <div className="grid gap-5 sm:grid-cols-2">
          {operatorLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:border-green-600 hover:shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {item.description}
              </p>

              <p className="mt-5 text-sm font-medium text-green-700 group-hover:text-green-800">
                {item.action} →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
