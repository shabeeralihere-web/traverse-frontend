
"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getPublishedTourById,
  clearSelectedTour,
} from "@/redux/slices/tourSlice";

import {
  getTourAvailability,
  clearAvailability,
} from "@/redux/slices/availabilitySlice";

import {
  createBooking,
  clearBookingState,
} from "@/redux/slices/bookingSlice";

import {
  getMySavedTours,
  saveTour,
  removeSavedTour,
  clearSavedTours,
} from "@/redux/slices/savedTourSlice";

import type { Tour } from "@/types/tour.type";

function formatPrice(
  amount: number,
  currency: Tour["price"]["currency"]
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatActivityType(activityType: Tour["activityType"]) {
  return activityType.charAt(0).toUpperCase() + activityType.slice(1);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function TourDetailsContent() {
  const params = useParams<{ tourId: string }>();
  const tourId = params.tourId;

  const dispatch = useAppDispatch();

  const { selectedTour, isLoadingTour, error } = useAppSelector(
    (state) => state.tours
  );

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const { savedTours } = useAppSelector(
    (state) => state.savedTours
  );

  const {
    slots,
    loading: availabilityLoading,
    error: availabilityError,
  } = useAppSelector((state) => state.availability);

  const {
    loading: bookingLoading,
    error: bookingError,
    successMessage,
    createdBooking,
  } = useAppSelector((state) => state.booking);

  // Booking state.
  const [selectedAvailabilityId, setSelectedAvailabilityId] =
    useState("");

  const [participants, setParticipants] = useState(1);

  // Gallery state.
  const [activeImageIndex, setActiveImageIndex] =
    useState<number | null>(null);

  // Saved tours state.
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);

  const canBook =
    initialized &&
    isAuthenticated &&
    user?.role === "traveler";

  const isGuest = initialized && !isAuthenticated;

  const isRestrictedUser =
    initialized &&
    isAuthenticated &&
    user?.role !== "traveler";

  const isSaved = savedTours.some(
    (item) => item._id === tourId
  );

  // Load tour.
  useEffect(() => {
    dispatch(clearSelectedTour());
    dispatch(getPublishedTourById(tourId));

    return () => {
      dispatch(clearSelectedTour());
    };
  }, [dispatch, tourId]);

  // Load saved tours for authenticated travelers.
  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated && user?.role === "traveler") {
      dispatch(getMySavedTours());
    } else {
      dispatch(clearSavedTours());
    }
  }, [dispatch, initialized, isAuthenticated, user?.role]);

  // Load availability and reset page-specific state.
  useEffect(() => {
    dispatch(clearAvailability());
    dispatch(clearBookingState());

    setSelectedAvailabilityId("");
    setParticipants(1);

    dispatch(getTourAvailability(tourId));

    return () => {
      dispatch(clearAvailability());
    };
  }, [dispatch, tourId]);

  // Clear an unavailable selected departure.
  useEffect(() => {
    if (
      selectedAvailabilityId &&
      !slots.some((slot) => slot._id === selectedAvailabilityId)
    ) {
      setSelectedAvailabilityId("");
      setParticipants(1);
    }
  }, [slots, selectedAvailabilityId]);

  // Keyboard controls for image viewer.
  useEffect(() => {
    if (activeImageIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImageIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((current) =>
          current === null
            ? null
            : (current + 1) % (selectedTour?.photos.length || 1)
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((current) =>
          current === null
            ? null
            : (
                current -
                1 +
                (selectedTour?.photos.length || 1)
              ) % (selectedTour?.photos.length || 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, selectedTour?.photos.length]);

  const selectedSlot = useMemo(
    () =>
      slots.find(
        (slot) => slot._id === selectedAvailabilityId
      ) || null,
    [slots, selectedAvailabilityId]
  );

  const remainingSeats = selectedSlot
    ? Math.max(
        0,
        selectedSlot.capacity - selectedSlot.bookedCount
      )
    : 0;

  const pricePerParticipant =
    selectedSlot?.priceOverride ??
    selectedTour?.price.amount ??
    0;

  const totalPrice = pricePerParticipant * participants;

  const handleAvailabilityChange = (availabilityId: string) => {
    setSelectedAvailabilityId(availabilityId);
    setParticipants(1);
    dispatch(clearBookingState());
  };

  const handleParticipantsChange = (value: number) => {
    setParticipants(value);
    dispatch(clearBookingState());
  };

  const openImage = (index: number) => {
    setActiveImageIndex(index);
  };

  const showPreviousImage = () => {
    setActiveImageIndex((current) => {
      if (current === null || !selectedTour?.photos.length) {
        return null;
      }

      return (
        current - 1 + selectedTour.photos.length
      ) % selectedTour.photos.length;
    });
  };

  const showNextImage = () => {
    setActiveImageIndex((current) => {
      if (current === null || !selectedTour?.photos.length) {
        return null;
      }

      return (current + 1) % selectedTour.photos.length;
    });
  };

  // Save or remove a tour.
  const handleSaveTour = async () => {
    if (!initialized) return;

    if (!isAuthenticated) {
      setShowSaveModal(true);
      return;
    }

    if (user?.role !== "traveler") {
      setSaveMessage("Only traveler accounts can save tours.");
      return;
    }

    if (saveLoading) return;

    setSaveLoading(true);
    setSaveMessage("");

    try {
      if (isSaved) {
        await dispatch(removeSavedTour(tourId)).unwrap();

        setSaveMessage("Tour removed from your saved tours.");
      } else {
        await dispatch(saveTour(tourId)).unwrap();

        setSaveMessage("Tour saved successfully.");
      }
    } catch (error) {
      setSaveMessage(
        typeof error === "string"
          ? error
          : "Unable to update saved tours."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Normal instant booking.
  const handleBooking = async () => {
    if (!canBook || !selectedSlot || !selectedTour) return;

    if (participants < 1 || participants > remainingSeats) {
      return;
    }

    try {
      await dispatch(
        createBooking({
          tourId: selectedTour._id,
          availabilityId: selectedSlot._id,
          participants,
        })
      ).unwrap();

      dispatch(getTourAvailability(selectedTour._id));
    } catch {
      // Booking slice stores the error.
    }
  };

  if (isLoadingTour) {
    return (
      <main className="min-h-screen bg-white px-5 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />

          <div className="mt-8 h-80 animate-pulse rounded-2xl bg-gray-100" />

          <div className="mt-6 h-6 w-72 animate-pulse rounded bg-gray-100" />
        </div>
      </main>
    );
  }

  if (error || !selectedTour || selectedTour._id !== tourId) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-white px-5">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
            Tour not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error ||
              "This tour is unavailable or may have been removed."}
          </p>

         <Link
  href="/tours"
  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#245b3b]"
>
  <ArrowLeft size={17} strokeWidth={1.8} />
  Explore tours
</Link>
        </div>
      </main>
    );
  }

  const tour = selectedTour;
  const photos = tour.photos || [];

  const location = [
    tour.destination.city,
    tour.destination.state,
    tour.destination.country,
  ]
    .filter(Boolean)
    .join(", ");

  const activePhoto =
    activeImageIndex !== null
      ? photos[activeImageIndex]
      : null;

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 sm:pt-10">
        <Link
  href="/tours"
  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#245b3b]"
>
  <ArrowLeft size={17} strokeWidth={1.8} />
  Explore tours
</Link>

        {/* Heading */}
        <section className="mb-7 mt-7">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#edf5ef] px-3 py-1.5 text-xs font-semibold text-[#245b3b]">
              {formatActivityType(tour.activityType)}
            </span>

            <span className="text-sm text-gray-500">
              {tour.durationHours} hours
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-[#203b2a] sm:text-4xl lg:text-[42px]">
                {tour.title}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 shrink-0"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                {location}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveTour}
              disabled={!initialized || saveLoading}
              aria-label={
                isSaved ? "Remove from saved tours" : "Save tour"
              }
              aria-pressed={isSaved}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#203b2a] transition hover:border-[#245b3b] hover:bg-[#f7faf7] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill={isSaved ? "#245b3b" : "none"}
                stroke={isSaved ? "#245b3b" : "currentColor"}
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>

              {saveLoading
                ? "Updating..."
                : isSaved
                  ? "Saved"
                  : "Save tour"}
            </button>
          </div>

          {saveMessage && (
            <p className="mt-3 text-sm text-[#477b5b]" role="status">
              {saveMessage}
            </p>
          )}
        </section>

        {/* Photo gallery */}
        <section aria-label="Tour photos">
          {photos.length > 0 ? (
            <div
              className={`grid gap-2 overflow-hidden rounded-2xl ${
                photos.length === 1
                  ? "grid-cols-1"
                  : photos.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : photos.length === 3
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {photos.slice(0, 5).map((photo, index) => {
                const isLastVisible = index === 4;
                const extraImages = photos.length - 5;

                const imageLayout =
                  photos.length === 1
                    ? "aspect-[16/7]"
                    : photos.length === 2
                      ? "aspect-[4/3]"
                      : photos.length === 3
                        ? index === 0
                          ? "aspect-[4/3] sm:row-span-2 sm:aspect-auto"
                          : "aspect-[4/3]"
                        : index === 0
                          ? "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[420px]"
                          : "aspect-[4/3]";

                return (
                  <button
                    key={photo._id || photo.publicId || index}
                    type="button"
                    onClick={() => openImage(index)}
                    aria-label={`View image ${index + 1} of ${photos.length}`}
                    className={`group relative block w-full overflow-hidden bg-gray-100 text-left ${imageLayout}`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt || tour.title}
                      fill
                      unoptimized
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes={
                        index === 0
                          ? "(max-width: 640px) 100vw, 50vw"
                          : "(max-width: 1024px) 50vw, 25vw"
                      }
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    />

                    <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                    {isLastVisible && extraImages > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white transition group-hover:bg-black/65">
                        <span className="text-center">
                          <span className="block text-3xl font-semibold">
                            +{extraImages}
                          </span>

                          <span className="mt-1 block text-sm font-medium">
                            View all photos
                          </span>
                        </span>
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                      View photo
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400">
              No images available
            </div>
          )}

          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => openImage(0)}
              className="mt-3 text-xs font-semibold text-[#477b5b] transition hover:text-[#245b3b]"
            >
              View all {photos.length} photos →
            </button>
          )}
        </section>

        {/* Main content */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="min-w-0">
            {/* About */}
            <section className="border-b border-gray-100 pb-9">
              <h2 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                About this experience
              </h2>

              <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-gray-600">
                {tour.description}
              </p>
            </section>

            {/* Highlights */}
            {tour.highlights.length > 0 && (
              <section className="border-b border-gray-100 py-9">
                <h2 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                  Experience highlights
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {tour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf5ef] text-sm text-[#245b3b]">
                        ✓
                      </span>

                      <p className="pt-1 text-sm leading-6 text-gray-600">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {tour.itinerary.length > 0 && (
              <section className="border-b border-gray-100 py-9">
                <h2 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                  Your itinerary
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Here's what you can expect during your experience.
                </p>

                <div className="mt-7 space-y-7">
                  {tour.itinerary.map((item, index) => (
                    <div key={index} className="flex gap-5">
                      <div className="flex flex-col items-center">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf5ef] text-sm font-semibold text-[#245b3b]">
                          {index + 1}
                        </span>

                        {index !== tour.itinerary.length - 1 && (
                          <div className="mt-2 h-full w-px bg-gray-200" />
                        )}
                      </div>

                      <div className="pb-2">
                        <h3 className="text-base font-semibold text-[#203b2a]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-7 text-gray-600">
                          {item.description}
                        </p>

                        <p className="mt-3 text-xs font-medium text-[#477b5b]">
                          Duration: {item.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inclusions and exclusions */}
            <section className="border-b border-gray-100 py-9">
              <h2 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                What's included
              </h2>

              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#203b2a]">
                    Included
                  </h3>

                  <ul className="mt-4 space-y-3">
                    {tour.inclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <span className="text-[#477b5b]">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#203b2a]">
                    Not included
                  </h3>

                  <ul className="mt-4 space-y-3">
                    {tour.exclusions.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <span className="text-gray-400">–</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Meeting point */}
            <section className="border-b border-gray-100 py-9">
              <h2 className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                Where you'll meet
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                {tour.meetingPoint}
              </p>

              <div className="mt-5 rounded-xl bg-[#f7faf7] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#477b5b]">
                  Location
                </p>

                <p className="mt-2 text-sm leading-6 text-[#203b2a]">
                  {tour.destination.address}
                </p>
              </div>
            </section>
          </div>

          {/* Booking panel */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:p-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-[#203b2a]">
                    {formatPrice(
                      tour.price.amount,
                      tour.price.currency
                    )}
                  </span>

                  <span className="text-sm text-gray-500">
                    / person
                  </span>
                </div>

                {/* Date selection */}
                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#203b2a]">
                        Choose your date
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Select your preferred departure
                      </p>
                    </div>

                    {!availabilityLoading && (
                      <span className="rounded-full bg-[#edf5ef] px-3 py-1 text-xs font-semibold text-[#245b3b]">
                        {slots.length}{" "}
                        {slots.length === 1 ? "date" : "dates"}
                      </span>
                    )}
                  </div>

                  {availabilityLoading ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="h-28 animate-pulse rounded-xl bg-gray-100"
                        />
                      ))}
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {slots.map((slot) => {
                        const isSelected =
                          selectedAvailabilityId === slot._id;

                        const seatsLeft = Math.max(
                          0,
                          slot.capacity - slot.bookedCount
                        );

                        const date = new Date(slot.startTime);

                        return (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() =>
                              handleAvailabilityChange(slot._id)
                            }
                            aria-pressed={isSelected}
                            className={`relative rounded-xl border p-3 text-left transition duration-200 ${
                              isSelected
                                ? "border-[#245b3b] bg-[#edf5ef] ring-1 ring-[#245b3b]"
                                : "border-gray-200 bg-white hover:border-[#9bbba3] hover:bg-[#f8fbf8]"
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#245b3b] text-xs text-white">
                                ✓
                              </span>
                            )}

                            <p
                              className={`text-xs font-medium ${
                                isSelected
                                  ? "text-[#477b5b]"
                                  : "text-gray-500"
                              }`}
                            >
                              {date.toLocaleDateString("en-IN", {
                                weekday: "short",
                              })}
                            </p>

                            <p className="mt-1 text-2xl font-bold tracking-tight text-[#203b2a]">
                              {date.getDate()}
                            </p>

                            <p className="text-xs font-medium text-gray-500">
                              {date.toLocaleDateString("en-IN", {
                                month: "short",
                                year: "numeric",
                              })}
                            </p>

                            <div className="mt-3 border-t border-gray-200/80 pt-2">
                              <p className="text-xs font-medium text-[#203b2a]">
                                {formatTime(slot.startTime)}
                              </p>

                              <p
                                className={`mt-1 text-[11px] font-medium ${
                                  seatsLeft <= 3
                                    ? "text-orange-600"
                                    : "text-[#477b5b]"
                                }`}
                              >
                                {seatsLeft}{" "}
                                {seatsLeft === 1 ? "seat" : "seats"} left
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-[#f8faf8] px-4 py-7 text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5ef] text-[#477b5b]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="h-5 w-5"
                        >
                          <rect x="3" y="5" width="18" height="16" rx="2" />
                          <path d="M16 3v4M8 3v4M3 10h18" />
                        </svg>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-[#203b2a]">
                        No upcoming departures
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        New dates will appear here when they become available.
                      </p>
                    </div>
                  )}

                  {selectedSlot && (
                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f7faf7] p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#edf5ef] text-[#245b3b]">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-5 w-5"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">
                          Your selected departure
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#203b2a]">
                          {formatDate(selectedSlot.startTime)}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatTime(selectedSlot.startTime)} –{" "}
                          {formatTime(selectedSlot.endTime)}
                        </p>
                      </div>

                      <span className="ml-auto shrink-0 text-xs font-semibold text-[#245b3b]">
                        Selected ✓
                      </span>
                    </div>
                  )}
                </div>

                {/* Booking participants */}
                <div className="mt-5 rounded-xl border border-gray-200 p-3">
                  <label
                    htmlFor="participants"
                    className="block text-xs font-bold uppercase tracking-wide text-[#203b2a]"
                  >
                    Number of guests
                  </label>

                  <select
                    id="participants"
                    value={participants}
                    onChange={(event) =>
                      handleParticipantsChange(Number(event.target.value))
                    }
                    disabled={!selectedSlot || remainingSeats === 0}
                    className="mt-2 w-full bg-white text-sm text-gray-700 outline-none disabled:text-gray-400"
                  >
                    {Array.from(
                      { length: remainingSeats },
                      (_, index) => index + 1
                    ).map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>

                  {selectedSlot && (
                    <p className="mt-2 text-xs text-gray-500">
                      {remainingSeats} seats available for this departure
                    </p>
                  )}
                </div>

                {/* Booking price */}
                {selectedSlot && (
                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="flex justify-between gap-3 text-sm text-gray-600">
                      <span>
                        {formatPrice(
                          pricePerParticipant,
                          tour.price.currency
                        )}{" "}
                        × {participants}{" "}
                        {participants === 1 ? "guest" : "guests"}
                      </span>

                      <span className="font-medium text-[#203b2a]">
                        {formatPrice(totalPrice, tour.price.currency)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-semibold text-[#203b2a]">
                        Total
                      </span>

                      <span className="text-xl font-bold text-[#245b3b]">
                        {formatPrice(totalPrice, tour.price.currency)}
                      </span>
                    </div>
                  </div>
                )}

                {!initialized && (
                  <div className="mt-4 rounded-lg bg-[#f7faf7] p-3 text-center">
                    <p className="text-sm text-gray-500">
                      Checking your account...
                    </p>
                  </div>
                )}

                {availabilityError && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {availabilityError}
                  </p>
                )}

                {bookingError && (
                  <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {bookingError}
                  </p>
                )}

                {/* Guest login */}
                {isGuest && (
                  <Link
                    href="/login"
                    className="mt-5 block w-full rounded-full bg-[#245b3b] px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#19452d]"
                  >
                    Login to book
                  </Link>
                )}

                {/* Restricted accounts */}
                {isRestrictedUser && (
                  <p className="mt-4 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                    Only traveler accounts can book this experience. Your{" "}
                    {user?.role} account cannot create bookings.
                  </p>
                )}

                {/* Booking success */}
                {successMessage && createdBooking && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
                    <p className="text-sm font-semibold text-green-800">
                      Booking request submitted!
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-700">
                      {successMessage}
                    </p>

                    <p className="mt-2 text-xs font-medium text-green-800">
                      Booking status: {createdBooking.status}
                    </p>

                    <Link
                      href="/my-bookings"
                      className="mt-3 inline-flex text-sm font-semibold text-[#245b3b] underline underline-offset-4"
                    >
                      View my bookings →
                    </Link>
                  </div>
                )}

                {/* Booking button */}
                {canBook && (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={
                      bookingLoading ||
                      availabilityLoading ||
                      !selectedSlot ||
                      remainingSeats === 0 ||
                      participants > remainingSeats
                    }
                    className="mt-5 w-full rounded-full bg-[#245b3b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19452d] disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {bookingLoading
                      ? "Submitting..."
                      : !selectedSlot
                        ? "Select a date first"
                        : "Book now"}
                  </button>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                  No payment required now. Your booking is submitted for confirmation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Full-screen image viewer */}
      {activePhoto && activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 px-3 py-6 sm:px-8"
          onClick={() => setActiveImageIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Tour photo viewer"
        >
          <button
            type="button"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ×
          </button>

          <div className="absolute left-4 top-5 z-20 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            {activeImageIndex + 1} / {photos.length}
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              aria-label="Previous image"
              className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-8"
            >
              ‹
            </button>
          )}

          <div
            className="relative h-[75vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={activePhoto.url}
              src={activePhoto.url}
              alt={activePhoto.alt || tour.title}
              fill
              unoptimized
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {photos.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              aria-label="Next image"
              className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-8"
            >
              ›
            </button>
          )}

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center text-xs text-white/70">
            {activePhoto.alt || tour.title}
          </p>
        </div>
      )}

      {/* Guest save modal */}
      {showSaveModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-tour-title"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ef] text-[#245b3b]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
              </svg>
            </div>

            <h2
              id="save-tour-title"
              className="mt-4 text-center text-xl font-semibold text-[#203b2a]"
            >
              Save this experience
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Login or create a traveler account to save tours and find
              them later.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/login"
                className="block w-full rounded-full bg-[#245b3b] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#19452d]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="block w-full rounded-full border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-[#203b2a] transition hover:bg-gray-50"
              >
                Create account
              </Link>

              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="w-full rounded-full px-5 py-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TourDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />

            <div className="mt-8 h-80 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </main>
      }
    >
      <TourDetailsContent />
    </Suspense>
  );
}
