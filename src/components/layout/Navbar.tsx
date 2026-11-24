
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  getMyOperatorApplication,
  clearMyOperatorApplication,
} from "@/redux/slices/operatorSlice";

import {
  getMyProfile,
  clearProfile,
} from "@/redux/slices/profileSlice";

export default function Navbar() {
  const dispatch = useAppDispatch();

  const { user, isAuthenticated, initialized } = useAppSelector(
    (state) => state.auth
  );

  const { myApplication } = useAppSelector(
    (state) => state.operator
  );

  const { profile } = useAppSelector((state) => state.profile);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load profile information.
  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated) {
      if (!profile) {
        dispatch(getMyProfile());
      }
    } else {
      dispatch(clearProfile());
    }
  }, [dispatch, initialized, isAuthenticated, profile]);

  // Load operator application status.
  useEffect(() => {
    if (!initialized) return;

    if (
      isAuthenticated &&
      (user?.role === "traveler" || user?.role === "operator")
    ) {
      dispatch(getMyOperatorApplication());
    } else {
      dispatch(clearMyOperatorApplication());
    }
  }, [dispatch, initialized, isAuthenticated, user?.role]);

  function closeMenus() {
    setMobileMenuOpen(false);
  }

  const displayName = profile?.name || user?.name || "Account";
  const profilePhoto = profile?.profilePhoto;

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const applicationStatus = myApplication?.status;

  const isAdmin = user?.role === "admin";
  const isTraveler = user?.role === "traveler";

  const isApprovedOperator =
    user?.role === "operator" &&
    applicationStatus === "approved";

  const isOperatorApplicant =
    user?.role === "operator" &&
    (applicationStatus === "pending" ||
      applicationStatus === "rejected");

  const dashboardHref = isAdmin
    ? "/admin"
    : "/operator/dashboard";

  return (
    <header className="sticky top-0 z-[90] border-b border-gray-100 bg-white">
      <nav className="relative mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-2 px-3 sm:px-5 md:px-7 lg:px-12">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2"
        >
          <Image
            src="/traverse-logo.png"
            alt="Traverse"
            width={44}
            height={44}
            priority
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 lg:h-11 lg:w-11"
          />

          <span className="text-lg font-semibold tracking-tight text-[#17452d] sm:text-xl lg:text-2xl">
            Traverse
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-5 md:flex lg:gap-8">
          <Link
            href="/tours"
            className="text-sm font-medium text-gray-700 transition hover:text-[#245b3b] lg:text-base"
          >
            Explore
          </Link>

          {/* Admin and Approved Operator Dashboard */}
          {initialized &&
            isAuthenticated &&
            (isAdmin || isApprovedOperator) && (
              <Link
                href={dashboardHref}
                className="text-sm font-semibold text-[#245b3b] transition hover:text-[#17452d] lg:text-base"
              >
                Dashboard
              </Link>
            )}

          {/* Traveler Navigation */}
          {initialized && isAuthenticated && isTraveler && (
            <>
              <Link
                href="/saved-tours"
                className="text-sm font-medium text-gray-700 transition hover:text-[#245b3b] lg:text-base"
              >
                Saved Tours
              </Link>

              <Link
                href="/my-bookings"
                className="text-sm font-medium text-gray-700 transition hover:text-[#245b3b] lg:text-base"
              >
                My Bookings
              </Link>
            </>
          )}

          <Link
            href="/about"
            className="text-sm font-medium text-gray-700 transition hover:text-[#245b3b] lg:text-base"
          >
            About
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Authentication Loading */}
          {!initialized ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
          ) : isAuthenticated && user ? (
            /* Logged-in Profile Link */
            <Link
              href="/profile"
              onClick={closeMenus}
              aria-label="Go to my profile"
              className="flex max-w-[155px] items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-2 transition hover:border-[#9bb9a2] hover:bg-gray-50 sm:max-w-[210px] sm:gap-2.5 sm:pr-3"
            >
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5f3e9] text-xs font-semibold text-[#245b3b] sm:h-9 sm:w-9">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={displayName}
                    fill
                    unoptimized
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  initials || "U"
                )}
              </span>

              <span className="max-w-[85px] truncate text-xs font-semibold text-gray-800 sm:max-w-[125px] sm:text-sm">
                {displayName}
              </span>
            </Link>
          ) : (
            /* Guest Desktop Actions */
            <>
              <Link
                href="/operator-register"
                className="hidden items-center gap-2 whitespace-nowrap border-r border-gray-300 pr-5 text-sm font-semibold text-black transition hover:text-[#245b3b] md:flex lg:pr-7"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-[18px] w-[18px] shrink-0"
                >
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="10" cy="7" r="4" />
                  <path
                    d="M19 8v6M16 11h6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Become a Host
              </Link>

              <Link
                href="/login"
                className="hidden whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-[#245b3b] md:block"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="hidden whitespace-nowrap rounded-full bg-[#245b3b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19452d] md:block lg:px-5"
              >
                Register
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
          >
            {mobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenus}
            className="fixed inset-0 top-[72px] z-30 bg-black/10 md:hidden"
          />

          <div className="absolute left-0 right-0 top-full z-40 border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden sm:px-6">
            <div className="flex flex-col gap-1">

              {/* Explore */}
              <Link
                href="/tours"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#245b3b]"
              >
                Explore
              </Link>

              {/* Dashboard */}
              {initialized &&
                isAuthenticated &&
                (isAdmin || isApprovedOperator) && (
                  <Link
                    href={dashboardHref}
                    onClick={closeMenus}
                    className="rounded-lg bg-green-50 px-3 py-3 text-sm font-semibold text-[#245b3b] transition hover:bg-green-100"
                  >
                    Dashboard
                  </Link>
                )}

              {/* Traveler Links */}
              {initialized && isAuthenticated && isTraveler && (
                <>
                  <Link
                    href="/saved-tours"
                    onClick={closeMenus}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#245b3b]"
                  >
                    Saved Tours
                  </Link>

                  <Link
                    href="/my-bookings"
                    onClick={closeMenus}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#245b3b]"
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* About */}
              <Link
                href="/about"
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-[#245b3b]"
              >
                About
              </Link>
            </div>

            {/* Authenticated Mobile Account */}
            {initialized && isAuthenticated && user && (
              <>
                <div className="my-3 border-t border-gray-100" />

                <Link
                  href="/profile"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-green-50"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5f3e9] text-sm font-semibold text-[#245b3b]">
                    {profilePhoto ? (
                      <Image
                        src={profilePhoto}
                        alt={displayName}
                        fill
                        unoptimized
                        sizes="40px"
                        className="object-cover"
                      />
                    ) : (
                      initials || "U"
                    )}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {displayName}
                    </span>

                    <span className="mt-1 block truncate text-xs text-gray-500">
                      {user.email}
                    </span>

                    <span className="mt-1 block text-xs font-medium capitalize text-[#36784e]">
                      {isAdmin
                        ? "Administrator"
                        : isApprovedOperator
                          ? "Approved Operator"
                          : isOperatorApplicant
                            ? `Operator · ${applicationStatus}`
                            : user.role}
                    </span>
                  </span>
                </Link>
              </>
            )}

            {/* Guest Mobile Actions */}
            {initialized && !isAuthenticated && (
              <>
                <div className="my-3 border-t border-gray-100" />

                <div className="flex flex-col gap-2">
                  <Link
                    href="/operator-register"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-[18px] w-[18px] shrink-0"
                    >
                      <path
                        d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="10" cy="7" r="4" />
                      <path
                        d="M19 8v6M16 11h6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    Become a Host
                  </Link>

                  <Link
                    href="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center rounded-full border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMenus}
                    className="flex items-center justify-center rounded-full bg-[#245b3b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#19452d]"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
}
