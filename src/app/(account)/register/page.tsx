
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearAuthError,
  registerUser,
} from "@/redux/slices/authSlice";

const travelImage =
  "https://images.unsplash.com/photo-1780314332097-fa770b33ed7f?auto=format&fit=crop&fm=jpg&q=80&w=1400";

function TravelImagePanel() {
  return (
    <div className="relative hidden min-h-[680px] overflow-hidden bg-[#183d2d] lg:block">
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

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    initialized,
    registerLoading,
    error,
  } = useAppSelector((state) => state.auth);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<RegisterFormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Prevent rendering before the client has mounted.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect users who are already authenticated.
  useEffect(() => {
    if (!mounted || !initialized || !isAuthenticated) return;

    if (user?.role === "admin") {
      router.replace("/admin");
    } else if (user?.role === "operator") {
      router.replace("/operator/dashboard");
    } else {
      router.replace("/tours");
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
      const validatedData = await registerSchema.validate(formData, {
        abortEarly: false,
      });

      await dispatch(
        registerUser({
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        })
      ).unwrap();

      // Registration also logs the traveler in.
      router.replace("/tours");
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

  // Wait for authentication initialization.
  if (!mounted || !initialized || isAuthenticated) {
    return (
      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7]">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_16px_55px_rgba(0,0,0,0.07)] lg:grid-cols-[0.9fr_1.1fr]">
        <TravelImagePanel />

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-[410px]">
            <div className="mb-7">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-[36px]">
                Create your account.
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Join Traverse and start discovering places worth experiencing.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FULL NAME */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2.5 block text-sm font-medium text-gray-800"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={
                    fieldErrors.name ? "name-error" : undefined
                  }
                  className={inputClass(!!fieldErrors.name)}
                />

                {fieldErrors.name && (
                  <p
                    id="name-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* EMAIL */}
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

              {/* PASSWORD */}
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
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
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

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2.5 block text-sm font-medium text-gray-800"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? "confirm-password-error"
                        : undefined
                    }
                    className={`${inputClass(
                      !!fieldErrors.confirmPassword
                    )} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-gray-500 transition hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {fieldErrors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* SERVER ERROR */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={registerLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerLoading ? "Creating account..." : "Create account"}

                {!registerLoading && <span aria-hidden="true">→</span>}
              </button>
            </form>

            {/* LOGIN LINK */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-green-800 transition hover:text-green-950"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
