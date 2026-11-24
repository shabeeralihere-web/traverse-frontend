
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";

import { loginSchema, type LoginFormValues } from "@/lib/validation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearAuthError, loginUser } from "@/redux/slices/authSlice";
import type { User } from "@/types";

const travelImage =
  "https://images.unsplash.com/photo-1780314332097-fa770b33ed7f?auto=format&fit=crop&fm=jpg&q=80&w=1400";

const getDashboardPath = (user: User | null) => {
  if (user?.role === "admin") {
    return "/admin";
  }

  if (user?.role === "operator") {
    return "/operator/dashboard";
  }

  return "/tours";
};

function TravelImagePanel() {
  return (
    <div className="relative hidden min-h-[590px] overflow-hidden bg-[#183d2d] lg:block">
      <Image
        src={travelImage}
        alt="Beautiful alpine village with a waterfall, mountains and flowers"
        fill
        priority
        unoptimized
        sizes="(min-width: 1024px) 430px, 0px"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#09291f]/95 via-[#09291f]/35 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-9 xl:p-11">
        <div className="mb-5 h-1 w-14 rounded-full bg-lime-400" />

        <h2 className="max-w-[390px] text-[42px] font-bold leading-[1.12] tracking-tight text-white xl:text-[48px]">
          Start your
          <br />
          <span className="text-lime-400">journey</span> with us.
        </h2>

        <p className="mt-5 max-w-[330px] text-base leading-7 text-white/90">
          Discover beautiful places. Make memories that last a lifetime.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    user,
    loginLoading,
    error,
    isAuthenticated,
    initialized,
  } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Prevent rendering the login form before the component mounts.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to their respective dashboard.
  useEffect(() => {
    if (mounted && initialized && isAuthenticated && user) {
      router.replace(getDashboardPath(user));
    }
  }, [mounted, initialized, isAuthenticated, user, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    dispatch(clearAuthError());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(clearAuthError());
    setFieldErrors({});

    try {
      const validatedData = await loginSchema.validate(formData, {
        abortEarly: false,
      });

      const loggedInUser = await dispatch(
        loginUser(validatedData)
      ).unwrap();

      router.replace(getDashboardPath(loggedInUser));
      router.refresh();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};

        err.inner.forEach((item) => {
          if (item.path && !errors[item.path]) {
            errors[item.path] = item.message;
          }
        });

        setFieldErrors(errors);
      }
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
        : "border-gray-200 hover:border-gray-300 focus:border-green-700 focus:ring-4 focus:ring-green-50"
    }`;

  // Wait until authentication initialization is complete.
  if (!mounted || !initialized || isAuthenticated) {
    return (
      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7]">
        <p className="text-sm font-medium text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_16px_55px_rgba(0,0,0,0.07)] lg:grid-cols-[0.9fr_1.1fr]">
        <TravelImagePanel />

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[410px]">
            <div className="mb-9">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-[36px]">
                Welcome back.
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Sign in to manage your bookings and continue exploring.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-sm font-medium text-gray-800"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  className={inputClass(!!fieldErrors.email)}
                />

                {fieldErrors.email && (
                  <p
                    id="email-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2.5 block text-sm font-medium text-gray-800"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    className={`${inputClass(!!fieldErrors.password)} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-gray-500 transition hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginLoading ? "Signing in..." : "Sign in"}

                {!loginLoading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <div className="mt-9 border-t border-gray-100 pt-7">
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-green-800 transition hover:text-green-950"
                >
                  Get started
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
