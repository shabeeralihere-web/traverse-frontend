
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getMyTours,
  updateTourStatus,
  deleteTour,
} from "@/redux/slices/tourSlice";

import type { Tour, TourStatus } from "@/types/tour.type";

type StatusFilter = "all" | TourStatus;

const formatDuration = (hours: number) => {
  if (hours >= 24) {
    const days = hours / 24;
    return `${Number.isInteger(days) ? days : days.toFixed(1)} days`;
  }

  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
};

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const statusStyles: Record<TourStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  published: "bg-green-50 text-green-700",
  archived: "bg-gray-100 text-gray-600",
};

export default function ManagedToursPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const {
    myTours,
    isLoadingMyTours,
    isUpdatingStatus,
    isDeletingTour,
    error,
  } = useAppSelector((state) => state.tours);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "operator";

  const basePath = isAdmin ? "/admin" : "/operator";

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated || (!isAdmin && !isOperator)) {
      router.replace("/login");
      return;
    }

    dispatch(getMyTours());
  }, [
    initialized,
    isAuthenticated,
    isAdmin,
    isOperator,
    dispatch,
    router,
  ]);

  const filteredTours = useMemo(() => {
    if (statusFilter === "all") return myTours;

    return myTours.filter((tour) => tour.status === statusFilter);
  }, [myTours, statusFilter]);

  const counts = useMemo(
    () => ({
      all: myTours.length,
      draft: myTours.filter((tour) => tour.status === "draft").length,
      published: myTours.filter((tour) => tour.status === "published").length,
      archived: myTours.filter((tour) => tour.status === "archived").length,
    }),
    [myTours]
  );

  const handleStatusChange = async (
    tour: Tour,
    status: TourStatus
  ) => {
    setActionError(null);

    try {
      await dispatch(
        updateTourStatus({
          tourId: tour._id,
          status,
        })
      ).unwrap();
    } catch (error) {
      setActionError(
        typeof error === "string" ? error : "Unable to update tour status."
      );
    }
  };

  const handleDelete = async (tour: Tour) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${tour.title}"?`
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      await dispatch(deleteTour(tour._id)).unwrap();
    } catch (error) {
      setActionError(
        typeof error === "string" ? error : "Unable to delete tour."
      );
    }
  };

  if (!initialized || !isAuthenticated || (!isAdmin && !isOperator)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-green-700">
              {isAdmin ? "Administration" : "Operator Dashboard"}
            </p>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Manage Tours
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View, organize and manage your tour listings.
            </p>
          </div>

          <Link
            href={`${basePath}/tours/new`}
            className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            + Add New Tour
          </Link>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "All Tours", value: counts.all },
            { label: "Drafts", value: counts.draft },
            { label: "Published", value: counts.published },
            { label: "Archived", value: counts.archived },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Status filters */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(
            ["all", "draft", "published", "archived"] as StatusFilter[]
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                statusFilter === status
                  ? "bg-green-700 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status === "all" ? "All Tours" : status}
            </button>
          ))}
        </div>

        {/* Errors */}
        {(actionError || error) && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError || error}
          </div>
        )}

        {/* Loading */}
        {isLoadingMyTours ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            Loading tours...
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {statusFilter === "all"
                ? "No tours created yet"
                : `No ${statusFilter} tours`}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {statusFilter === "all"
                ? "Create your first tour to get started."
                : "There are no tours with this status."}
            </p>

            {statusFilter === "all" && (
              <Link
                href={`${basePath}/tours/new`}
                className="mt-5 inline-flex rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800"
              >
                Create Your First Tour
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="divide-y divide-gray-100">
              {filteredTours.map((tour) => (
                <div
                  key={tour._id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  {/* Tour image */}
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-36">
                    {tour.photos?.[0]?.url ? (
                      <img
                        src={tour.photos[0].url}
                        alt={tour.photos[0].alt || tour.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Tour information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-900">
                        {tour.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[tour.status]}`}
                      >
                        {tour.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {tour.destination.city}, {tour.destination.state}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                      <span>{formatDuration(tour.durationHours)}</span>
                      <span>
                        {formatPrice(
                          tour.price.amount,
                          tour.price.currency
                        )}
                      </span>
                      <span className="capitalize">
                        {tour.activityType}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2">

                    {/* Edit button */}
                    <Link
                      href={`${basePath}/tours/${tour._id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.77a4.5 4.5 0 0 1-1.897 1.13l-3.5 1.1 1.1-3.5a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 7.125 16.875 4.5"
                        />
                      </svg>
                      Edit
                    </Link>

                    {tour.status === "draft" && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus || isDeletingTour}
                        onClick={() =>
                          handleStatusChange(tour, "published")
                        }
                        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                      >
                        Publish
                      </button>
                    )}

                    {tour.status === "archived" && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus || isDeletingTour}
                        onClick={() =>
                          handleStatusChange(tour, "published")
                        }
                        className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                      >
                        Republish
                      </button>
                    )}

                    {tour.status === "published" && (
                      <button
                        type="button"
                        disabled={isUpdatingStatus || isDeletingTour}
                        onClick={() =>
                          handleStatusChange(tour, "archived")
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Archive
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isDeletingTour || isUpdatingStatus}
                      onClick={() => handleDelete(tour)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
