
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePhoto,
  clearProfileError,
  clearProfile,
} from "@/redux/slices/profileSlice";

import { ArrowLeft } from "lucide-react";

import {
  logoutUser,
} from "@/redux/slices/authSlice";

import {
  clearMyOperatorApplication,
} from "@/redux/slices/operatorSlice";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    user,
    isAuthenticated,
    initialized,
    logoutLoading,
  } = useAppSelector((state) => state.auth);

  const {
    profile,
    isLoading,
    isUpdating,
    isUploadingPhoto,
    error,
  } = useAppSelector((state) => state.profile);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Load profile information.
  useEffect(() => {
    if (initialized && isAuthenticated) {
      dispatch(getMyProfile());
    }
  }, [dispatch, initialized, isAuthenticated]);

  // Update form fields when profile data changes.
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  // Clean up temporary image preview.
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const currentProfile = profile;

  const displayName = currentProfile?.name || user?.name || "Traveler";
  const displayEmail = currentProfile?.email || user?.email || "";
  const displayRole = currentProfile?.role || user?.role || "traveler";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const roleLabel =
    displayRole.charAt(0).toUpperCase() + displayRole.slice(1);

  const dashboardLinks = [
    ...(displayRole === "traveler"
      ? [
          {
            title: "My Bookings",
            description: "View and manage your tour bookings",
            href: "/my-bookings",
            icon: "▤",
          },
          {
            title: "Saved Tours",
            description: "Explore the tours you have saved",
            href: "/saved-tours",
            icon: "♡",
          },
        ]
      : []),

    ...(displayRole === "operator"
      ? [
          {
            title: "Operator Dashboard",
            description: "Manage your operator account",
            href: "/operator/dashboard",
            icon: "▦",
          },
          {
            title: "My Tours",
            description: "View and manage your tours",
            href: "/operator/tours",
            icon: "⌖",
          },
          {
            title: "Application Status",
            description: "View your operator application",
            href: "/operator/application-status",
            icon: "◷",
          },
        ]
      : []),

    ...(displayRole === "admin"
      ? [
          {
            title: "Admin Dashboard",
            description: "Manage the Traverse platform",
            href: "/admin",
            icon: "▦",
          },
        ]
      : []),
  ];

  const handleEdit = () => {
    setSuccessMessage("");
    setFormError("");
    dispatch(clearProfileError());
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(profile?.name || "");
    setPhone(profile?.phone || "");
    setBio(profile?.bio || "");
    setFormError("");
    setIsEditing(false);
  };

  const handlePhotoSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormError("");
    setSuccessMessage("");
    dispatch(clearProfileError());

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError("Please select a JPEG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Your profile photo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return;

    setFormError("");
    setSuccessMessage("");

    try {
      await dispatch(uploadMyProfilePhoto(selectedPhoto)).unwrap();

      setSelectedPhoto(null);
      setPreviewUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMessage("Profile photo updated successfully.");
    } catch (err) {
      setFormError(
        typeof err === "string"
          ? err
          : "Unable to upload your profile photo."
      );
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }

    if (name.trim().length > 100) {
      setFormError("Name cannot exceed 100 characters.");
      return;
    }

    if (phone.trim().length > 20) {
      setFormError("Phone number cannot exceed 20 characters.");
      return;
    }

    if (bio.trim().length > 300) {
      setFormError("Bio cannot exceed 300 characters.");
      return;
    }

    try {
      await dispatch(
        updateMyProfile({
          name: name.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
        })
      ).unwrap();

      setIsEditing(false);
      setSuccessMessage("Your profile has been updated successfully.");
    } catch (err) {
      setFormError(
        typeof err === "string"
          ? err
          : "Unable to update your profile."
      );
    }
  };

  // Logout after confirmation.
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      dispatch(clearProfile());
      dispatch(clearMyOperatorApplication());

      setLogoutModalOpen(false);

      router.replace("/login");
    } catch {
      setFormError("Unable to log out. Please try again.");
      setLogoutModalOpen(false);
    }
  };

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6]">
        <p className="text-sm text-gray-500">
          Checking your account...
        </p>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9f6] px-5">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-2xl text-green-700">
            ♙
          </div>

          <h1 className="text-2xl font-semibold text-gray-900">
            Your profile
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Please sign in to view and manage your Traverse account.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const photoSource =
    previewUrl || currentProfile?.profilePhoto || "";

  return (
    <main className="min-h-screen bg-[#f7f9f6] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <div className="mb-8">
        <Link
  href="/tours"
  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
>
  <ArrowLeft size={17} strokeWidth={1.8} />
  Back to tours
</Link>
          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">
              Your account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your personal information and account activities.
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        {error && !formError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => dispatch(getMyProfile())}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && !currentProfile ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <p className="text-sm text-gray-500">
              Loading your profile...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-4">
              {/* Profile Card */}
              <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="h-24 bg-[#e7f0e6]" />

                <div className="px-6 pb-6">
                  <div className="-mt-12 flex items-end justify-between">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-green-100 text-2xl font-bold text-green-800">
                      {photoSource ? (
                        <Image
                          src={photoSource}
                          alt={displayName}
                          width={96}
                          height={96}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials || "U"
                      )}
                    </div>

                    <span className="mb-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                      {roleLabel}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {displayName}
                  </h2>

                  <p className="mt-1 break-all text-sm text-gray-500">
                    {displayEmail}
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelection}
                    className="hidden"
                  />

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full rounded-xl border border-green-700 px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50 disabled:opacity-50"
                    >
                      Choose profile photo
                    </button>

                    {selectedPhoto && (
                      <div className="rounded-xl bg-green-50 p-3">
                        <p className="break-all text-xs font-medium text-green-900">
                          {selectedPhoto.name}
                        </p>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={handlePhotoUpload}
                            disabled={isUploadingPhoto}
                            className="flex-1 rounded-lg bg-green-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
                          >
                            {isUploadingPhoto
                              ? "Uploading..."
                              : "Upload photo"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPhoto(null);
                              setPreviewUrl("");

                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                            disabled={isUploadingPhoto}
                            className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-semibold text-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-center text-xs text-gray-400">
                      JPEG, PNG or WebP · Maximum 5 MB
                    </p>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Account status
                      </span>

                      <span
                        className={`font-semibold ${
                          currentProfile?.isActive === false
                            ? "text-red-600"
                            : currentProfile?.isActive === true
                              ? "text-green-700"
                              : "text-gray-500"
                        }`}
                      >
                        {currentProfile?.isActive === false
                          ? "Inactive"
                          : currentProfile?.isActive === true
                            ? "Active"
                            : "Unavailable"}
                      </span>
                    </div>

                    {currentProfile?.createdAt && (
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-500">
                          Member since
                        </span>

                        <span className="text-right font-medium text-gray-800">
                          {new Date(
                            currentProfile.createdAt
                          ).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleEdit}
                    className="mt-5 w-full rounded-xl border border-green-700 px-4 py-3 text-sm font-semibold text-green-800 transition hover:bg-green-50"
                  >
                    Edit profile
                  </button>
                </div>
              </section>

              {/* Account Navigation */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-gray-900">
                  Account navigation
                </h2>

                <div className="mt-4 space-y-2">
                  {dashboardLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-green-50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4eb] text-xl text-green-800">
                        {item.icon}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-800 group-hover:text-green-800">
                          {item.title}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                          {item.description}
                        </span>
                      </span>

                      <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-700">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Account Actions */}
              <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Account actions
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Sign out of your Traverse account on this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      d="M10 17l5-5-5-5M15 12H3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
                      strokeLinecap="round"
                    />
                  </svg>

                  Log out
                </button>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-6 lg:col-span-8">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Personal information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Your personal details and contact information.
                    </p>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="text-sm font-semibold text-green-700 hover:text-green-900"
                    >
                      Edit details
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Full name
                      </label>

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Email address
                      </label>

                      <input
                        type="email"
                        value={displayEmail}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                      />

                      <p className="mt-2 text-xs text-gray-400">
                        Email address cannot be changed here.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Phone number
                      </label>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={20}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        About you
                      </label>

                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={300}
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                        placeholder="Tell us a little about yourself..."
                      />

                      <p className="mt-1 text-right text-xs text-gray-400">
                        {bio.length}/300 characters
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? "Saving..." : "Save changes"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Full name
                      </p>

                      <p className="mt-2 break-words text-sm font-medium text-gray-900">
                        {displayName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Email address
                      </p>

                      <p className="mt-2 break-all text-sm font-medium text-gray-900">
                        {displayEmail}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Phone number
                      </p>

                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {currentProfile?.phone || "Not added yet"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Account role
                      </p>

                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {roleLabel}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        About you
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {currentProfile?.bio || "You haven't added a bio yet."}
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[3px]"
          onClick={() => {
            if (!logoutLoading) {
              setLogoutModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <path
                    d="M10 17l5-5-5-5M15 12H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="mt-5 text-center">
                <h2
                  id="logout-title"
                  className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl"
                >
                  Log out of Traverse?
                </h2>

                <p
                  id="logout-description"
                  className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-gray-500"
                >
                  Are you sure you want to log out of your account? You can
                  sign back in anytime.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={logoutLoading}
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={logoutLoading}
                  onClick={handleLogout}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {logoutLoading ? "Logging out..." : "Yes, log out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
