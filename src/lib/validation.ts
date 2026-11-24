
import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),

  password: yup
    .string()
    .max(128, "Password cannot exceed 128 characters.")
    .required("Password is required."),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters.")
    .required("Name is required."),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .required("Email is required."),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .matches(/[A-Z]/, "At least one uppercase letter is required.")
    .matches(/[a-z]/, "At least one lowercase letter is required.")
    .matches(/[0-9]/, "At least one number is required.")
    .matches(/[^A-Za-z0-9]/, "At least one special character is required.")
    .required("Password is required."),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

export const operatorRegisterSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(100, "Name cannot exceed 100 characters.")
    .required("Name is required."),

  email: yup
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Email cannot exceed 254 characters.")
    .required("Email is required."),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .matches(/[a-z]/, "At least one lowercase letter is required.")
    .matches(/[A-Z]/, "At least one uppercase letter is required.")
    .matches(/[0-9]/, "At least one number is required.")
    .matches(/[^A-Za-z0-9]/, "At least one special character is required.")
    .required("Password is required."),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),

  businessName: yup
    .string()
    .trim()
    .max(150, "Business name cannot exceed 150 characters.")
    .required("Business name is required."),

  description: yup
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters.")
    .required("Business description is required."),

  contactPhone: yup
    .string()
    .trim()
    .max(20, "Contact phone cannot exceed 20 characters.")
    .required("Contact phone is required."),

  website: yup
    .string()
    .trim()
    .max(300, "Website cannot exceed 300 characters.")
    .test(
      "valid-website",
      "Enter a valid website URL starting with http:// or https://.",
      (value) => !value || yup.string().url().isValidSync(value)
    ),

  businessAddress: yup.object({
    street: yup.string().trim().max(150, "Street cannot exceed 150 characters."),
    city: yup
      .string()
      .trim()
      .max(100, "City cannot exceed 100 characters.")
      .required("City is required."),
    state: yup.string().trim().max(100, "State cannot exceed 100 characters."),
    country: yup
      .string()
      .trim()
      .max(100, "Country cannot exceed 100 characters.")
      .required("Country is required."),
    postalCode: yup
      .string()
      .trim()
      .max(20, "Postal code cannot exceed 20 characters."),
  }),
});

export type OperatorRegisterFormValues = yup.InferType<
  typeof operatorRegisterSchema
>;

export type LoginFormValues = yup.InferType<typeof loginSchema>;
export type RegisterFormValues = yup.InferType<typeof registerSchema>;



export const addTourSchema = yup.object({
  title: yup
    .string()
    .trim()
    .max(150, "Title cannot exceed 150 characters.")
    .required("Tour title is required."),

  description: yup
    .string()
    .trim()
    .required("Tour description is required."),

  destination: yup.object({
    country: yup.string().trim().max(100).required("Country is required."),
    state: yup.string().trim().max(100).default(""),
    city: yup.string().trim().max(100).required("City is required."),
    address: yup.string().trim().max(300).default(""),
  }),

  activityType: yup
    .string()
    .oneOf([
      "adventure",
      "nature",
      "culture",
      "food",
      "sightseeing",
      "water",
      "wildlife",
      "other",
    ])
    .required("Select an activity type."),

  durationHours: yup
    .number()
    .typeError("Enter a valid duration.")
    .min(0.5, "Duration must be at least 0.5 hours.")
    .max(720, "Duration cannot exceed 720 hours.")
    .required("Duration is required."),

  meetingPoint: yup
    .string()
    .trim()
    .required("Meeting point is required."),

  highlights: yup
    .array()
    .of(yup.string().trim().max(200))
    .max(20, "You can add up to 20 highlights.")
    .default([]),

  itinerary: yup
    .array()
    .of(
      yup.object({
        title: yup.string().trim().max(150).required("Step title is required."),
        description: yup.string().trim().max(2000).required("Step description is required."),
        duration: yup.string().trim().max(100).default(""),
      })
    )
    .max(50, "You can add up to 50 itinerary steps.")
    .default([]),

  inclusions: yup
    .array()
    .of(yup.string().trim().max(300))
    .max(50)
    .default([]),

  exclusions: yup
    .array()
    .of(yup.string().trim().max(300))
    .max(50)
    .default([]),

  price: yup.object({
    amount: yup
      .number()
      .typeError("Enter a valid price.")
      .min(0, "Price cannot be negative.")
      .required("Price is required."),
    currency: yup
      .string()
      .oneOf(["INR", "USD", "EUR", "GBP", "AED"])
      .required("Select a currency."),
  }),

  cancellationPolicy: yup.object({
    freeCancellationHours: yup.number().min(0).integer().required(),
    partialRefundHours: yup.number().min(0).integer().required(),
    partialRefundPercentage: yup.number().min(0).max(100).required(),
    lateCancellationRefundPercentage: yup.number().min(0).max(100).required(),
    operatorCancellationRefundPercentage: yup.number().min(0).max(100).required(),
    noShowRefundPercentage: yup.number().min(0).max(100).required(),
  }),
});

export type AddTourFormValues = yup.InferType<typeof addTourSchema>;

