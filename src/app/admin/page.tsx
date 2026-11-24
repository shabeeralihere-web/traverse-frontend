
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/redux/hooks";

const adminLinks = [
  {
    title: "Manage Tours",
    description: "View and manage all tours on Traverse.",
    href: "/admin/tours",
    action: "View tours",
  },
  {
    title: "Add Tour",
    description: "Create a new tour and publish it on Traverse.",
    href: "/admin/tours/new",
    action: "Create tour",
  },
  {
    title: "Operator Applications",
    description: "Review, approve or reject operator applications.",
    href: "/admin/operator-applications",
    action: "Review applications",
  },
  {
    title: "Manage Bookings",
    description: "View and manage customer bookings.",
    href: "/admin/bookings",
    action: "View bookings",
  },
];

export default function AdminPage() {
  const router = useRouter();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/login");
    }
  }, [initialized, isAuthenticated, user, router]);

  if (!initialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-green-700">
            ADMINISTRATION
          </p>

          <h1 className="text-3xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Manage tours, operators and bookings across Traverse.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Signed in as</p>
          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            {user.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {adminLinks.map((item) => (
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
