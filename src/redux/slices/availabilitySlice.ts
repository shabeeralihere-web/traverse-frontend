
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";

export interface TourAvailability {
  _id: string;
  tour: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  priceOverride: number | null;
  status: "scheduled" | "cancelled";
}

export interface AvailabilityInput {
  startTime: string;
  endTime: string;
  capacity: number;
  priceOverride: number | null;
}

interface UpdateAvailabilityInput {
  id: string;
  data: Partial<AvailabilityInput>;
}

interface AvailabilityState {
  slots: TourAvailability[];
  managementSlots: TourAvailability[];
  loading: boolean;
  managementLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ApiError {
  message: string;
}

const initialState: AvailabilityState = {
  slots: [],
  managementSlots: [],
  loading: false,
  managementLoading: false,
  actionLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.message || fallback;
};

const sortByStartTime = (slots: TourAvailability[]) =>
  [...slots].sort(
    (a, b) =>
      new Date(a.startTime).getTime() -
      new Date(b.startTime).getTime()
  );

// PUBLIC AVAILABILITY
export const getTourAvailability = createAsyncThunk<
  TourAvailability[],
  string,
  { rejectValue: string }
>(
  "availability/getTourAvailability",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<TourAvailability[]>>(
        `/api/tours/${tourId}/availability`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load available dates.")
      );
    }
  }
);

// MANAGEMENT AVAILABILITY FOR ONE TOUR
export const getManageableAvailability = createAsyncThunk<
  TourAvailability[],
  string,
  { rejectValue: string }
>(
  "availability/getManageableAvailability",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<TourAvailability[]>>(
        `/api/tours/${tourId}/availability/manage`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load availability sessions.")
      );
    }
  }
);

// MANAGEMENT AVAILABILITY FOR ALL TOURS
export const getAllManageableAvailability = createAsyncThunk<
  TourAvailability[],
  string[],
  { rejectValue: string }
>(
  "availability/getAllManageableAvailability",
  async (tourIds, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        tourIds.map(async (tourId) => {
          const response = await api.get<ApiResponse<TourAvailability[]>>(
            `/api/tours/${tourId}/availability/manage`
          );

          return response.data.data;
        })
      );

      return results.flat();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load availability sessions.")
      );
    }
  }
);

// CREATE
export const createAvailability = createAsyncThunk<
  TourAvailability,
  { tourId: string; data: AvailabilityInput },
  { rejectValue: string }
>(
  "availability/createAvailability",
  async ({ tourId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<TourAvailability>>(
        `/api/tours/${tourId}/availability`,
        data
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to create availability.")
      );
    }
  }
);

// UPDATE
export const updateAvailability = createAsyncThunk<
  TourAvailability,
  UpdateAvailabilityInput,
  { rejectValue: string }
>(
  "availability/updateAvailability",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<TourAvailability>>(
        `/api/tours/availability/${id}`,
        data
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to update availability.")
      );
    }
  }
);

// CANCEL
export const cancelAvailability = createAsyncThunk<
  TourAvailability,
  string,
  { rejectValue: string }
>(
  "availability/cancelAvailability",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<TourAvailability>>(
        `/api/tours/availability/${id}/cancel`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to cancel availability.")
      );
    }
  }
);

const availabilitySlice = createSlice({
  name: "availability",
  initialState,

  reducers: {
    clearAvailability: (state) => {
      state.slots = [];
      state.managementSlots = [];
      state.error = null;
    },

    clearAvailabilityError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // PUBLIC
      .addCase(getTourAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTourAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.slots = action.payload;
      })
      .addCase(getTourAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load available dates.";
      })

      // ONE TOUR MANAGEMENT
      .addCase(getManageableAvailability.pending, (state) => {
        state.managementLoading = true;
        state.error = null;
      })
      .addCase(getManageableAvailability.fulfilled, (state, action) => {
        state.managementLoading = false;
        state.managementSlots = sortByStartTime(action.payload);
      })
      .addCase(getManageableAvailability.rejected, (state, action) => {
        state.managementLoading = false;
        state.error =
          action.payload || "Unable to load availability sessions.";
      })

      // ALL TOURS MANAGEMENT
      .addCase(getAllManageableAvailability.pending, (state) => {
        state.managementLoading = true;
        state.managementSlots = [];
        state.error = null;
      })
      .addCase(getAllManageableAvailability.fulfilled, (state, action) => {
        state.managementLoading = false;
        state.managementSlots = sortByStartTime(action.payload);
      })
      .addCase(getAllManageableAvailability.rejected, (state, action) => {
        state.managementLoading = false;
        state.error =
          action.payload || "Unable to load availability sessions.";
      })

      // CREATE
      .addCase(createAvailability.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createAvailability.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.managementSlots = sortByStartTime([
          ...state.managementSlots,
          action.payload,
        ]);
      })
      .addCase(createAvailability.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Unable to create availability.";
      })

      // UPDATE
      .addCase(updateAvailability.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updateSlot = (slots: TourAvailability[]) => {
          const index = slots.findIndex(
            (slot) => slot._id === action.payload._id
          );

          if (index !== -1) {
            slots[index] = action.payload;
          }
        };

        updateSlot(state.managementSlots);
        updateSlot(state.slots);
        state.managementSlots = sortByStartTime(state.managementSlots);
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Unable to update availability.";
      })

      // CANCEL
      .addCase(cancelAvailability.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelAvailability.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.managementSlots.findIndex(
          (slot) => slot._id === action.payload._id
        );

        if (index !== -1) {
          state.managementSlots[index] = action.payload;
        }

        state.slots = state.slots.filter(
          (slot) => slot._id !== action.payload._id
        );
      })
      .addCase(cancelAvailability.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Unable to cancel availability.";
      });
  },
});

export const {
  clearAvailability,
  clearAvailabilityError,
} = availabilitySlice.actions;

export default availabilitySlice.reducer;
