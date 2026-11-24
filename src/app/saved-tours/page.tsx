
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MapPin,
  LockKeyhole,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getMySavedTours,
  removeSavedTour,
} from "@/redux/slices/savedTourSlice";

import type { Tour } from "@/types/tour.type";

export default function SavedToursPage() {
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const {
    savedTours,
    isLoading,
    isRemoving,
    error,
  } = useAppSelector((state) => state.savedTours);

  const [removingTourId, setRemovingTourId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);

  const isTraveler =
    initialized && isAuthenticated && user?.role === "traveler";

  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated && user?.role === "traveler") {
      dispatch(getMySavedTours());
    }
  }, [dispatch, initialized, isAuthenticated, user?.role]);

  async function handleRemove(tourId: string) {
    setRemovingTourId(tourId);
    setRemoveError(null);
    setRemoveMessage(null);

    try {
      await dispatch(removeSavedTour(tourId)).unwrap();
      setRemoveMessage("Tour removed from your saved tours.");
    } catch (err) {
      setRemoveError(
        typeof err === "string"
          ? err
          : "Unable to remove this tour. Please try again."
      );
    } finally {
      setRemovingTourId(null);
    }
  }

  function formatPrice(tour: Tour) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: tour.price.currency || "INR",
      maximumFractionDigits: 0,
    }).format(tour.price.amount);
  }

  function getDestination(tour: Tour) {
    return [
      tour.destination.city,
      tour.destination.state,
      tour.destination.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  function getPhoto(tour: Tour) {
    return tour.photos?.[0]?.url || "/images/tour-placeholder.jpg";
  }

  if (!initialized) {
    return (
      <main className="min-h-[75vh] bg-[#f8faf8] px-4 py-16">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mx-auto h-8 w-56 rounded-lg bg-gray-200" />
          <div className="mx-auto mt-4 h-4 w-72 max-w-full rounded bg-gray-200" />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl bg-white"
              >
                <div className="h-52 bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f8faf8] px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f3eb] text-[#245b3b]">
            <Heart size={32} strokeWidth={1.7} />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Your saved tours are waiting
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
            Log in to save your favourite experiences and keep all your travel
            ideas in one place.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#245b3b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#19452d]"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Create account
            </Link>
          </div>

    <Link
  href="/tours"
  className="inline-flex items-center gap-2.5 text-sm font-semibold text-gray-600 transition-colors hover:text-[#245b3b]"
>
  <ArrowLeft size={21} strokeWidth={2.8} />
  Back to tours
</Link>
        </div>
      </main>
    );
  }

  if (!isTraveler) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#f8faf8] px-4 py-16">
        <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
            <LockKeyhole size={32} strokeWidth={1.7} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Traveler account required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
            Saved tours are available only for traveler accounts. You can
            continue exploring all published tours.
          </p>

          <Link
            href="/tours"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#245b3b] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#19452d]"
          >
            Explore tours
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/tours"
          className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-[#245b3b] hover:text-[#245b3b]"
        >
          <ArrowLeft size={21} strokeWidth={2.8} />
          Back to tours
        </Link>

        <section className="mt-9 border-b border-gray-200 pb-8 sm:mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#36784e]">
            Your travel collection
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[42px]">
            Saved Tours
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Keep the experiences you love in one place. Revisit your
            favourites whenever you are ready for your next adventure.
          </p>
        </section>

        {isLoading && (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <div className="h-56 bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-9 w-full rounded-lg bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-10 rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-bold text-gray-900">
              Could not load your saved tours
            </h2>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={() => dispatch(getMySavedTours())}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#245b3b] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && savedTours.length === 0 && (
          <section className="mt-10 flex min-h-[440px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#cbdccb] bg-white px-6 py-12 text-center sm:min-h-[480px]">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-600">
              <Heart size={40} strokeWidth={1.5} />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#36784e]">
              Your collection starts here
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              No saved tours yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
              Found something exciting? Tap the heart on any tour to save it
              here. Your favourite places and experiences will be ready when
              you are.
            </p>

            <Link
              href="/tours"
              className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#245b3b] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19452d] active:scale-[0.98]"
            >
              Explore tours
            </Link>

            <p className="mt-4 text-xs text-gray-400">
              Discover a new experience with Traverse
            </p>
          </section>
        )}

        {removeMessage && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {removeMessage}
          </div>
        )}

        {removeError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {removeError}
          </div>
        )}

        {!isLoading && !error && savedTours.length > 0 && (
          <section className="mt-9">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Your favourites
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {savedTours.map((tour) => {
                const isThisTourRemoving =
                  isRemoving && removingTourId === tour._id;

                return (
                  <article
                    key={tour._id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={getPhoto(tour)}
                        alt={tour.photos?.[0]?.alt || tour.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#245b3b] shadow-sm">
                        Saved tour
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemove(tour._id)}
                        disabled={isRemoving}
                        aria-label={`Remove ${tour.title} from saved tours`}
                        title="Remove from saved tours"
                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#4b5563] shadow-md transition hover:scale-105 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isThisTourRemoving ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                        ) : (
                          <Heart
                            size={21}
                            fill="currentColor"
                            strokeWidth={2}
                          />
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <MapPin
                          size={16}
                          strokeWidth={1.8}
                          className="shrink-0 text-[#36784e]"
                        />

                        <span className="truncate">
                          {getDestination(tour) || "Explore destination"}
                        </span>
                      </div>

                      <h3 className="mt-3 line-clamp-2 min-h-14 text-lg font-bold leading-7 text-gray-900 transition group-hover:text-[#245b3b]">
                        {tour.title}
                      </h3>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-xs text-gray-500">
                            Starting from
                          </p>

                          <p className="mt-1 text-lg font-bold text-[#245b3b]">
                            {formatPrice(tour)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500">Duration</p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {tour.durationHours} hours
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <Link
                          href={`/tours/${tour._id}`}
                          className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#245b3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19452d]"
                        >
                          View tour
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleRemove(tour._id)}
                          disabled={isRemoving}
                          className="flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isThisTourRemoving ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
