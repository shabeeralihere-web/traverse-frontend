
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, X } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getMyBookings,
  cancelBooking,
  clearMyBookings,
  clearBookingActionMessages,
} from "@/redux/slices/bookingSlice";

import type {
  Booking,
  BookingTour,
  BookingAvailability,
} from "@/redux/slices/bookingSlice";

function getTour(tour: Booking["tour"]): BookingTour | null {
  if (typeof tour === "string") return null;
  return tour;
}

function getAvailability(
  availability: Booking["availability"]
): BookingAvailability | null {
  if (typeof availability === "string") return null;
  return availability;
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date?: string) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusStyle(status: Booking["status"]) {
  switch (status) {
    case "confirmed":
      return "bg-green-50 text-green-700";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "declined":
      return "bg-red-50 text-red-700";
    case "cancelled":
      return "bg-gray-100 text-gray-600";
    case "completed":
      return "bg-[#edf5ef] text-[#245b3b]";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function MyBookingsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const {
    bookings,
    bookingsLoading,
    bookingsError,
    actionLoading,
    actionError,
    successMessage,
  } = useAppSelector((state) => state.booking);

  const canAccess =
    initialized && isAuthenticated && user?.role === "traveler";

  const bookingToCancel = bookings.find(
    (booking) => booking._id === cancelBookingId
  );

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "traveler") {
      router.replace("/tours");
      return;
    }

    dispatch(getMyBookings());

    return () => {
      dispatch(clearMyBookings());
      dispatch(clearBookingActionMessages());
    };
  }, [
    dispatch,
    initialized,
    isAuthenticated,
    user?.role,
    router,
  ]);

  async function handleCancelBooking(bookingId: string) {
    setProcessingId(bookingId);
    dispatch(clearBookingActionMessages());

    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
      setCancelBookingId(null);
    } catch {
      setCancelBookingId(null);
    } finally {
      setProcessingId(null);
    }
  }

  if (!initialized) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Checking your account...
        </p>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Redirecting...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafcf9]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-9">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-600 transition-colors hover:text-[#245b3b]"
          >
            <ArrowLeft size={21} strokeWidth={2.8} />
            Explore tours
          </Link>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[#203b2a] sm:text-4xl">
            My bookings
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Manage your reservations and keep track of your experiences.
          </p>
        </div>

        {successMessage && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {successMessage}
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </div>
        )}

        {!bookingsLoading && !bookingsError && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600">
              {bookings.length}{" "}
              {bookings.length === 1 ? "booking" : "bookings"}
            </p>
          </div>
        )}

        {bookingsLoading && (
          <div className="space-y-5">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="h-48 rounded-xl bg-gray-100 sm:h-36 sm:w-48" />

                  <div className="flex-1 space-y-4">
                    <div className="h-5 w-2/3 rounded bg-gray-100" />
                    <div className="h-4 w-1/2 rounded bg-gray-100" />
                    <div className="h-4 w-1/3 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!bookingsLoading && bookingsError && (
          <div className="rounded-2xl border border-red-100 bg-white p-7 text-center">
            <h2 className="text-lg font-semibold text-[#203b2a]">
              Unable to load bookings
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {bookingsError}
            </p>

            <button
              type="button"
              onClick={() => dispatch(getMyBookings())}
              className="mt-5 rounded-full bg-[#245b3b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#19452d]"
            >
              Try again
            </button>
          </div>
        )}

        {!bookingsLoading &&
          !bookingsError &&
          bookings.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5ef]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-8 w-8 text-[#245b3b]"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-[#203b2a]">
                No bookings yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Your booked experiences will appear here.
                Discover something exciting for your next trip.
              </p>

              <Link
                href="/tours"
                className="mt-7 inline-flex rounded-full bg-[#245b3b] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
              >
                Explore experiences
              </Link>
            </div>
          )}

        {!bookingsLoading &&
          !bookingsError &&
          bookings.length > 0 && (
            <div className="space-y-5">
              {bookings.map((booking) => {
                const tour = getTour(booking.tour);
                const availability = getAvailability(
                  booking.availability
                );

                const photo = tour?.photos?.[0]?.url;

                const destination = [
                  tour?.destination?.city,
                  tour?.destination?.state,
                  tour?.destination?.country,
                ]
                  .filter(Boolean)
                  .join(", ");

                const canCancel =
                  booking.status === "pending" ||
                  booking.status === "confirmed";

                const isCancelling =
                  processingId === booking._id && actionLoading;

                return (
                  <article
                    key={booking._id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition hover:shadow-[0_5px_20px_rgba(0,0,0,0.06)] sm:p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="relative h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-36 sm:w-48">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={tour?.title || "Booked tour"}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, 192px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-gray-400">
                            No image available
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold text-[#203b2a]">
                              {tour?.title || "Tour details unavailable"}
                            </h2>

                            {destination && (
                              <p className="mt-1 text-sm text-gray-500">
                                {destination}
                              </p>
                            )}
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Experience date
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#203b2a]">
                              {formatDate(availability?.startTime)}
                            </p>

                            {availability?.startTime && (
                              <p className="mt-1 text-xs text-gray-500">
                                {formatTime(availability.startTime)}
                                {availability.endTime &&
                                  ` – ${formatTime(availability.endTime)}`}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Guests
                            </p>

                            <p className="mt-1 text-sm font-medium text-[#203b2a]">
                              {booking.participants}{" "}
                              {booking.participants === 1
                                ? "guest"
                                : "guests"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-xs text-gray-400">
                              Total price
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#245b3b]">
                              {formatPrice(
                                booking.totalPrice,
                                booking.currency
                              )}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-400">
                              Booking created
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {formatDate(booking.createdAt)}
                            </p>
                          </div>
                        </div>

                        {booking.status === "cancelled" && (
                          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-800">
                              Cancellation details
                            </h3>

                            {booking.cancellation?.cancelledAt && (
                              <p className="mt-2 text-sm text-gray-600">
                                Cancelled on:{" "}
                                {formatDate(
                                  booking.cancellation.cancelledAt
                                )}
                              </p>
                            )}

                            {booking.cancellation?.reason && (
                              <p className="mt-1 text-sm text-gray-600">
                                Reason: {booking.cancellation.reason}
                              </p>
                            )}

                            {booking.cancellation?.refundPercentage != null && (
                              <p className="mt-1 text-sm text-gray-600">
                                Refund percentage:{" "}
                                {booking.cancellation.refundPercentage}%
                              </p>
                            )}

                            {booking.cancellation?.refundAmount != null && (
                              <p className="mt-1 text-sm font-semibold text-[#245b3b]">
                                Refund amount:{" "}
                                {formatPrice(
                                  booking.cancellation.refundAmount,
                                  booking.currency
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
                          {tour?._id && (
                            <Link
                              href={`/tours/${tour._id}`}
                              className="text-sm font-semibold text-[#245b3b] transition-colors hover:text-[#19452d]"
                            >
                              View experience
                            </Link>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(clearBookingActionMessages());
                                setCancelBookingId(booking._id);
                              }}
                              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Cancel booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </div>

      {cancelBookingId && bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="Close confirmation"
            disabled={actionLoading}
            onClick={() => setCancelBookingId(null)}
            className="absolute inset-0 h-full w-full cursor-default"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setCancelBookingId(null)}
              disabled={actionLoading}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={27}
                strokeWidth={1.8}
                className="text-red-600"
              />
            </div>

            <h2
              id="cancel-dialog-title"
              className="mt-5 text-xl font-semibold tracking-tight text-[#203b2a]"
            >
              Cancel your booking?
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Are you sure you want to cancel your booking for{" "}
              <span className="font-semibold text-gray-800">
                {getTour(bookingToCancel.tour)?.title ||
                  "this experience"}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelBookingId(null)}
                disabled={actionLoading}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep booking
              </button>

              <button
                type="button"
                onClick={() => handleCancelBooking(cancelBookingId)}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processingId === cancelBookingId
                  ? "Cancelling..."
                  : "Yes, cancel booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
