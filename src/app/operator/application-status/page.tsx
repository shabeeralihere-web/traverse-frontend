
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getMyOperatorApplication,
  clearOperatorError,
} from "@/redux/slices/operatorSlice";

export default function OperatorApplicationStatusPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { initialized, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const {
    myApplication,
    isLoadingApplication,
    error,
  } = useAppSelector((state) => state.operator);

  // Check authentication and fetch the application
  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    dispatch(clearOperatorError());
    dispatch(getMyOperatorApplication());
  }, [initialized, isAuthenticated, dispatch, router]);

  // Show loading while checking authentication
  if (!initialized || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking your account...</p>
      </main>
    );
  }

  // Show application loading
  if (isLoadingApplication) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading your application...</p>
      </main>
    );
  }

  // Show error if application could not be loaded
  if (error && !myApplication) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Application not found
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            onClick={() => dispatch(getMyOperatorApplication())}
            className="mt-6 rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800"
          >
            Try again
          </button>

          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-600 underline">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!myApplication) return null;

  const isPending = myApplication.status === "pending";
  const isApproved = myApplication.status === "approved";
  const isRejected = myApplication.status === "rejected";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Page heading */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Back to home
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Operator Application
          </h1>

          <p className="mt-2 text-gray-600">
            View your business information and application status.
          </p>
        </div>

        {/* Application status */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Application status
            </h2>

            <span
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                isPending
                  ? "bg-yellow-100 text-yellow-800"
                  : isApproved
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {myApplication.status.charAt(0).toUpperCase() +
                myApplication.status.slice(1)}
            </span>
          </div>

          {isPending && (
            <div className="mt-6 rounded-lg bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">
                Your application is under review
              </h3>

              <p className="mt-2 text-sm leading-6 text-yellow-800">
                Your operator application has been submitted successfully.
                Our admin team will review your business details.
                You will be able to manage tours after approval.
              </p>
            </div>
          )}

          {isApproved && (
            <div className="mt-6 rounded-lg bg-green-50 p-5">
              <h3 className="font-semibold text-green-900">
                Congratulations! Your application is approved.
              </h3>

              <p className="mt-2 text-sm leading-6 text-green-800">
                Your account is now approved as a tour operator.
                You can start managing your business and tours.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="mt-6 rounded-lg bg-red-50 p-5">
              <h3 className="font-semibold text-red-900">
                Your application was rejected
              </h3>

              <p className="mt-2 text-sm leading-6 text-red-800">
                Your application could not be approved at this time.
                Please review the reason below.
              </p>

              {myApplication.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-200 bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Rejection reason
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {myApplication.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500">
              Submitted on
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {new Date(myApplication.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>
        </section>

        {/* Business information */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Business information
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-sm text-gray-500">Business name</p>
              <p className="mt-1 font-medium text-gray-900">
                {myApplication.businessName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="mt-1 leading-6 text-gray-700">
                {myApplication.description}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Contact phone</p>
              <p className="mt-1 font-medium text-gray-900">
                {myApplication.contactPhone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Website</p>
              {myApplication.website ? (
                <a
                  href={myApplication.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-blue-600 underline"
                >
                  {myApplication.website}
                </a>
              ) : (
                <p className="mt-1 text-gray-500">
                  Not provided
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500">Business address</p>

              <p className="mt-1 leading-6 text-gray-700">
                {[
                  myApplication.businessAddress.street,
                  myApplication.businessAddress.city,
                  myApplication.businessAddress.state,
                  myApplication.businessAddress.postalCode,
                  myApplication.businessAddress.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

          </div>
        </section>

        {/* Applicant information */}
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Applicant information
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="mt-1 font-medium text-gray-900">
                {myApplication.user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-medium text-gray-900">
                {myApplication.user.email}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
