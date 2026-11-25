
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

  const { profile } = useAppSelector(
    (state) => state.profile
  );

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

  const navLinkClass =
    "whitespace-nowrap text-sm font-medium text-gray-700 transition-colors hover:text-[#245b3b]";

  const mobileLinkClass =
    "block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-green-50 hover:text-[#245b3b]";

  return (
    <header className="sticky top-0 z-[90] w-full border-b border-gray-100 bg-white">

      {/* Main Navbar */}
      <nav className="relative mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">

        {/* LEFT: Brand Logo */}
        
{/* LEFT: Brand Logo */}
<Link
  href="/"
  onClick={closeMenus}
  aria-label="Traverse home"
  className="flex h-full shrink-0 items-center gap-2.5"
>
  {/* Logo Symbol */}
  <span className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-14 sm:w-14">
    <Image
      src="/traverse-logo-v2.png"
      alt="Traverse"
      width={56}
      height={56}
      priority
      className="block h-full w-full object-contain"
    />
  </span>

  {/* Brand Name */}
  <span className="relative top-[1px] whitespace-nowrap font-[family-name:var(--font-league-spartan)] text-xl font-bold uppercase leading-none tracking-[-0.035em] text-[#17452d] sm:text-2xl">
    TRAVERSE
  </span>
</Link>


        {/* CENTER: Desktop Navigation */}
        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-6 xl:gap-9">

            <Link href="/tours" className={navLinkClass}>
              Explore
            </Link>

            {/* Admin and Approved Operator */}
            {initialized &&
              isAuthenticated &&
              (isAdmin || isApprovedOperator) && (
                <Link
                  href={dashboardHref}
                  className="whitespace-nowrap text-sm font-semibold text-[#245b3b] transition hover:text-[#17452d]"
                >
                  Dashboard
                </Link>
              )}

            {/* Traveler Navigation */}
            {initialized && isAuthenticated && isTraveler && (
              <>
                <Link
                  href="/saved-tours"
                  className={navLinkClass}
                >
                  Saved Tours
                </Link>

                <Link
                  href="/my-bookings"
                  className={navLinkClass}
                >
                  My Bookings
                </Link>
              </>
            )}

            <Link href="/about" className={navLinkClass}>
              About
            </Link>

          </div>
        </div>

        {/* RIGHT: Account Actions */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">

          {/* Authentication Loading */}
          {!initialized ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-gray-100" />
          ) : isAuthenticated && user ? (

            /* Logged-in Profile */
            <Link
              href="/profile"
              onClick={closeMenus}
              aria-label="Go to my profile"
              className="flex max-w-[155px] shrink-0 items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-2 transition hover:border-[#9bb9a2] hover:bg-gray-50 sm:max-w-[210px] sm:gap-2.5 sm:pr-3"
            >
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5f3e9] text-xs font-semibold text-[#245b3b]">
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
            <div className="hidden items-center gap-5 lg:flex xl:gap-7">

              <Link
                href="/operator-register"
                className="flex items-center gap-2 whitespace-nowrap border-r border-gray-200 pr-5 text-sm font-semibold text-gray-900 transition hover:text-[#245b3b] xl:pr-7"
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
                className="whitespace-nowrap text-sm font-medium text-gray-700 transition hover:text-[#245b3b]"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="whitespace-nowrap rounded-full bg-[#245b3b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#19452d]"
              >
                Register
              </Link>

            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 lg:hidden"
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
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenus}
            className="fixed inset-0 top-20 z-30 bg-black/10 lg:hidden"
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 top-full z-40 border-t border-gray-100 bg-white px-4 pb-5 pt-3 shadow-lg sm:px-6 lg:hidden">

            <div className="flex flex-col gap-1">

              <Link
                href="/tours"
                onClick={closeMenus}
                className={mobileLinkClass}
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
                    className="block rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-[#245b3b] transition hover:bg-green-100"
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
                    className={mobileLinkClass}
                  >
                    Saved Tours
                  </Link>

                  <Link
                    href="/my-bookings"
                    onClick={closeMenus}
                    className={mobileLinkClass}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              <Link
                href="/about"
                onClick={closeMenus}
                className={mobileLinkClass}
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
                    className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
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
