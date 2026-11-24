
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getPendingApplications,
  approveApplication,
  rejectApplication,
  clearAdminError,
} from "@/redux/slices/adminSlice";

export default function AdminPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const {
    pendingApplications,
    isLoadingApplications,
    isApprovingApplication,
    isRejectingApplication,
    error,
  } = useAppSelector((state) => state.admin);

  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );

  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingApplicationId, setRejectingApplicationId] = useState<
    string | null
  >(null);

  // Protect the admin page.
  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [initialized, isAuthenticated, user, router]);

  // Fetch applications only for admins.
  useEffect(() => {
    if (initialized && isAuthenticated && user?.role === "admin") {
      dispatch(getPendingApplications());
    }
  }, [initialized, isAuthenticated, user?.role, dispatch]);

  const handleApprove = async (applicationId: string) => {
    const result = await dispatch(
      approveApplication(applicationId)
    );

    if (approveApplication.fulfilled.match(result)) {
      setSelectedApplication(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingApplicationId || !rejectionReason.trim()) return;

    const result = await dispatch(
      rejectApplication({
        applicationId: rejectingApplicationId,
        rejectionReason: rejectionReason.trim(),
      })
    );

    if (rejectApplication.fulfilled.match(result)) {
      setRejectingApplicationId(null);
      setRejectionReason("");
    }
  };

  if (!initialized || !isAuthenticated || user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Traverse Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-600">
            Manage operator applications and platform activities.
          </p>
        </div>

        {/* Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Pending Applications
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {pendingApplications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Admin Account
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              {user.name}
            </p>

            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Applications */}
        <section className="rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Operator Applications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review businesses requesting operator access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(getPendingApplications())}
              disabled={isLoadingApplications}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoadingApplications ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center justify-between gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => dispatch(clearAdminError())}
                  className="font-semibold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {isLoadingApplications ? (
              <p className="py-12 text-center text-gray-500">
                Loading operator applications...
              </p>
            ) : pendingApplications.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  No pending applications
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  New operator applications will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {pendingApplications.map((application) => (
                  <article
                    key={application._id}
                    className="rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {application.businessName}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Applied by {application.user.name}
                        </p>
                      </div>

                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Pending
                      </span>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                      {application.description}
                    </p>

                    <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Applicant Email
                        </p>
                        <p className="mt-1 text-gray-600">
                          {application.user.email}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          Contact Phone
                        </p>
                        <p className="mt-1 text-gray-600">
                          {application.contactPhone}
                        </p>
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          Website
                        </p>
                        {application.website ? (
                          <a
                            href={application.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-green-700 hover:underline"
                          >
                            {application.website}
                          </a>
                        ) : (
                          <p className="mt-1 text-gray-500">Not provided</p>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          Business Address
                        </p>
                        <p className="mt-1 text-gray-600">
                          {[
                            application.businessAddress.street,
                            application.businessAddress.city,
                            application.businessAddress.state,
                            application.businessAddress.country,
                            application.businessAddress.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-400">
                      Applied on{" "}
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                      <button
                        type="button"
                        onClick={() => handleApprove(application._id)}
                        disabled={
                          isApprovingApplication || isRejectingApplication
                        }
                        className="rounded-lg bg-green-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isApprovingApplication
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          dispatch(clearAdminError());
                          setRejectingApplicationId(application._id);
                          setRejectionReason("");
                        }}
                        disabled={
                          isApprovingApplication || isRejectingApplication
                        }
                        className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>

                    {/* Rejection form */}
                    {rejectingApplicationId === application._id && (
                      <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <label
                          htmlFor={`reason-${application._id}`}
                          className="mb-2 block text-sm font-semibold text-gray-800"
                        >
                          Rejection Reason
                        </label>

                        <textarea
                          id={`reason-${application._id}`}
                          value={rejectionReason}
                          onChange={(event) =>
                            setRejectionReason(event.target.value)
                          }
                          maxLength={1000}
                          rows={4}
                          placeholder="Explain why this application is being rejected..."
                          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                        />

                        <p className="mt-1 text-right text-xs text-gray-500">
                          {rejectionReason.length}/1000
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleReject}
                            disabled={
                              !rejectionReason.trim() ||
                              isRejectingApplication
                            }
                            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isRejectingApplication
                              ? "Rejecting..."
                              : "Confirm Rejection"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRejectingApplicationId(null);
                              setRejectionReason("");
                            }}
                            disabled={isRejectingApplication}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
