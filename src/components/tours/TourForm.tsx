
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import * as yup from "yup";

import { addTourSchema } from "@/lib/validation";
import type { AddTourFormValues } from "@/lib/validation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  createTour,
  updateTour,
  getManagedTourById,
  clearTourError,
  clearSelectedTour,
} from "@/redux/slices/tourSlice";

import type {
  TourActivityType,
  TourPhoto,
  TourStatus,
} from "@/types/tour.type";

type TourFormProps = {
  mode?: "add" | "edit";
};

type TourSubmitStatus = "draft" | "published";

const initialValues: AddTourFormValues = {
  title: "",
  description: "",
  destination: {
    country: "India",
    state: "",
    city: "",
    address: "",
  },
  activityType: "adventure",
  durationHours: 1,
  meetingPoint: "",
  highlights: [],
  itinerary: [],
  inclusions: [],
  exclusions: [],
  price: {
    amount: 0,
    currency: "INR",
  },
  cancellationPolicy: {
    freeCancellationHours: 168,
    partialRefundHours: 72,
    partialRefundPercentage: 50,
    lateCancellationRefundPercentage: 0,
    operatorCancellationRefundPercentage: 100,
    noShowRefundPercentage: 0,
  },
};

const activities: {
  value: TourActivityType;
  label: string;
}[] = [
  { value: "adventure", label: "Adventure" },
  { value: "nature", label: "Nature" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "water", label: "Water activities" },
  { value: "wildlife", label: "Wildlife" },
  { value: "other", label: "Other" },
];

const inputClass =
  "mt-2 w-full rounded-lg border border-[#dce9df] bg-white px-3.5 py-3 text-sm text-[#183E13] outline-none transition placeholder:text-[#91a195] hover:border-[#b8d0bd] focus:border-[#1F5219] focus:ring-2 focus:ring-[#1F5219]/10";

const labelClass = "text-sm font-medium text-[#183E13]";

const sectionClass =
  "rounded-xl border border-[#e3ece5] bg-white p-5 sm:p-6";

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={sectionClass}>
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#edf5ee] text-xs font-semibold text-[#245E1D]">
          {number}
        </span>

        <div>
          <h2 className="text-base font-semibold text-[#183E13]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm leading-5 text-[#718275]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 text-xs font-medium leading-5 text-red-600">
      {children}
    </p>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

function formatErrorPath(path: string) {
  const labels: Record<string, string> = {
    title: "Tour title",
    description: "Tour description",
    activityType: "Category",
    durationHours: "Duration",
    meetingPoint: "Meeting point",
    "destination.country": "Country",
    "destination.state": "State",
    "destination.city": "City",
    "destination.address": "Full address",
    "price.amount": "Price",
    itinerary: "Itinerary",
  };

  if (labels[path]) return labels[path];

  const itineraryMatch = path.match(
    /itinerary\[(\d+)\]\.(title|description|duration)/
  );

  if (itineraryMatch) {
    const step = Number(itineraryMatch[1]) + 1;
    const field = itineraryMatch[2];

    return `Itinerary step ${step}: ${field}`;
  }

  return path;
}

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${Number(amount) || 0}`;
  }
}

export default function TourForm({ mode = "add" }: TourFormProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const params = useParams<{ tourId: string }>();
  const tourId = mode === "edit" ? params.tourId : undefined;

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const { isSavingTour, isLoadingTour, error } = useAppSelector(
    (state) => state.tours
  );

  const [mounted, setMounted] = useState(false);

  const [values, setValues] =
    useState<AddTourFormValues>(initialValues);

  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<TourPhoto[]>([]);

  const [currentStatus, setCurrentStatus] =
    useState<TourStatus>("draft");

  const [isTourLoaded, setIsTourLoaded] = useState(mode === "add");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [photoError, setPhotoError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const photoPreviews = useMemo(
    () => photos.map((photo) => URL.createObjectURL(photo)),
    [photos]
  );

  const totalPhotos = existingPhotos.length + photos.length;

  const validationErrors = Object.entries(fieldErrors);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Release temporary image preview URLs.
  useEffect(() => {
    return () => {
      photoPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  // Authentication and permission check.
  useEffect(() => {
    if (!mounted || !initialized) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin" && user.role !== "operator") {
      router.replace("/");
    }
  }, [mounted, initialized, isAuthenticated, user, router]);

  // Load existing tour in edit mode.
  useEffect(() => {
    if (
      !mounted ||
      !initialized ||
      !isAuthenticated ||
      !user ||
      (user.role !== "admin" && user.role !== "operator") ||
      mode !== "edit" ||
      !tourId
    ) {
      return;
    }

    let cancelled = false;

    setIsTourLoaded(false);
    setLoadError(null);

    dispatch(getManagedTourById(tourId))
      .unwrap()
      .then((tour) => {
        if (cancelled) return;

        setValues({
          title: tour.title,
          description: tour.description,
          destination: {
            country: tour.destination.country,
            state: tour.destination.state,
            city: tour.destination.city,
            address: tour.destination.address,
          },
          activityType: tour.activityType,
          durationHours: tour.durationHours,
          meetingPoint: tour.meetingPoint,
          highlights: [...tour.highlights],
          itinerary: tour.itinerary.map((item) => ({
            title: item.title,
            description: item.description,
            duration: item.duration,
          })),
          inclusions: [...tour.inclusions],
          exclusions: [...tour.exclusions],
          price: {
            amount: tour.price.amount,
            currency: tour.price.currency,
          },
          cancellationPolicy: {
            ...tour.cancellationPolicy,
          },
        });

        setExistingPhotos(tour.photos || []);
        setCurrentStatus(tour.status);
        setIsTourLoaded(true);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setIsTourLoaded(false);
          setLoadError(
            typeof loadError === "string"
              ? loadError
              : "Unable to load this tour. Please try again."
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    mounted,
    initialized,
    isAuthenticated,
    user,
    mode,
    tourId,
    dispatch,
  ]);

  useEffect(() => {
    return () => {
      dispatch(clearTourError());
      dispatch(clearSelectedTour());
    };
  }, [dispatch]);

  const clearFieldError = (path: string) => {
    setFieldErrors((current) => {
      if (!current[path]) return current;

      const next = { ...current };
      delete next[path];
      return next;
    });

    setSubmitError("");
  };

  const updateValue = <K extends keyof AddTourFormValues>(
    key: K,
    value: AddTourFormValues[K]
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    clearFieldError(String(key));
  };

  const updateDestination = (
    key: keyof AddTourFormValues["destination"],
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      destination: {
        ...current.destination,
        [key]: value,
      },
    }));

    clearFieldError(`destination.${key}`);
  };

  const updatePrice = (
    key: keyof AddTourFormValues["price"],
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      price: {
        ...current.price,
        [key]:
          key === "amount"
            ? value === ""
              ? ("" as unknown as number)
              : Number(value)
            : value,
      },
    }));

    clearFieldError(`price.${key}`);
  };

  // Handle new photo uploads.
  const handlePhotosChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);

    setPhotoError("");

    if (selectedFiles.length + totalPhotos > 20) {
      setPhotoError("You can upload a maximum of 20 photos.");
      event.target.value = "";
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalidFile = selectedFiles.find(
      (file) =>
        !validTypes.includes(file.type) ||
        file.size > 5 * 1024 * 1024
    );

    if (invalidFile) {
      setPhotoError(
        "Please select JPEG, PNG or WebP images. Each image must be smaller than 5 MB."
      );
      event.target.value = "";
      return;
    }

    setPhotos((current) => [...current, ...selectedFiles]);
    event.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((current) =>
      current.filter((_, photoIndex) => photoIndex !== index)
    );
  };

  const updateItinerary = (
    index: number,
    field: "title" | "description" | "duration",
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      itinerary: current.itinerary.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      ),
    }));

    clearFieldError(`itinerary[${index}].${field}`);
    clearFieldError("itinerary");
  };

  const addItineraryStep = () => {
    if (values.itinerary.length >= 50) return;

    setValues((current) => ({
      ...current,
      itinerary: [
        ...current.itinerary,
        {
          title: "",
          description: "",
          duration: "",
        },
      ],
    }));

    clearFieldError("itinerary");
  };

  const removeItineraryStep = (index: number) => {
    setValues((current) => ({
      ...current,
      itinerary: current.itinerary.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));

    clearFieldError("itinerary");
  };

  const updateListField = (
    key: "highlights" | "inclusions" | "exclusions",
    value: string
  ) => {
    updateValue(
      key,
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  };

  const buildFormData = (
    validatedValues: AddTourFormValues,
    status?: TourSubmitStatus
  ) => {
    const formData = new FormData();

    formData.append("title", validatedValues.title);
    formData.append("description", validatedValues.description);
    formData.append("activityType", validatedValues.activityType);
    formData.append(
      "durationHours",
      String(validatedValues.durationHours)
    );
    formData.append("meetingPoint", validatedValues.meetingPoint);

    formData.append(
      "destination",
      JSON.stringify(validatedValues.destination)
    );

    formData.append(
      "highlights",
      JSON.stringify(validatedValues.highlights)
    );

    formData.append(
      "itinerary",
      JSON.stringify(validatedValues.itinerary)
    );

    formData.append(
      "inclusions",
      JSON.stringify(validatedValues.inclusions)
    );

    formData.append(
      "exclusions",
      JSON.stringify(validatedValues.exclusions)
    );

    formData.append("price", JSON.stringify(validatedValues.price));

    formData.append(
      "cancellationPolicy",
      JSON.stringify(validatedValues.cancellationPolicy)
    );

    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    if (mode === "add" && status) {
      formData.append("status", status);
    }

    return formData;
  };

  const handleSubmit = async (status?: TourSubmitStatus) => {
    setFieldErrors({});
    setPhotoError("");
    setSubmitError("");

    let validatedValues: AddTourFormValues;

    try {
      validatedValues = await addTourSchema.validate(values, {
        abortEarly: false,
      });
    } catch (validationError) {
      if (validationError instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};

        validationError.inner.forEach((item) => {
          if (item.path && !errors[item.path]) {
            errors[item.path] = item.message;
          }
        });

        setFieldErrors(errors);

        requestAnimationFrame(() => {
          errorSummaryRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }

      return;
    }

    const finalStatus =
      mode === "edit"
        ? currentStatus
        : status || "draft";

    const extraErrors: Record<string, string> = {};

    if (
      finalStatus === "published" &&
      totalPhotos === 0
    ) {
      setPhotoError("Add at least one photo before publishing.");
    }

    if (
      finalStatus === "published" &&
      validatedValues.itinerary.length === 0
    ) {
      extraErrors.itinerary =
        "Add at least one itinerary step before publishing.";
    }

    if (
      finalStatus === "published" &&
      (totalPhotos === 0 || Object.keys(extraErrors).length > 0)
    ) {
      setFieldErrors(extraErrors);

      requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });

      return;
    }

    const formData = buildFormData(validatedValues, status);

    try {
      if (mode === "edit" && tourId) {
        await dispatch(
          updateTour({
            tourId,
            formData,
          })
        ).unwrap();
      } else {
        await dispatch(createTour(formData)).unwrap();
      }

      router.push(
        user?.role === "admin"
          ? "/admin/tours"
          : "/operator/tours"
      );
    } catch {
      setSubmitError(
        "We couldn't save your tour. Please check the error message and try again."
      );
    }
  };

  const backToTours = () => {
    router.push(
      user?.role === "admin"
        ? "/admin/tours"
        : "/operator/tours"
    );
  };

  if (
    !mounted ||
    !initialized ||
    !isAuthenticated ||
    !user ||
    !["admin", "operator"].includes(user.role)
  ) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm text-[#66806d]">
          Checking access...
        </p>
      </main>
    );
  }

  if (mode === "edit" && !tourId) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#183E13]">
            Invalid tour
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            The tour ID is missing.
          </p>
          <button
            type="button"
            onClick={backToTours}
            className="mt-4 rounded-lg bg-[#1F5219] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to tours
          </button>
        </div>
      </main>
    );
  }

  if (mode === "edit" && loadError) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold text-[#183E13]">
            Unable to load tour
          </h2>
          <p className="mt-2 text-sm text-gray-500">{loadError}</p>
          <button
            type="button"
            onClick={backToTours}
            className="mt-5 rounded-lg bg-[#1F5219] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to tours
          </button>
        </div>
      </main>
    );
  }

  if (mode === "edit" && (!isTourLoaded || isLoadingTour)) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white">
        <p className="text-sm text-[#66806d]">
          Loading tour details...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8faf8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#66806d]">
            Tour Management / {mode === "edit" ? "Edit Tour" : "New Tour"}
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-[#122F0E] sm:text-3xl">
            {mode === "edit" ? "Edit Tour" : "Create New Tour"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718275]">
            {mode === "edit"
              ? "Update your tour information and details."
              : "Add the information travelers need to understand and book your tour."}
          </p>
        </div>

        {(error || submitError) && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          >
            {submitError || error}
          </div>
        )}

        <div className="space-y-5">
          {/* 01 Photos */}
          <Section
            number="01"
            title="Tour Photos"
            description="Upload clear photos that show travelers what they can expect."
          >
            <label
              htmlFor="tour-photos"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c9ddce] bg-[#fbfdfb] px-5 py-8 text-center transition hover:border-[#1F5219] hover:bg-[#f5faf5]"
            >
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf5ee] text-[#245E1D]">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                  <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
                </svg>
              </span>

              <span className="text-sm font-semibold text-[#183E13]">
                Choose photos from your device
              </span>

              <span className="mt-1.5 text-xs text-[#718275]">
                Select multiple images at once
              </span>

              <span className="mt-3 text-xs text-[#91a195]">
                JPEG, PNG or WebP · Maximum 5 MB each · Up to 20 photos
              </span>

              <input
                id="tour-photos"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={handlePhotosChange}
              />
            </label>

            {photoError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {photoError}
              </p>
            )}

            {existingPhotos.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#183E13]">
                    Existing photos
                  </h3>
                  <span className="text-xs text-[#718275]">
                    {existingPhotos.length} photos
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {existingPhotos.map((photo, index) => (
                    <div
                      key={photo._id || photo.publicId || index}
                      className="overflow-hidden rounded-lg border border-[#e3ece5] bg-white"
                    >
                      <img
                        src={photo.url}
                        alt={photo.alt || `Tour photo ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <p className="truncate px-2.5 py-2 text-xs text-[#718275]">
                        Saved photo {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {photos.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#183E13]">
                    Selected photos
                  </h3>
                  <span className="text-xs text-[#718275]">
                    {totalPhotos}/20 photos
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {photos.map((photo, index) => (
                    <div
                      key={`${photo.name}-${index}`}
                      className="overflow-hidden rounded-lg border border-[#e3ece5] bg-white"
                    >
                      <img
                        src={photoPreviews[index]}
                        alt={photo.name}
                        className="h-32 w-full object-cover"
                      />

                      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                        <span className="min-w-0 truncate text-xs text-[#718275]">
                          {photo.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          aria-label={`Remove ${photo.name}`}
                          className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-[#91a195]">
              {totalPhotos} of 20 photos selected.
              {mode === "edit" &&
                " Existing photos will be kept when you save changes."}
            </p>
          </Section>

          {/* 02 Basic information */}
          <Section
            number="02"
            title="Basic Information"
            description="Give your tour a clear name and description."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Tour title" error={fieldErrors.title}>
                <input
                  className={inputClass}
                  maxLength={120}
                  placeholder="e.g. Munnar Hills and Tea Garden Experience"
                  value={values.title}
                  onChange={(event) =>
                    updateValue("title", event.target.value)
                  }
                />
                <p className="mt-1 text-right text-xs text-[#91a195]">
                  {values.title.length}/120
                </p>
              </Field>

              <Field
                label="Category"
                error={fieldErrors.activityType}
              >
                <select
                  className={inputClass}
                  value={values.activityType}
                  onChange={(event) =>
                    updateValue(
                      "activityType",
                      event.target.value as TourActivityType
                    )
                  }
                >
                  {activities.map((activity) => (
                    <option key={activity.value} value={activity.value}>
                      {activity.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field
                  label="Tour description"
                  error={fieldErrors.description}
                >
                  <textarea
                    className={inputClass}
                    rows={4}
                    placeholder="Describe the experience, what travelers will do, and what makes this tour special."
                    value={values.description}
                    onChange={(event) =>
                      updateValue("description", event.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* 03 Location */}
          <Section
            number="03"
            title="Location and Meeting Point"
            description="Tell travelers where the tour takes place and where they should meet."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Country"
                error={fieldErrors["destination.country"]}
              >
                <input
                  className={inputClass}
                  placeholder="India"
                  value={values.destination.country}
                  onChange={(event) =>
                    updateDestination("country", event.target.value)
                  }
                />
              </Field>

              <Field
                label="State"
                error={fieldErrors["destination.state"]}
              >
                <input
                  className={inputClass}
                  placeholder="e.g. Kerala"
                  value={values.destination.state}
                  onChange={(event) =>
                    updateDestination("state", event.target.value)
                  }
                />
              </Field>

              <Field
                label="City or destination"
                error={fieldErrors["destination.city"]}
              >
                <input
                  className={inputClass}
                  placeholder="e.g. Munnar"
                  value={values.destination.city}
                  onChange={(event) =>
                    updateDestination("city", event.target.value)
                  }
                />
              </Field>

              <Field
                label="Full address"
                error={fieldErrors["destination.address"]}
              >
                <input
                  className={inputClass}
                  placeholder="Tour location or full address"
                  value={values.destination.address}
                  onChange={(event) =>
                    updateDestination("address", event.target.value)
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Meeting point"
                  error={fieldErrors.meetingPoint}
                >
                  <input
                    className={inputClass}
                    placeholder="e.g. Main entrance of Munnar town"
                    value={values.meetingPoint}
                    onChange={(event) =>
                      updateValue("meetingPoint", event.target.value)
                    }
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* 04 Duration and pricing */}
          <Section
            number="04"
            title="Duration and Pricing"
            description="Set the length of the experience and the price per participant."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Duration in hours"
                error={fieldErrors.durationHours}
              >
                <input
                  type="number"
                  min="0.5"
                  max="720"
                  step="0.5"
                  className={inputClass}
                  value={values.durationHours}
                  onChange={(event) =>
                    updateValue(
                      "durationHours",
                      Number(event.target.value)
                    )
                  }
                />
              </Field>

              <Field
                label="Price per participant"
                error={fieldErrors["price.amount"]}
              >
                <div className="mt-2 flex overflow-hidden rounded-lg border border-[#dce9df] bg-white focus-within:border-[#1F5219] focus-within:ring-2 focus-within:ring-[#1F5219]/10">
                  <select
                    aria-label="Currency"
                    className="border-r border-[#dce9df] bg-[#f8faf8] px-3 text-sm text-[#183E13] outline-none"
                    value={values.price.currency}
                    onChange={(event) =>
                      updatePrice(
                        "currency",
                        event.target.value
                      )
                    }
                  >
                    <option value="INR">INR ₹</option>
                    <option value="USD">USD $</option>
                    <option value="EUR">EUR €</option>
                    <option value="GBP">GBP £</option>
                    <option value="AED">AED</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full min-w-0 px-3 py-3 text-sm text-[#183E13] outline-none"
                    placeholder="Enter price"
                    value={values.price.amount}
                    onChange={(event) =>
                      updatePrice("amount", event.target.value)
                    }
                  />
                </div>
              </Field>
            </div>
          </Section>

          {/* 05 Highlights and itinerary */}
          <Section
            number="05"
            title="Highlights and Itinerary"
            description="Explain what travelers will experience during the tour."
          >
            <Field
              label="Tour highlights"
              error={fieldErrors.highlights}
            >
              <textarea
                className={inputClass}
                rows={3}
                placeholder={"Tea garden visit\nScenic viewpoints\nLocal food experience"}
                value={values.highlights.join("\n")}
                onChange={(event) =>
                  updateListField("highlights", event.target.value)
                }
              />
              <p className="mt-1 text-xs text-[#91a195]">
                Add one highlight per line.
              </p>
            </Field>

            <div className="mt-6 border-t border-[#e8f0e9] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[#183E13]">
                    Itinerary
                  </h3>
                  <p className="mt-1 text-xs text-[#718275]">
                    Add activities in the order they happen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItineraryStep}
                  disabled={values.itinerary.length >= 50}
                  className="rounded-lg border border-[#c9ddce] px-3.5 py-2.5 text-xs font-semibold text-[#1F5219] transition hover:bg-[#f5faf5] disabled:opacity-50"
                >
                  Add itinerary step
                </button>
              </div>

              <FieldError>{fieldErrors.itinerary}</FieldError>

              <div className="mt-4 space-y-4">
                {values.itinerary.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-[#e3ece5] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[#183E13]">
                        Step {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() => removeItineraryStep(index)}
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field
                        label="Activity title"
                        error={
                          fieldErrors[
                            `itinerary[${index}].title`
                          ]
                        }
                      >
                        <input
                          className={inputClass}
                          placeholder="e.g. Tea garden visit"
                          value={item.title}
                          onChange={(event) =>
                            updateItinerary(
                              index,
                              "title",
                              event.target.value
                            )
                          }
                        />
                      </Field>

                      <Field
                        label="Duration"
                        error={
                          fieldErrors[
                            `itinerary[${index}].duration`
                          ]
                        }
                      >
                        <input
                          className={inputClass}
                          placeholder="e.g. 1 hour"
                          value={item.duration}
                          onChange={(event) =>
                            updateItinerary(
                              index,
                              "duration",
                              event.target.value
                            )
                          }
                        />
                      </Field>

                      <div className="md:col-span-2">
                        <Field
                          label="Activity description"
                          error={
                            fieldErrors[
                              `itinerary[${index}].description`
                            ]
                          }
                        >
                          <textarea
                            className={inputClass}
                            rows={2}
                            placeholder="Explain what travelers will do during this activity."
                            value={item.description}
                            onChange={(event) =>
                              updateItinerary(
                                index,
                                "description",
                                event.target.value
                              )
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}

                {values.itinerary.length === 0 && (
                  <div className="rounded-lg border border-dashed border-[#c9ddce] px-4 py-7 text-center">
                    <p className="text-sm text-[#718275]">
                      No itinerary steps added yet.
                    </p>
                    <p className="mt-1 text-xs text-[#91a195]">
                      Add activities to explain the tour schedule.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* 06 Inclusions and exclusions */}
          <Section
            number="06"
            title="Inclusions and Exclusions"
            description="Clearly explain what is included in the tour price."
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="What's included"
                error={fieldErrors.inclusions}
              >
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder={"Guide service\nEntry tickets\nTransportation"}
                  value={values.inclusions.join("\n")}
                  onChange={(event) =>
                    updateListField("inclusions", event.target.value)
                  }
                />
                <p className="mt-1 text-xs text-[#91a195]">
                  Add one item per line.
                </p>
              </Field>

              <Field
                label="What's not included"
                error={fieldErrors.exclusions}
              >
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder={"Personal expenses\nMeals not mentioned"}
                  value={values.exclusions.join("\n")}
                  onChange={(event) =>
                    updateListField("exclusions", event.target.value)
                  }
                />
                <p className="mt-1 text-xs text-[#91a195]">
                  Add one item per line.
                </p>
              </Field>
            </div>
          </Section>

          {/* 07 Cancellation policy */}
          <Section
            number="07"
            title="Cancellation Policy"
            description="Set the refund rules for cancellations and no-shows."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  [
                    "freeCancellationHours",
                    "Free cancellation window",
                    "Hours",
                  ],
                  [
                    "partialRefundHours",
                    "Partial refund window",
                    "Hours",
                  ],
                  [
                    "partialRefundPercentage",
                    "Partial refund",
                    "%",
                  ],
                  [
                    "lateCancellationRefundPercentage",
                    "Late cancellation refund",
                    "%",
                  ],
                  [
                    "operatorCancellationRefundPercentage",
                    "Operator cancellation refund",
                    "%",
                  ],
                  [
                    "noShowRefundPercentage",
                    "No-show refund",
                    "%",
                  ],
                ] as const
              ).map(([key, label, suffix]) => (
                <Field
                  key={key}
                  label={label}
                  error={fieldErrors[`cancellationPolicy.${key}`]}
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={suffix === "%" ? 100 : undefined}
                      className={`${inputClass} pr-14`}
                      value={values.cancellationPolicy[key]}
                      onChange={(event) => {
                        setValues((current) => ({
                          ...current,
                          cancellationPolicy: {
                            ...current.cancellationPolicy,
                            [key]: Number(event.target.value),
                          },
                        }));

                        clearFieldError(
                          `cancellationPolicy.${key}`
                        );
                      }}
                    />

                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#91a195]">
                      {suffix}
                    </span>
                  </div>
                </Field>
              ))}
            </div>
          </Section>

          {/* Validation summary at the bottom */}
          {(validationErrors.length > 0 ||
            photoError ||
            submitError) && (
            <div
              ref={errorSummaryRef}
              role="alert"
              aria-live="assertive"
              className="rounded-xl border border-red-200 bg-red-50 p-5"
            >
              <h2 className="text-sm font-semibold text-red-800">
                Please check the following before continuing
              </h2>

              <ul className="mt-3 space-y-2">
                {validationErrors.map(([path, message]) => (
                  <li
                    key={path}
                    className="flex items-start gap-2 text-sm text-red-700"
                  >
                    <span className="mt-0.5">•</span>
                    <span>
                      <strong>{formatErrorPath(path)}:</strong>{" "}
                      {message}
                    </span>
                  </li>
                ))}

                {photoError && (
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <span>•</span>
                    <span>{photoError}</span>
                  </li>
                )}

                {submitError && (
                  <li className="flex items-start gap-2 text-sm text-red-700">
                    <span>•</span>
                    <span>{submitError}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 rounded-xl border border-[#e3ece5] bg-white p-4 sm:flex-row sm:justify-between sm:p-5">
            <button
              type="button"
              disabled={isSavingTour}
              onClick={backToTours}
              className="rounded-lg border border-[#dce9df] px-5 py-3 text-sm font-medium text-[#183E13] transition hover:bg-[#f7faf7] disabled:opacity-50"
            >
              Cancel
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {mode === "add" && (
                <button
                  type="button"
                  disabled={isSavingTour}
                  onClick={() => handleSubmit("draft")}
                  className="rounded-lg border border-[#c9ddce] px-5 py-3 text-sm font-semibold text-[#1F5219] transition hover:bg-[#f5faf5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingTour ? "Saving..." : "Save as draft"}
                </button>
              )}

              <button
                type="button"
                disabled={isSavingTour}
                onClick={() =>
                  mode === "add"
                    ? handleSubmit("published")
                    : handleSubmit()
                }
                className="rounded-lg bg-[#1F5219] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#183E13] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingTour
                  ? "Saving..."
                  : mode === "edit"
                    ? "Save changes"
                    : "Publish tour"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
  