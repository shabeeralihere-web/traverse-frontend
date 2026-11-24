
"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getMyTours } from "@/redux/slices/tourSlice";

import {
  getAllManageableAvailability,
  createAvailability,
  updateAvailability,
  cancelAvailability,
  clearAvailabilityError,
} from "@/redux/slices/availabilitySlice";

import type {
  AvailabilityInput,
  TourAvailability,
} from "@/redux/slices/availabilitySlice";

type DateFilter = "all" | "upcoming" | "past";
type StatusFilter = "all" | "scheduled" | "cancelled";

const emptyForm = {
  tourId: "",
  date: "",
  startTime: "09:00",
  endTime: "17:00",
  capacity: "10",
  priceOverride: "",
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/10";

const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getLocalTimeString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getLocalDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getTourTitle(
  tourId: string,
  tours: { _id: string; title: string }[]
) {
  return tours.find((tour) => tour._id === tourId)?.title || "Tour";
}

export default function AvailabilityManager() {
  const dispatch = useAppDispatch();

  const { myTours, isLoadingMyTours } = useAppSelector(
    (state) => state.tours
  );

  const {
    managementSlots,
    managementLoading,
    actionLoading,
    error,
  } = useAppSelector((state) => state.availability);

  const [search, setSearch] = useState("");
  const [tourFilter, setTourFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("upcoming");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [specificDate, setSpecificDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(getMyTours());
  }, [dispatch]);

  useEffect(() => {
    if (myTours.length > 0) {
      dispatch(
        getAllManageableAvailability(myTours.map((tour) => tour._id))
      );
    }
  }, [dispatch, myTours]);

  const now = Date.now();

  const upcomingCount = useMemo(
    () =>
      managementSlots.filter(
        (slot) =>
          slot.status === "scheduled" &&
          new Date(slot.startTime).getTime() >= now
      ).length,
    [managementSlots, now]
  );

  const pastCount = useMemo(
    () =>
      managementSlots.filter(
        (slot) => new Date(slot.startTime).getTime() < now
      ).length,
    [managementSlots, now]
  );

  const filteredSlots = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return managementSlots.filter((slot) => {
      const tourTitle = getTourTitle(slot.tour, myTours).toLowerCase();
      const startDate = new Date(slot.startTime);
      const isPast = startDate.getTime() < now;

      const matchesSearch =
        !normalizedSearch || tourTitle.includes(normalizedSearch);

      const matchesTour =
        tourFilter === "all" || slot.tour === tourFilter;

      const matchesDate =
        !specificDate ||
        getLocalDateString(startDate) === specificDate;

      const matchesTime =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && !isPast) ||
        (dateFilter === "past" && isPast);

      const matchesStatus =
        statusFilter === "all" || slot.status === statusFilter;

      return (
        matchesSearch &&
        matchesTour &&
        matchesDate &&
        matchesTime &&
        matchesStatus
      );
    });
  }, [
    managementSlots,
    myTours,
    search,
    tourFilter,
    specificDate,
    dateFilter,
    statusFilter,
    now,
  ]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    dispatch(clearAvailabilityError());
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setForm({
      ...emptyForm,
      tourId: tourFilter !== "all" ? tourFilter : myTours[0]?._id || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (slot: TourAvailability) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    setEditingId(slot._id);
    setForm({
      tourId: slot.tour,
      date: getLocalDateString(start),
      startTime: getLocalTimeString(start),
      endTime: getLocalTimeString(end),
      capacity: String(slot.capacity),
      priceOverride:
        slot.priceOverride === null ? "" : String(slot.priceOverride),
    });

    setFormError("");
    dispatch(clearAvailabilityError());
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    dispatch(clearAvailabilityError());

    if (!form.tourId) {
      setFormError("Please choose the tour for this departure.");
      return;
    }

    if (!form.date || !form.startTime || !form.endTime) {
      setFormError("Please select a date, start time and end time.");
      return;
    }

    const start = getLocalDateTime(form.date, form.startTime);
    const end = getLocalDateTime(form.date, form.endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setFormError("Please enter a valid date and time.");
      return;
    }

    if (start.getTime() <= Date.now()) {
      setFormError("The departure must start in the future.");
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setFormError("The end time must be later than the start time.");
      return;
    }

    const capacity = Number(form.capacity);
    const price =
      form.priceOverride.trim() === ""
        ? null
        : Number(form.priceOverride);

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      setFormError("Capacity must be a whole number between 1 and 500.");
      return;
    }

    if (
      price !== null &&
      (!Number.isFinite(price) || price < 0)
    ) {
      setFormError("Enter a valid price or leave it empty.");
      return;
    }

    const payload: AvailabilityInput = {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      capacity,
      priceOverride: price,
    };

    try {
      if (editingId) {
        await dispatch(
          updateAvailability({
            id: editingId,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(
          createAvailability({
            tourId: form.tourId,
            data: payload,
          })
        ).unwrap();
      }

      closeForm();
    } catch {
      // The Redux slice stores the API error.
    }
  };

  const handleCancel = async (slot: TourAvailability) => {
    const tourTitle = getTourTitle(slot.tour, myTours);

    const confirmed = window.confirm(
      `Cancel the departure for "${tourTitle}" on ${formatDate(
        slot.startTime
      )}?`
    );

    if (!confirmed) return;

    try {
      await dispatch(cancelAvailability(slot._id)).unwrap();
    } catch {
      // The Redux slice stores the API error.
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTourFilter("all");
    setDateFilter("upcoming");
    setStatusFilter("all");
    setSpecificDate("");
  };

  if (isLoadingMyTours) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-sm text-gray-500">
        Loading your tours...
      </div>
    );
  }

  if (myTours.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="text-xl font-semibold text-gray-900">
          No manageable tours yet
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
          Add a tour first. Once you have a tour, you can create its
          departure dates and decide how many guests can book each session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-green-700">
            TOUR MANAGEMENT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Availability
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
            Set departure dates, times and guest capacity. All your tour
            sessions are managed in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <span className="mr-2 text-lg leading-none">+</span>
          Add departure
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total departures</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {managementSlots.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Upcoming departures</p>
          <p className="mt-2 text-2xl font-bold text-green-700">
            {upcomingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Past departures</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {pastCount}
          </p>
        </div>
      </div>

      {/* ADD / EDIT FORM */}
      {showForm && (
        <section
          id="availability-form"
          className="scroll-mt-24 rounded-2xl border border-green-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit departure" : "Add a departure"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                One departure is one bookable session on a specific date.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* TOUR */}
            <div>
              <label htmlFor="departure-tour" className={labelClass}>
                Which tour is this departure for?
              </label>
              <select
                id="departure-tour"
                value={form.tourId}
                disabled={Boolean(editingId)}
                onChange={(event) =>
                  setForm({ ...form, tourId: event.target.value })
                }
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-100`}
                required
              >
                <option value="">Choose a tour</option>
                {myTours.map((tour) => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title}
                  </option>
                ))}
              </select>
              {editingId && (
                <p className="mt-2 text-xs text-gray-500">
                  The tour cannot be changed when editing an existing
                  departure.
                </p>
              )}
            </div>

            {/* DATE */}
            <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900">
                Departure date
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Select the exact calendar date when guests should start
                this tour.
              </p>

              <div className="mt-4 max-w-sm">
                <label htmlFor="departure-date" className={labelClass}>
                  Select date
                </label>
                <input
                  id="departure-date"
                  type="date"
                  required
                  min={getLocalDateString(new Date())}
                  value={form.date}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* TIMES */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Departure timing
              </h3>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Choose when the experience begins and when it finishes.
                Both times apply to the date selected above.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="departure-start" className={labelClass}>
                    Start time
                  </label>
                  <input
                    id="departure-start"
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(event) =>
                      setForm({ ...form, startTime: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="departure-end" className={labelClass}>
                    End time
                  </label>
                  <input
                    id="departure-end"
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(event) =>
                      setForm({ ...form, endTime: event.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Times are entered in India Standard Time (IST).
              </p>
            </div>

            {/* CAPACITY AND PRICE */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="departure-capacity" className={labelClass}>
                  Maximum guests
                </label>
                <input
                  id="departure-capacity"
                  type="number"
                  min="1"
                  max="500"
                  step="1"
                  required
                  value={form.capacity}
                  onChange={(event) =>
                    setForm({ ...form, capacity: event.target.value })
                  }
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-gray-500">
                  The maximum number of guests who can book this session.
                </p>
              </div>

              <div>
                <label htmlFor="departure-price" className={labelClass}>
                  Special price per person (optional)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ₹
                  </span>
                  <input
                    id="departure-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceOverride}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priceOverride: event.target.value,
                      })
                    }
                    placeholder="Default tour price"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to use the tour's normal price.
                </p>
              </div>
            </div>

            {/* FORM ERROR */}
            {(formError || error) && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  {formError || error}
                </p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={actionLoading}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Saving..."
                  : editingId
                    ? "Save departure changes"
                    : "Create departure"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FILTERS */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Find departures
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Search and filter your sessions. All tours are included by
            default.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="search-tour" className={labelClass}>
              Search tour
            </label>
            <input
              id="search-tour"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Enter a tour name..."
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="filter-tour" className={labelClass}>
              Filter by tour
            </label>
            <select
              id="filter-tour"
              value={tourFilter}
              onChange={(event) => setTourFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">All tours</option>
              {myTours.map((tour) => (
                <option key={tour._id} value={tour._id}>
                  {tour.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-date" className={labelClass}>
              Find a specific date
            </label>
            <input
              id="filter-date"
              type="date"
              value={specificDate}
              onChange={(event) => setSpecificDate(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="filter-status" className={labelClass}>
              Session status
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className={inputClass}
            >
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(
            [
              ["upcoming", "Upcoming"],
              ["all", "All dates"],
              ["past", "Past"],
            ] as [DateFilter, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDateFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                dateFilter === value
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* DEPARTURE LIST */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Departure sessions
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredSlots.length}{" "}
              {filteredSlots.length === 1 ? "session" : "sessions"} found
            </p>
          </div>
        </div>

        {managementLoading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading departure sessions...
          </div>
        ) : error && managementSlots.length === 0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h3 className="font-semibold text-gray-900">
              {managementSlots.length === 0
                ? "No departures created yet"
                : "No matching departures"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              {managementSlots.length === 0
                ? "Create a departure date for one of your tours. Guests will then be able to book that session."
                : "Try changing your search or filters to find other departures."}
            </p>
            {managementSlots.length === 0 ? (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Add your first departure
              </button>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSlots.map((slot) => {
              const remaining = Math.max(
                0,
                slot.capacity - slot.bookedCount
              );
              const isPast =
                new Date(slot.startTime).getTime() < Date.now();
              const percentage =
                slot.capacity > 0
                  ? Math.min(
                      100,
                      (slot.bookedCount / slot.capacity) * 100
                    )
                  : 0;

              return (
                <article
                  key={slot._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            slot.status === "scheduled"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {slot.status === "scheduled"
                            ? "Scheduled"
                            : "Cancelled"}
                        </span>

                        {isPast && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            Past departure
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 text-base font-bold text-gray-900">
                        {getTourTitle(slot.tour, myTours)}
                      </h3>

                      <p className="mt-2 text-lg font-semibold text-gray-900">
                        {formatDate(slot.startTime)}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {formatTime(slot.startTime)} –{" "}
                        {formatTime(slot.endTime)} IST
                      </p>
                    </div>

                    <div className="w-full rounded-xl bg-gray-50 p-4 lg:max-w-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-500">
                          Guest bookings
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {slot.bookedCount} / {slot.capacity}
                        </span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-green-700 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500">
                          {remaining} seats remaining
                        </span>
                        <span className="text-xs font-semibold text-gray-700">
                          {slot.priceOverride === null
                            ? "Tour default price"
                            : `${formatCurrency(slot.priceOverride)} / guest`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {slot.status === "scheduled" && !isPast && (
                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                      <button
                        type="button"
                        onClick={() => handleEdit(slot)}
                        disabled={actionLoading}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        Edit departure
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCancel(slot)}
                        disabled={actionLoading}
                        className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancel departure
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
