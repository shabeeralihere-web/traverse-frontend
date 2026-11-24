
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";

// TYPES

export interface CreateBookingData {
  tourId: string;
  availabilityId: string;
  participants: number;
}

export interface BookingTour {
  _id: string;
  title: string;
  photos?: {
    _id?: string;
    url: string;
    alt?: string;
  }[];
  destination?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export interface BookingAvailability {
  _id: string;
  startTime: string;
  endTime: string;
}

export interface BookingTraveler {
  _id: string;
  name: string;
  email: string;
}

export interface Booking {
  _id: string;
  traveler: string | BookingTraveler;
  tour: string | BookingTour;
  availability: string | BookingAvailability;
  participants: number;
  pricePerParticipant: number;
  currency: string;
  totalPrice: number;
  specialRequirements?: string;
  status:
    | "pending"
    | "confirmed"
    | "declined"
    | "cancelled"
    | "completed";
  cancellation?: {
    cancelledBy?: string;
    cancelledAt?: string;
    reason?: string;
    refundPercentage?: number | null;
    refundAmount?: number | null;
  };
  confirmedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

interface BookingsResponse {
  success: boolean;
  count?: number;
  data: Booking[];
}

interface ApiError {
  message: string;
}

interface BookingState {
  createdBooking: Booking | null;
  bookings: Booking[];
  managedBookings: Booking[];

  loading: boolean;
  bookingsLoading: boolean;
  managedBookingsLoading: boolean;

  error: string | null;
  bookingsError: string | null;
  managedBookingsError: string | null;

  actionLoading: boolean;
  actionError: string | null;
  successMessage: string | null;
}

const initialState: BookingState = {
  createdBooking: null,

  bookings: [],
  managedBookings: [],

  loading: false,
  bookingsLoading: false,
  managedBookingsLoading: false,

  error: null,
  bookingsError: null,
  managedBookingsError: null,

  actionLoading: false,
  actionError: null,
  successMessage: null,
};

// HELPER

const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const axiosError = error as AxiosError<ApiError>;

  return axiosError.response?.data?.message || fallback;
};

// 1. CREATE BOOKING

export const createBooking = createAsyncThunk<
  BookingResponse,
  CreateBookingData,
  { rejectValue: string }
>(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post<BookingResponse>(
        "/api/bookings",
        bookingData
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Booking failed.")
      );
    }
  }
);

// 2. GET MY BOOKINGS

export const getMyBookings = createAsyncThunk<
  BookingsResponse,
  void,
  { rejectValue: string }
>(
  "booking/getMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<BookingsResponse>(
        "/api/bookings/my-bookings"
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load your bookings.")
      );
    }
  }
);

// 3. GET OPERATOR BOOKINGS

export const getOperatorBookings = createAsyncThunk<
  BookingsResponse,
  void,
  { rejectValue: string }
>(
  "booking/getOperatorBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<BookingsResponse>(
        "/api/bookings/operator"
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load operator bookings.")
      );
    }
  }
);

// 4. GET ADMIN BOOKINGS

export const getAdminBookings = createAsyncThunk<
  BookingsResponse,
  void,
  { rejectValue: string }
>(
  "booking/getAdminBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<BookingsResponse>(
        "/api/bookings/admin"
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load all bookings.")
      );
    }
  }
);

// 5. CONFIRM BOOKING

export const confirmBooking = createAsyncThunk<
  BookingResponse,
  string,
  { rejectValue: string }
>(
  "booking/confirmBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.patch<BookingResponse>(
        `/api/bookings/${bookingId}/confirm`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to confirm booking.")
      );
    }
  }
);

// 6. DECLINE BOOKING

export const declineBooking = createAsyncThunk<
  BookingResponse,
  string,
  { rejectValue: string }
>(
  "booking/declineBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.patch<BookingResponse>(
        `/api/bookings/${bookingId}/decline`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to decline booking.")
      );
    }
  }
);

// 7. CANCEL BOOKING

export const cancelBooking = createAsyncThunk<
  BookingResponse,
  string,
  { rejectValue: string }
>(
  "booking/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.patch<BookingResponse>(
        `/api/bookings/${bookingId}/cancel`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to cancel booking.")
      );
    }
  }
);

// SLICE

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    clearBookingState: (state) => {
      state.createdBooking = null;
      state.error = null;
      state.successMessage = null;
    },

    clearMyBookings: (state) => {
      state.bookings = [];
      state.bookingsError = null;
      state.bookingsLoading = false;
    },

    clearManagedBookings: (state) => {
      state.managedBookings = [];
      state.managedBookingsError = null;
      state.managedBookingsLoading = false;
      state.actionError = null;
      state.actionLoading = false;
    },

    clearBookingActionMessages: (state) => {
      state.actionError = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // CREATE BOOKING
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
        state.createdBooking = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.createdBooking = action.payload.data;
        state.successMessage = action.payload.message;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Booking failed.";
      })

      // GET MY BOOKINGS
      .addCase(getMyBookings.pending, (state) => {
        state.bookingsLoading = true;
        state.bookingsError = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false;
        state.bookings = action.payload.data;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.bookingsLoading = false;
        state.bookingsError =
          action.payload || "Unable to load your bookings.";
      })

      // GET OPERATOR BOOKINGS
      .addCase(getOperatorBookings.pending, (state) => {
        state.managedBookingsLoading = true;
        state.managedBookingsError = null;
      })
      .addCase(getOperatorBookings.fulfilled, (state, action) => {
        state.managedBookingsLoading = false;
        state.managedBookings = action.payload.data;
      })
      .addCase(getOperatorBookings.rejected, (state, action) => {
        state.managedBookingsLoading = false;
        state.managedBookingsError =
          action.payload || "Unable to load operator bookings.";
      })

      // GET ADMIN BOOKINGS
      .addCase(getAdminBookings.pending, (state) => {
        state.managedBookingsLoading = true;
        state.managedBookingsError = null;
      })
      .addCase(getAdminBookings.fulfilled, (state, action) => {
        state.managedBookingsLoading = false;
        state.managedBookings = action.payload.data;
      })
      .addCase(getAdminBookings.rejected, (state, action) => {
        state.managedBookingsLoading = false;
        state.managedBookingsError =
          action.payload || "Unable to load all bookings.";
      })

      // CONFIRM BOOKING
      .addCase(confirmBooking.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.successMessage = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;

        state.managedBookings = state.managedBookings.map(
          (booking) =>
            booking._id === action.payload.data._id
              ? { ...booking, ...action.payload.data }
              : booking
        );
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload || "Unable to confirm booking.";
      })

      // DECLINE BOOKING
      .addCase(declineBooking.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.successMessage = null;
      })
      .addCase(declineBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;

        state.managedBookings = state.managedBookings.map(
          (booking) =>
            booking._id === action.payload.data._id
              ? { ...booking, ...action.payload.data }
              : booking
        );
      })
      .addCase(declineBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload || "Unable to decline booking.";
      })

      // CANCEL BOOKING
      .addCase(cancelBooking.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.successMessage = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message;

        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload.data._id
            ? { ...booking, ...action.payload.data }
            : booking
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload || "Unable to cancel booking.";
      });
  },
});

export const {
  clearBookingState,
  clearMyBookings,
  clearManagedBookings,
  clearBookingActionMessages,
} = bookingSlice.actions;

export default bookingSlice.reducer;
