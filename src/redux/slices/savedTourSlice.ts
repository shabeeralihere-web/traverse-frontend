
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.type";
import type { Tour } from "@/types/tour.type";

// API error message helper.
const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;

  return axiosError.response?.data?.message || fallback;
};

// Saved Tours Redux state.
interface SavedTourState {
  savedTours: Tour[];
  isLoading: boolean;
  isSaving: boolean;
  isRemoving: boolean;
  error: string | null;
}

// Initial state.
const initialState: SavedTourState = {
  savedTours: [],
  isLoading: false,
  isSaving: false,
  isRemoving: false,
  error: null,
};

// GET: Fetch the current traveler's saved tours.
export const getMySavedTours = createAsyncThunk<
  Tour[],
  void,
  { rejectValue: string }
>(
  "savedTours/getMySavedTours",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Tour[]>>(
        "/api/saved-tours"
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load saved tours.")
      );
    }
  }
);

// POST: Save a tour.
export const saveTour = createAsyncThunk<
  Tour,
  string,
  { rejectValue: string }
>(
  "savedTours/saveTour",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Tour>>(
        `/api/saved-tours/${tourId}`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to save this tour.")
      );
    }
  }
);

// DELETE: Remove a saved tour.
export const removeSavedTour = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "savedTours/removeSavedTour",
  async (tourId, { rejectWithValue }) => {
    try {
      await api.delete<ApiResponse<null>>(
        `/api/saved-tours/${tourId}`
      );

      return tourId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to remove saved tour.")
      );
    }
  }
);

// Saved Tours slice.
const savedTourSlice = createSlice({
  name: "savedTours",
  initialState,

  reducers: {
    clearSavedTourError: (state) => {
      state.error = null;
    },

    clearSavedTours: (state) => {
      state.savedTours = [];
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Fetch saved tours.
      .addCase(getMySavedTours.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMySavedTours.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedTours = action.payload;
      })
      .addCase(getMySavedTours.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Unable to load saved tours.";
      })

      // Save a tour.
      .addCase(saveTour.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveTour.fulfilled, (state, action) => {
        state.isSaving = false;

        const alreadySaved = state.savedTours.some(
          (tour) => tour._id === action.payload._id
        );

        if (!alreadySaved) {
          state.savedTours.unshift(action.payload);
        }
      })
      .addCase(saveTour.rejected, (state, action) => {
        state.isSaving = false;
        state.error =
          action.payload || "Unable to save this tour.";
      })

      // Remove a saved tour.
      .addCase(removeSavedTour.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeSavedTour.fulfilled, (state, action) => {
        state.isRemoving = false;

        state.savedTours = state.savedTours.filter(
          (tour) => tour._id !== action.payload
        );
      })
      .addCase(removeSavedTour.rejected, (state, action) => {
        state.isRemoving = false;
        state.error =
          action.payload || "Unable to remove saved tour.";
      });
  },
});

// Export actions.
export const {
  clearSavedTourError,
  clearSavedTours,
} = savedTourSlice.actions;

// Export reducer.
export default savedTourSlice.reducer;
