
"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getAdminBookings,
  getOperatorBookings,
  confirmBooking,
  declineBooking,
  clearManagedBookings,
  clearBookingActionMessages,
} from "@/redux/slices/bookingSlice";

type BookingManagementProps = {
  role: "admin" | "operator";
};

type BookingStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

type TourDestination = {
  country?: string;
  state?: string;
  city?: string;
  address?: string;
};

type BookingTraveler = {
  _id: string;
  name?: string;
  email?: string;
};

type BookingTour = {
  _id: string;
  title?: string;
  destination?: TourDestination | string;
};

type BookingAvailability = {
  _id: string;
  startTime?: string;
  endTime?: string;
};

type BookingRecord = {
  _id: string;
  traveler: string | BookingTraveler;
  tour: string | BookingTour;
  availability: string | BookingAvailability;
  participants: number;
  totalPrice: number;
  currency: string;
  specialRequirements?: string;
  status: BookingStatus;
  createdAt?: string;
  confirmedAt?: string;
};

const statusOptions = [
  "all",
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
];

function getTraveler(booking: BookingRecord) {
  if (typeof booking.traveler === "string") {
    return {
      name: "Traveler",
      email: "",
    };
  }

  return {
    name: booking.traveler?.name || "Traveler",
    email: booking.traveler?.email || "",
  };
}

// Format destination safely because backend returns an object.
function formatDestination(
  destination?: TourDestination | string
): string {
  if (!destination) return "";

  if (typeof destination === "string") {
    return destination;
  }

  return [
    destination.city,
    destination.state,
    destination.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function getTour(booking: BookingRecord) {
  if (typeof booking.tour === "string") {
    return {
      title: "Tour details unavailable",
      destination: "",
    };
  }

  return {
    title: booking.tour?.title || "Untitled tour",
    destination: formatDestination(booking.tour?.destination),
  };
}

function getAvailability(booking: BookingRecord) {
  if (typeof booking.availability === "string") {
    return null;
  }

  return booking.availability;
}

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency || "INR"} ${amount || 0}`;
  }
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const styles: Record<BookingStatus, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    declined: "bg-red-50 text-red-700 border-red-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function BookingManagement({
  role,
}: BookingManagementProps) {
  const dispatch = useAppDispatch();

  const {
    managedBookings,
    managedBookingsLoading,
    managedBookingsError,
    actionLoading,
    actionError,
    successMessage,
  } = useAppSelector((state) => state.booking);

  const bookings = (managedBookings || []) as BookingRecord[];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch bookings based on role.
  useEffect(() => {
    dispatch(clearBookingActionMessages());

    if (role === "admin") {
      dispatch(getAdminBookings());
    } else {
      dispatch(getOperatorBookings());
    }

    return () => {
      dispatch(clearManagedBookings());
      dispatch(clearBookingActionMessages());
    };
  }, [dispatch, role]);

  // Search and filter bookings.
  const filteredBookings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const traveler = getTraveler(booking);
      const tour = getTour(booking);

      const matchesSearch =
        !searchValue ||
        traveler.name.toLowerCase().includes(searchValue) ||
        traveler.email.toLowerCase().includes(searchValue) ||
        tour.title.toLowerCase().includes(searchValue) ||
        tour.destination.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  // Summary values.
  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const totalParticipants = bookings.reduce(
    (total, booking) => total + (Number(booking.participants) || 0),
    0
  );

  // Refresh bookings.
  function refreshBookings() {
    if (role === "admin") {
      dispatch(getAdminBookings());
    } else {
      dispatch(getOperatorBookings());
    }
  }

  // Confirm or decline booking.
  async function handleBookingAction(
    bookingId: string,
    action: "confirm" | "decline"
  ) {
    const message =
      action === "confirm"
        ? "Are you sure you want to confirm this booking?"
        : "Are you sure you want to decline this booking?";

    if (!window.confirm(message)) return;

    setProcessingId(bookingId);
    dispatch(clearBookingActionMessages());

    try {
      if (action === "confirm") {
        await dispatch(confirmBooking(bookingId)).unwrap();
      } else {
        await dispatch(declineBooking(bookingId)).unwrap();
      }

      refreshBookings();
    } catch {
      // Redux stores the error message.
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-green-700">
            {role === "admin" ? "Admin dashboard" : "Operator dashboard"}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Booking Management
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {role === "admin"
              ? "View and manage bookings across all tours."
              : "View and manage bookings for your tours."}
          </p>
        </div>

        <button
          type="button"
          onClick={refreshBookings}
          disabled={managedBookingsLoading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {managedBookingsLoading ? "Refreshing..." : "Refresh bookings"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total bookings"
          value={bookings.length}
          description="Bookings received"
        />

        <SummaryCard
          label="Pending"
          value={pendingCount}
          description="Waiting for a decision"
        />

        <SummaryCard
          label="Confirmed"
          value={confirmedCount}
          description="Successfully confirmed"
        />

        <SummaryCard
          label="Participants"
          value={totalParticipants}
          description="Total people booked"
        />
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_190px]">

          <div>
            <label
              htmlFor="booking-search"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Search bookings
            </label>

            <input
              id="booking-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search traveler, email, or tour..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div>
            <label
              htmlFor="booking-status"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Booking status
            </label>

            <select
              id="booking-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All statuses"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Request messages */}
      {managedBookingsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {managedBookingsError}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {/* Booking list */}
      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Bookings
          </h2>

          <span className="text-sm text-gray-500">
            {filteredBookings.length} result
            {filteredBookings.length === 1 ? "" : "s"}
          </span>
        </div>

        {managedBookingsLoading && bookings.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />

            <p className="mt-3 text-sm text-gray-500">
              Loading bookings...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl text-green-700">
              <span aria-hidden="true">▤</span>
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No bookings found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "Bookings will appear here when travelers book your tours."}
            </p>

          </div>
        ) : (
          <div className="space-y-4">

            {filteredBookings.map((booking) => {
              const traveler = getTraveler(booking);
              const tour = getTour(booking);
              const availability = getAvailability(booking);

              const isProcessing = processingId === booking._id;

              return (
                <article
                  key={booking._id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 sm:p-5"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                    {/* Booking information */}
                    <div className="min-w-0 flex-1 space-y-4">

                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={booking.status} />

                        <span className="break-all text-xs text-gray-400">
                          Booking ID: {booking._id}
                        </span>
                      </div>

                      {/* Tour details */}
                      <div>
                        <h3 className="break-words text-lg font-semibold text-gray-900">
                          {tour.title}
                        </h3>

                        {tour.destination && (
                          <p className="mt-1 text-sm text-gray-500">
                            {tour.destination}
                          </p>
                        )}
                      </div>

                      {/* Booking information grid */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        <InfoItem
                          label="Traveler"
                          value={traveler.name}
                          detail={traveler.email}
                        />

                        <InfoItem
                          label="Tour date"
                          value={formatDate(availability?.startTime)}
                          detail={
                            availability?.endTime
                              ? `Ends ${formatDate(availability.endTime)}`
                              : undefined
                          }
                        />

                        <InfoItem
                          label="Participants"
                          value={`${booking.participants || 0} ${
                            booking.participants === 1 ? "person" : "people"
                          }`}
                        />

                        <InfoItem
                          label="Total price"
                          value={formatPrice(
                            booking.totalPrice,
                            booking.currency
                          )}
                        />

                      </div>

                      {/* Special requirements */}
                      {booking.specialRequirements && (
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Special requirements
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                            {booking.specialRequirements}
                          </p>
                        </div>
                      )}

                      {booking.createdAt && (
                        <p className="text-xs text-gray-400">
                          Booked on {formatDate(booking.createdAt)}
                        </p>
                      )}

                    </div>

                    {/* Booking actions */}
                    {booking.status === "pending" && (
                      <div className="flex shrink-0 flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row lg:w-40 lg:flex-col lg:border-t-0 lg:pt-0">

                        <button
                          type="button"
                          onClick={() =>
                            handleBookingAction(booking._id, "confirm")
                          }
                          disabled={isProcessing || actionLoading}
                          className="flex-1 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isProcessing ? "Please wait..." : "Confirm"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleBookingAction(booking._id, "decline")
                          }
                          disabled={isProcessing || actionLoading}
                          className="flex-1 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Decline
                        </button>

                      </div>
                    )}

                  </div>
                </article>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

// Summary card
function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-sm font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

// Information item
function InfoItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-800">
        {value}
      </p>

      {detail && (
        <p className="mt-1 break-words text-xs text-gray-500">
          {detail}
        </p>
      )}
    </div>
  );
}
