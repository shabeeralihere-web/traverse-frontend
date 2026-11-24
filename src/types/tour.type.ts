export type TourActivityType =
  | "adventure"
  | "nature"
  | "culture"
  | "food"
  | "sightseeing"
  | "water"
  | "wildlife"
  | "other";

export type TourStatus = "draft" | "published" | "archived";

export type CreatorRole = "operator" | "admin";

export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AED";

export interface TourDestination {
  country: string;
  state: string;
  city: string;
  address: string;
}

export interface ItineraryItem {
  title: string;
  description: string;
  duration: string;
}

export interface TourPhoto {
  _id?: string;
  url: string;
  publicId: string;
  alt: string;
}

export interface TourPrice {
  amount: number;
  currency: Currency;
}

export interface CancellationPolicy {
  freeCancellationHours: number;
  partialRefundHours: number;
  partialRefundPercentage: number;
  lateCancellationRefundPercentage: number;
  operatorCancellationRefundPercentage: number;
  noShowRefundPercentage: number;
}

export interface TourAddOn {
  _id?: string;
  name: string;
  description: string;
  price: number;
  pricingType: "per_person" | "per_booking";
  isActive: boolean;
}

export interface TourCustomization {
  groupBookingEnabled: boolean;

  privateBooking: {
    enabled: boolean;
    price: number | null;
    maxParticipants: number;
  };

  addOns: TourAddOn[];

  specialRequestsEnabled: boolean;
}

export interface Tour {
  _id: string;
  title: string;
  description: string;
  destination: TourDestination;
  activityType: TourActivityType;
  durationHours: number;
  highlights: string[];
  itinerary: ItineraryItem[];
  meetingPoint: string;
  inclusions: string[];
  exclusions: string[];
  photos: TourPhoto[];
  price: TourPrice;
  cancellationPolicy: CancellationPolicy;
  createdBy: string;
  creatorRole: CreatorRole;
  status: TourStatus;
  customization?: TourCustomization;
  createdAt: string;
  updatedAt: string;
}