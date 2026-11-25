"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getPublishedTours } from "@/redux/slices/tourSlice";
import {
  getMySavedTours,
  saveTour,
  removeSavedTour,
  clearSavedTours,
} from "@/redux/slices/savedTourSlice";
import type { Tour } from "@/types/tour.type";

const PAGE_SIZE = 12;

const activities = [
  { value: "adventure", label: "Adventure" },
  { value: "nature", label: "Nature" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "water", label: "Water activities" },
  { value: "wildlife", label: "Wildlife" },
  { value: "other", label: "Other" },
];

const currencies = ["INR", "USD", "EUR", "GBP", "AED"];

interface Filters {
  search: string;
  destination: string;
  activityType: string;
  date: string;
  currency: string;
  minPrice: string;
  maxPrice: string;
  minDuration: string;
  maxDuration: string;
  sort: string;
}

const initialFilters: Filters = {
  search: "",
  destination: "",
  activityType: "",
  date: "",
  currency: "INR",
  minPrice: "",
  maxPrice: "",
  minDuration: "",
  maxDuration: "",
  sort: "newest",
};

function formatPrice(
  amount: number,
  currency: Tour["price"]["currency"]
) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-IN")}`;
  }
}

function formatActivityType(activityType: Tour["activityType"]) {
  return activityType.charAt(0).toUpperCase() + activityType.slice(1);
}

function getPageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  );
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold text-[#304b39]">
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#477b5b] focus:ring-2 focus:ring-[#477b5b]/10";

const selectClass =
  "h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[#477b5b] focus:ring-2 focus:ring-[#477b5b]/10";

export default function ToursPage() {
  const dispatch = useAppDispatch();

  const {
    publicTours,
    isLoadingTours,
    error,
    pagination,
    totalCount,
  } = useAppSelector((state) => state.tours);

  const {
    savedTours,
    error: savedTourError,
  } = useAppSelector((state) => state.savedTours);

  const {
    user,
    isAuthenticated,
    initialized,
  } = useAppSelector((state) => state.auth);

  const isTraveler =
    initialized &&
    isAuthenticated &&
    user?.role === "traveler";

  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Mobile-only state
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);
  const [mobileTours, setMobileTours] = useState<Tour[]>([]);

  const requestedPageRef = useRef<number | null>(null);
  const wasLoadingRef = useRef(false);
  const loadedMobilePageRef = useRef<number | null>(null);

  const [saveModal, setSaveModal] = useState<
    "guest" | "restricted" | null
  >(null);

  const [pendingTourId, setPendingTourId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Use the accumulated list on mobile.
  // Desktop continues using the original Redux results.
  const displayedTours = isMobile ? mobileTours : publicTours;

  const isTourSaved = (tourId: string) =>
    savedTours.some((tour) => tour._id === tourId);

  // Detect mobile screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");

    const handleScreenChange = () => {
      setIsMobile(mediaQuery.matches);
    };

    handleScreenChange();

    mediaQuery.addEventListener("change", handleScreenChange);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenChange);
    };
  }, []);

  // Saved tours
  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated && user?.role === "traveler") {
      dispatch(getMySavedTours());
    } else {
      dispatch(clearSavedTours());
    }
  }, [dispatch, initialized, isAuthenticated, user?.role]);

  // Debounced search
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [filters.search]);

  // Fetch tours
  // Desktop uses the original page state.
  // Mobile uses its own page state for Load More.
  useEffect(() => {
    const requestPage = isMobile ? mobilePage : page;

    requestedPageRef.current = requestPage;

    const request = dispatch(
      getPublishedTours({
        search: debouncedSearch || undefined,
        destination: filters.destination.trim() || undefined,
        activityType: filters.activityType || undefined,
        date: filters.date || undefined,
        currency: filters.currency || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minDuration: filters.minDuration || undefined,
        maxDuration: filters.maxDuration || undefined,
        sort: filters.sort,
        page: requestPage,
        limit: PAGE_SIZE,
      })
    );

    return () => {
      request.abort();
    };
  }, [
    dispatch,
    isMobile,
    mobilePage,
    page,
    debouncedSearch,
    filters.destination,
    filters.activityType,
    filters.date,
    filters.currency,
    filters.minPrice,
    filters.maxPrice,
    filters.minDuration,
    filters.maxDuration,
    filters.sort,
  ]);

  // Append mobile results after each successful request.
  useEffect(() => {
    if (isLoadingTours) {
      wasLoadingRef.current = true;
      return;
    }

    if (!wasLoadingRef.current) return;

    wasLoadingRef.current = false;

    if (error || !isMobile) return;

    const completedPage = requestedPageRef.current;

    if (
      completedPage === null ||
      loadedMobilePageRef.current === completedPage
    ) {
      return;
    }

    setMobileTours((previousTours) => {
      // First page starts a fresh list.
      if (completedPage === 1) {
        return publicTours;
      }

      // Later pages are appended without duplicates.
      const existingIds = new Set(
        previousTours.map((tour) => tour._id)
      );

      const newTours = publicTours.filter(
        (tour) => !existingIds.has(tour._id)
      );

      return [...previousTours, ...newTours];
    });

    loadedMobilePageRef.current = completedPage;
  }, [publicTours, isLoadingTours, error, isMobile]);

  // Reset accumulated mobile results when filters change.
  const resetMobileResults = () => {
    setMobilePage(1);
    setMobileTours([]);
    loadedMobilePageRef.current = null;
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));

    setPage(1);
    resetMobileResults();
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setDebouncedSearch("");
    setPage(1);
    resetMobileResults();
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.destination.trim() !== "" ||
    filters.activityType !== "" ||
    filters.date !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minDuration !== "" ||
    filters.maxDuration !== "" ||
    filters.sort !== "newest";

  const pageNumbers = useMemo(
    () =>
      getPageNumbers(
        pagination?.currentPage ?? page,
        pagination?.totalPages ?? 0
      ),
    [pagination, page]
  );

  const showingFrom =
    totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const showingTo = Math.min(page * PAGE_SIZE, totalCount);

  // Retry current request
  const handleRetry = () => {
    const requestPage = isMobile ? mobilePage : page;

    requestedPageRef.current = requestPage;

    dispatch(
      getPublishedTours({
        page: requestPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        destination: filters.destination || undefined,
        activityType: filters.activityType || undefined,
        date: filters.date || undefined,
        currency: filters.currency || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minDuration: filters.minDuration || undefined,
        maxDuration: filters.maxDuration || undefined,
        sort: filters.sort,
      })
    );
  };

  const handleLoadMore = () => {
    if (isLoadingTours) return;
    if (!pagination?.hasNextPage) return;

    setMobilePage((current) => current + 1);
  };

  const handleSaveClick = async (tour: Tour) => {
    setSaveMessage("");

    if (!initialized) return;

    if (!isAuthenticated) {
      setSaveModal("guest");
      return;
    }

    if (user?.role !== "traveler") {
      setSaveModal("restricted");
      return;
    }

    if (pendingTourId) return;

    setPendingTourId(tour._id);

    try {
      if (isTourSaved(tour._id)) {
        await dispatch(removeSavedTour(tour._id)).unwrap();
        setSaveMessage("Tour removed from your saved tours.");
      } else {
        await dispatch(saveTour(tour._id)).unwrap();
        setSaveMessage("Tour saved successfully.");
      }
    } catch (error) {
      setSaveMessage(
        typeof error === "string"
          ? error
          : "Unable to update your saved tours. Please try again."
      );
    } finally {
      setPendingTourId(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="border-b border-gray-100 bg-[#f8faf8]">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
          <div className="mb-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#477b5b]">
              Explore Traverse
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-[#172d20] sm:text-4xl">
              Find your next experience.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Discover places, experiences and adventures worth remembering.
            </p>
          </div>

          {/* Original desktop search - unchanged */}
          <div className="hidden flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:flex sm:flex-row sm:items-center sm:rounded-full sm:py-2 sm:pl-6 sm:pr-2">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="tour-search"
                className="mb-1 block text-xs font-bold text-[#203b2a]"
              >
                Search experiences
              </label>

              <input
                id="tour-search"
                type="search"
                value={filters.search}
                onChange={(event) =>
                  updateFilter("search", event.target.value)
                }
                placeholder="Try Munnar, kayaking, trekking..."
                className="w-full border-0 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0"
              />
            </div>

            <div className="hidden h-9 w-px bg-gray-200 sm:block" />

            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <p className="text-xs text-gray-500">
                {totalCount.toLocaleString("en-IN")} experiences
              </p>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="flex h-10 items-center gap-2 rounded-full bg-[#245b3b] px-5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
                aria-expanded={showFilters}
                aria-controls="tour-filters"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M4 6h16M7 12h10m-7 6h4" />
                </svg>
                {showFilters ? "Hide filters" : "Filters"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky search */}
      <div className="sticky top-0 z-[999] border-b border-gray-100 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md sm:hidden">
        <div className="flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-[#f8faf8] px-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4 shrink-0 text-gray-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            id="tour-search-mobile"
            type="search"
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            placeholder="Search experiences..."
            aria-label="Search experiences"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#203b2a] outline-none placeholder:text-gray-400 focus:ring-0"
          />

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            aria-expanded={showFilters}
            aria-controls="tour-filters"
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#245b3b] px-3.5 text-xs font-semibold text-white transition hover:bg-[#19452d]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path d="M4 6h16M7 12h10m-7 6h4" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      <section
        id="tour-filters"
        className="border-b border-gray-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <FilterLabel>Destination</FilterLabel>
                <input
                  type="text"
                  value={filters.destination}
                  onChange={(event) =>
                    updateFilter("destination", event.target.value)
                  }
                  placeholder="City, state or country"
                  className={inputClass}
                />
              </div>

              <div>
                <FilterLabel>Activity type</FilterLabel>
                <select
                  value={filters.activityType}
                  onChange={(event) =>
                    updateFilter("activityType", event.target.value)
                  }
                  className={selectClass}
                >
                  <option value="">All activities</option>
                  {activities.map((activity) => (
                    <option key={activity.value} value={activity.value}>
                      {activity.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FilterLabel>Available date</FilterLabel>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={filters.date}
                  onChange={(event) =>
                    updateFilter("date", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <FilterLabel>Sort experiences</FilterLabel>
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilter("sort", event.target.value)
                  }
                  className={selectClass}
                >
                  <option value="newest">Recently added</option>
                  <option value="oldest">Oldest first</option>
                  <option value="duration-short">Shortest duration</option>
                  <option value="duration-long">Longest duration</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </div>

              <div>
                <FilterLabel>Currency</FilterLabel>
                <select
                  value={filters.currency}
                  onChange={(event) =>
                    updateFilter("currency", event.target.value)
                  }
                  className={selectClass}
                >
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FilterLabel>Minimum price</FilterLabel>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) =>
                    updateFilter("minPrice", event.target.value)
                  }
                  placeholder="No minimum"
                  className={inputClass}
                />
              </div>

              <div>
                <FilterLabel>Maximum price</FilterLabel>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) =>
                    updateFilter("maxPrice", event.target.value)
                  }
                  placeholder="No maximum"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FilterLabel>Min hours</FilterLabel>
                  <input
                    type="number"
                    min="0.5"
                    max="720"
                    step="0.5"
                    value={filters.minDuration}
                    onChange={(event) =>
                      updateFilter("minDuration", event.target.value)
                    }
                    placeholder="Min"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FilterLabel>Max hours</FilterLabel>
                  <input
                    type="number"
                    min="0.5"
                    max="720"
                    step="0.5"
                    value={filters.maxDuration}
                    onChange={(event) =>
                      updateFilter("maxDuration", event.target.value)
                    }
                    placeholder="Max"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="text-sm font-semibold text-[#245b3b] underline underline-offset-4 transition hover:text-[#173f29] disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {!showFilters && hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 py-3">
              <span className="text-xs font-medium text-gray-500">
                Filters applied
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[#245b3b] underline underline-offset-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Tours */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#203b2a] sm:text-2xl">
              Explore experiences
            </h2>

            {!isLoadingTours && !error && (
              <p className="mt-1 text-sm text-gray-500">
                {totalCount === 0
                  ? "No experiences available"
                  : isMobile
                    ? `Showing ${mobileTours.length} of ${totalCount.toLocaleString("en-IN")} experiences`
                    : `Showing ${showingFrom}–${showingTo} of ${totalCount.toLocaleString("en-IN")} experiences`}
              </p>
            )}
          </div>
        </div>

        {saveMessage && (
          <p
            role="status"
            className="mb-5 rounded-xl bg-[#edf5ef] px-4 py-3 text-sm text-[#245b3b]"
          >
            {saveMessage}
          </p>
        )}

        {savedTourError && (
          <p role="alert" className="mb-5 text-sm text-red-600">
            {savedTourError}
          </p>
        )}

        {/* Loading skeleton */}
        {isLoadingTours && (!isMobile || mobileTours.length === 0) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-gray-100 sm:rounded-2xl" />
                <div className="mt-3 h-3 w-3/4 rounded bg-gray-100 sm:mt-4 sm:h-4" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 sm:mt-3" />
                <div className="mt-2 hidden h-3 w-full rounded bg-gray-100 sm:mt-3 sm:block" />
              </div>
            ))}
          </div>
        )}

        {/* API error */}
        {!isLoadingTours &&
          error &&
          (!isMobile || mobileTours.length === 0) && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <h3 className="font-semibold text-red-800">
                Unable to load experiences
              </h3>

              <p className="mt-2 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 rounded-full bg-[#245b3b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#19452d]"
              >
                Try again
              </button>
            </div>
          )}

        {/* No results */}
        {!isLoadingTours &&
          !error &&
          displayedTours.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-[#f9faf9] px-5 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf2ec] text-[#245b3b]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-[#203b2a]">
                No experiences found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Try another destination or change your filters to discover more experiences.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full bg-[#245b3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
              >
                Clear filters
              </button>
            </div>
          )}

        {/* Tour cards */}
        {!error && displayedTours.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
              {displayedTours.map((tour) => {
                const isSaved = isTourSaved(tour._id);
                const isPending = pendingTourId === tour._id;

                return (
                  <article key={tour._id} className="group min-w-0">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 sm:rounded-2xl">
                      <Link
                        href={`/tours/${tour._id}`}
                        className="absolute inset-0"
                        aria-label={`View ${tour.title}`}
                      >
                        {tour.photos?.length > 0 ? (
                          <Image
                            src={tour.photos[0].url}
                            alt={tour.photos[0].alt || tour.title}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400 sm:text-sm">
                            No image available
                          </div>
                        )}

                        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-semibold text-[#245b3b] shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-xs">
                          {formatActivityType(tour.activityType)}
                        </span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleSaveClick(tour)}
                        disabled={
                          !initialized ||
                          isPending ||
                          pendingTourId !== null
                        }
                        aria-label={
                          isSaved ? "Remove from saved tours" : "Save tour"
                        }
                        aria-pressed={isSaved}
                        title={
                          isSaved
                            ? "Remove from saved tours"
                            : "Save this tour"
                        }
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-md transition hover:scale-110 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
                      >
                        {isPending ? (
                          <svg
                            className="h-4 w-4 animate-spin sm:h-5 sm:w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="opacity-25"
                            />
                            <path
                              d="M21 12a9 9 0 0 0-9-9"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            fill={isSaved ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.8"
                            aria-hidden="true"
                          >
                            <path
                              d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <Link
                      href={`/tours/${tour._id}`}
                      className="block pt-2.5 sm:pt-4"
                    >
                      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
                        <h3 className="line-clamp-2 text-xs font-semibold leading-4 text-[#203b2a] transition group-hover:text-[#477b5b] sm:line-clamp-1 sm:text-[15px] sm:leading-normal">
                          {tour.title}
                        </h3>

                        <span className="shrink-0 text-[10px] font-medium text-gray-700 sm:text-sm">
                          {tour.durationHours}h
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-[10px] text-gray-500 sm:text-sm">
                        {tour.destination.city}
                        {tour.destination.state
                          ? `, ${tour.destination.state}`
                          : ""}
                      </p>

                      <p className="mt-2 hidden line-clamp-2 text-sm leading-5 text-gray-500 sm:block">
                        {tour.description}
                      </p>

                      <p className="mt-2 text-xs text-[#203b2a] sm:mt-3 sm:text-sm">
                        <span className="font-bold">
                          {formatPrice(
                            tour.price.amount,
                            tour.price.currency
                          )}
                        </span>
                        <span className="text-gray-500"> / person</span>
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* Mobile Load More */}
            {isMobile && pagination?.hasNextPage && (
              <div className="mt-8 flex flex-col items-center border-t border-gray-100 pt-6 sm:hidden">
                <p className="mb-3 text-xs text-gray-500">
                  Showing {mobileTours.length} of{" "}
                  {totalCount.toLocaleString("en-IN")} experiences
                </p>

                <button
                  type="button"
                  disabled={isLoadingTours}
                  onClick={handleLoadMore}
                  className="flex h-11 min-w-40 items-center justify-center gap-2 rounded-full border border-[#245b3b] px-6 text-sm font-semibold text-[#245b3b] transition hover:bg-[#edf5ef] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingTours ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="opacity-25"
                        />
                        <path
                          d="M21 12a9 9 0 0 0-9-9"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Desktop numbered pagination - unchanged */}
            {pagination && pagination.totalPages > 1 && (
              <nav
                aria-label="Tour results pages"
                className="mt-12 hidden flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 sm:flex sm:flex-row"
              >
                <p className="text-sm text-gray-500">
                  Page{" "}
                  <span className="font-semibold text-gray-800">
                    {pagination.currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {pagination.totalPages}
                  </span>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPreviousPage || isLoadingTours}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    aria-label="Previous page"
                    className="inline-flex h-10 items-center justify-center gap-2 px-2 text-gray-600 transition hover:text-[#245b3b] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft size={22} strokeWidth={2.8} />
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {pageNumbers[0] > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPage(1)}
                        className="h-10 min-w-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 hover:border-[#477b5b]"
                      >
                        1
                      </button>

                      {pageNumbers[0] > 2 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                    </>
                  )}

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-current={
                        pageNumber === pagination.currentPage
                          ? "page"
                          : undefined
                      }
                      onClick={() => setPage(pageNumber)}
                      className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition ${
                        pageNumber === pagination.currentPage
                          ? "bg-[#245b3b] text-white"
                          : "border border-gray-200 text-gray-700 hover:border-[#477b5b] hover:text-[#245b3b]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  {pageNumbers[pageNumbers.length - 1] <
                    pagination.totalPages && (
                    <>
                      {pageNumbers[pageNumbers.length - 1] <
                        pagination.totalPages - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}

                      <button
                        type="button"
                        onClick={() => setPage(pagination.totalPages)}
                        className="h-10 min-w-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 hover:border-[#477b5b]"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage || isLoadingTours}
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    aria-label="Next page"
                    className="inline-flex h-10 items-center justify-center gap-2 px-2 text-gray-600 transition hover:text-[#245b3b] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={22} strokeWidth={2.8} />
                  </button>
                </div>
              </nav>
            )}
          </>
        )}
      </section>

      {/* Save tour modal */}
      {saveModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSaveModal(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setSaveModal(null)}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ef] text-[#245b3b]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>
            </div>

            {saveModal === "guest" ? (
              <>
                <h2
                  id="save-modal-title"
                  className="text-xl font-semibold text-[#203b2a]"
                >
                  Save this experience
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sign in to your Traverse account or create an account to save
                  experiences and access them whenever you want.
                </p>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/login"
                    className="flex h-11 items-center justify-center rounded-xl bg-[#245b3b] px-5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="flex h-11 items-center justify-center rounded-xl border border-[#245b3b] px-5 text-sm font-semibold text-[#245b3b] transition hover:bg-[#edf5ef]"
                  >
                    Create an account
                  </Link>

                  <button
                    type="button"
                    onClick={() => setSaveModal(null)}
                    className="h-10 rounded-xl text-sm font-semibold text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  id="save-modal-title"
                  className="text-xl font-semibold text-[#203b2a]"
                >
                  Traveler account required
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Only registered travelers can save experiences to their
                  wishlist. This feature is not available for operator or
                  admin accounts.
                </p>

                <button
                  type="button"
                  onClick={() => setSaveModal(null)}
                  className="mt-6 h-11 w-full rounded-xl bg-[#245b3b] px-5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
                >
                  Okay, got it
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}