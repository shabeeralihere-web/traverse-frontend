
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import * as yup from "yup";

import {
  operatorRegisterSchema,
  type OperatorRegisterFormValues,
} from "@/lib/validation";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearOperatorError,
  registerOperator,
} from "@/redux/slices/operatorSlice";

const initialFormData: OperatorRegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  description: "",
  contactPhone: "",
  website: "",
  businessAddress: {
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
};

export default function OperatorRegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { initialized, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const { isLoading, error, successMessage, application } =
    useAppSelector((state) => state.operator);

  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] =
    useState<OperatorRegisterFormValues>(initialFormData);

  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Ensure the initial server and browser render are identical.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users after authentication is initialized.
  useEffect(() => {
    if (mounted && initialized && isAuthenticated) {
      router.replace("/tours");
    }
  }, [mounted, initialized, isAuthenticated, router]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    dispatch(clearOperatorError());
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      businessAddress: {
        ...previous.businessAddress,
        [name]: value,
      },
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [`businessAddress.${name}`]: "",
    }));

    dispatch(clearOperatorError());
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    dispatch(clearOperatorError());
    setFieldErrors({});

    try {
      const validatedData = await operatorRegisterSchema.validate(
        formData,
        {
          abortEarly: false,
        }
      );

      await dispatch(registerOperator(validatedData)).unwrap();
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

  const FieldError = ({ name }: { name: string }) =>
    fieldErrors[name] ? (
      <p className="mt-2 text-xs font-medium text-red-600">
        {fieldErrors[name]}
      </p>
    ) : null;

  const PasswordToggle = ({
    visible,
    onToggle,
    label,
  }: {
    visible: boolean;
    onToggle: () => void;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      aria-pressed={visible}
      className="absolute inset-y-0 right-0 flex items-center px-4 text-xs font-semibold text-gray-500 transition hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-700"
    >
      {visible ? "Hide" : "Show"}
    </button>
  );

  // Keep the initial server render and browser hydration identical.
  if (!mounted || !initialized || isAuthenticated) {
    return (
      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center bg-[#f7f9f7] px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100dvh-72px)] bg-[#f7f9f7] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_16px_55px_rgba(0,0,0,0.06)] sm:rounded-3xl">
          <div className="p-5 sm:p-8 md:p-10">
            {successMessage && application ? (
              <div className="py-5">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl font-bold text-green-800">
                  ✓
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                  Application submitted!
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {successMessage}
                </p>

                <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Application status
                  </p>

                  <p className="mt-2 text-xl font-bold capitalize text-gray-900">
                    {application.status}
                  </p>

                  <p className="mt-3 text-sm text-gray-600">
                    Business: {application.businessName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Application ID: {application.id}
                  </p>
                </div>

                <p className="mt-6 text-sm leading-6 text-gray-500">
                  An administrator must review and approve your application
                  before you can access operator features.
                </p>

                <Link
                  href="/"
                  className="mt-7 flex w-full items-center justify-center rounded-xl bg-green-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900"
                >
                  Back to Traverse
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="mb-4 inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-800">
                    Operator registration
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    Register your business
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    Tell us about yourself and your business. Your application
                    will be reviewed by our admin team.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Account information */}
                  <section className="space-y-5">
                    <div className="border-b border-gray-100 pb-3">
                      <h2 className="font-semibold text-gray-900">
                        Account information
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Create the account associated with your business.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-800">
                        Full name *
                      </label>
                      <input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        placeholder="Your full name"
                        aria-invalid={!!fieldErrors.name}
                        className={inputClass(!!fieldErrors.name)}
                      />
                      <FieldError name="name" />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-800">
                        Email address *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={!!fieldErrors.email}
                        className={inputClass(!!fieldErrors.email)}
                      />
                      <FieldError name="email" />
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-800">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          placeholder="Create a password"
                          aria-invalid={!!fieldErrors.password}
                          className={`${inputClass(!!fieldErrors.password)} pr-16`}
                        />
                        <PasswordToggle
                          visible={showPassword}
                          onToggle={() => setShowPassword((previous) => !previous)}
                          label="password"
                        />
                      </div>
                      <FieldError name="password" />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-800">
                        Confirm password *
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          aria-invalid={!!fieldErrors.confirmPassword}
                          className={`${inputClass(!!fieldErrors.confirmPassword)} pr-16`}
                        />
                        <PasswordToggle
                          visible={showConfirmPassword}
                          onToggle={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          label="confirm password"
                        />
                      </div>
                      <FieldError name="confirmPassword" />
                    </div>
                  </section>

                  {/* Business information */}
                  <section className="space-y-5">
                    <div className="border-b border-gray-100 pb-3">
                      <h2 className="font-semibold text-gray-900">
                        Business information
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Information about the experiences you provide.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-gray-800">
                        Business name *
                      </label>
                      <input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Your business name"
                        aria-invalid={!!fieldErrors.businessName}
                        className={inputClass(!!fieldErrors.businessName)}
                      />
                      <FieldError name="businessName" />
                    </div>

                    <div>
                      <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-800">
                        Business description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={5}
                        maxLength={2000}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your business and the experiences you offer..."
                        aria-invalid={!!fieldErrors.description}
                        className={`${inputClass(!!fieldErrors.description)} resize-y`}
                      />
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <FieldError name="description" />
                        <span className="shrink-0 text-xs text-gray-400">
                          {formData.description.length}/2000
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contactPhone" className="mb-2 block text-sm font-medium text-gray-800">
                        Contact phone *
                      </label>
                      <input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="Your business contact number"
                        aria-invalid={!!fieldErrors.contactPhone}
                        className={inputClass(!!fieldErrors.contactPhone)}
                      />
                      <FieldError name="contactPhone" />
                    </div>

                    <div>
                      <label htmlFor="website" className="mb-2 block text-sm font-medium text-gray-800">
                        Website{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        aria-invalid={!!fieldErrors.website}
                        className={inputClass(!!fieldErrors.website)}
                      />
                      <FieldError name="website" />
                    </div>
                  </section>

                  {/* Business address */}
                  <section className="space-y-5">
                    <div className="border-b border-gray-100 pb-3">
                      <h2 className="font-semibold text-gray-900">
                        Business address
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Enter the location of your business.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="street" className="mb-2 block text-sm font-medium text-gray-800">
                        Street{" "}
                        <span className="font-normal text-gray-400">
                          (optional)
                        </span>
                      </label>
                      <input
                        id="street"
                        name="street"
                        value={formData.businessAddress.street}
                        onChange={handleAddressChange}
                        placeholder="Street address"
                        className={inputClass(!!fieldErrors["businessAddress.street"])}
                      />
                      <FieldError name="businessAddress.street" />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="city" className="mb-2 block text-sm font-medium text-gray-800">
                          City *
                        </label>
                        <input
                          id="city"
                          name="city"
                          value={formData.businessAddress.city}
                          onChange={handleAddressChange}
                          placeholder="City"
                          className={inputClass(!!fieldErrors["businessAddress.city"])}
                        />
                        <FieldError name="businessAddress.city" />
                      </div>

                      <div>
                        <label htmlFor="state" className="mb-2 block text-sm font-medium text-gray-800">
                          State{" "}
                          <span className="font-normal text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="state"
                          name="state"
                          value={formData.businessAddress.state}
                          onChange={handleAddressChange}
                          placeholder="State"
                          className={inputClass(!!fieldErrors["businessAddress.state"])}
                        />
                        <FieldError name="businessAddress.state" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="country" className="mb-2 block text-sm font-medium text-gray-800">
                          Country *
                        </label>
                        <input
                          id="country"
                          name="country"
                          value={formData.businessAddress.country}
                          onChange={handleAddressChange}
                          placeholder="Country"
                          className={inputClass(!!fieldErrors["businessAddress.country"])}
                        />
                        <FieldError name="businessAddress.country" />
                      </div>

                      <div>
                        <label htmlFor="postalCode" className="mb-2 block text-sm font-medium text-gray-800">
                          Postal code{" "}
                          <span className="font-normal text-gray-400">
                            (optional)
                          </span>
                        </label>
                        <input
                          id="postalCode"
                          name="postalCode"
                          value={formData.businessAddress.postalCode}
                          onChange={handleAddressChange}
                          placeholder="Postal code"
                          className={inputClass(!!fieldErrors["businessAddress.postalCode"])}
                        />
                        <FieldError name="businessAddress.postalCode" />
                      </div>
                    </div>
                  </section>

                  {/* API error */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  {/* Approval notice */}
                  <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm leading-6 text-green-900">
                    Your application will remain pending until an
                    administrator reviews and approves it. You cannot manage
                    tours as an operator before approval.
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-green-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading
                      ? "Submitting application..."
                      : "Submit application"}

                    {!isLoading && <span aria-hidden="true">→</span>}
                  </button>
                </form>

                <div className="mt-9 border-t border-gray-100 pt-7">
                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-semibold text-green-800 transition hover:text-green-950"
                    >
                      Sign in
                    </Link>
                  </p>

                  <p className="mt-3 text-center text-sm text-gray-600">
                    Want to register as a traveler?{" "}
                    <Link
                      href="/register"
                      className="font-semibold text-green-800 transition hover:text-green-950"
                    >
                      Create traveler account
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Your business journey starts here.
        </p>
      </div>
    </main>
  );
}
