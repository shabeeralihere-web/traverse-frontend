
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.type";
import type { Tour, TourStatus } from "@/types/tour.type";

// Public tour search parameters.
export interface TourQueryParams {
  search?: string;
  destination?: string;
  activityType?: string;
  currency?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  minDuration?: string | number;
  maxDuration?: string | number;
  date?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Pagination information returned by the backend.
export interface TourPagination {
  currentPage: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Public tours API response.
interface PublishedToursResponse {
  success: boolean;
  count: number;
  totalCount: number;
  pagination: TourPagination;
  data: Tour[];
}

// API error message helper.
const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;

  return axiosError.response?.data?.message || fallback;
};

// Update tour data.
interface UpdateTourData {
  tourId: string;
  formData: FormData;
}

// Update tour status data.
interface UpdateTourStatusData {
  tourId: string;
  status: TourStatus;
}

// Tour Redux state.
interface TourState {
  publicTours: Tour[];
  myTours: Tour[];
  selectedTour: Tour | null;

  pagination: TourPagination | null;
  totalCount: number;

  isLoadingTours: boolean;
  isLoadingMyTours: boolean;
  isLoadingTour: boolean;
  isSavingTour: boolean;
  isUpdatingStatus: boolean;
  isDeletingTour: boolean;

  error: string | null;
}

// Initial state.
const initialState: TourState = {
  publicTours: [],
  myTours: [],
  selectedTour: null,

  pagination: null,
  totalCount: 0,

  isLoadingTours: false,
  isLoadingMyTours: false,
  isLoadingTour: false,
  isSavingTour: false,
  isUpdatingStatus: false,
  isDeletingTour: false,

  error: null,
};

// GET: Published tours with server-side search, filters and pagination.
export const getPublishedTours = createAsyncThunk<
  PublishedToursResponse,
  TourQueryParams | undefined,
  { rejectValue: string }
>(
  "tours/getPublishedTours",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await api.get<PublishedToursResponse>(
        "/api/tours",
        {
          params,
          signal,
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load tours.")
      );
    }
  }
);

// GET: Single published tour.
export const getPublishedTourById = createAsyncThunk<
  Tour,
  string,
  { rejectValue: string }
>(
  "tours/getPublishedTourById",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Tour>>(
        `/api/tours/${tourId}`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load tour details.")
      );
    }
  }
);

// GET: All tours manageable by the current operator/admin.
export const getMyTours = createAsyncThunk<
  Tour[],
  void,
  { rejectValue: string }
>(
  "tours/getMyTours",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Tour[]>>(
        "/api/tours/my-tours"
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load your tours.")
      );
    }
  }
);

// GET: Single manageable tour.
export const getManagedTourById = createAsyncThunk<
  Tour,
  string,
  { rejectValue: string }
>(
  "tours/getManagedTourById",
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<Tour>>(
        `/api/tours/manage/${tourId}`
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load tour details.")
      );
    }
  }
);

// POST: Create a tour with photos.
export const createTour = createAsyncThunk<
  Tour,
  FormData,
  { rejectValue: string }
>(
  "tours/createTour",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<Tour>>(
        "/api/tours",
        formData
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to create tour.")
      );
    }
  }
);

// PATCH: Update tour details and photos.
export const updateTour = createAsyncThunk<
  Tour,
  UpdateTourData,
  { rejectValue: string }
>(
  "tours/updateTour",
  async ({ tourId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<Tour>>(
        `/api/tours/${tourId}`,
        formData
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to update tour.")
      );
    }
  }
);

// PATCH: Update tour status.
export const updateTourStatus = createAsyncThunk<
  Tour,
  UpdateTourStatusData,
  { rejectValue: string }
>(
  "tours/updateTourStatus",
  async ({ tourId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<Tour>>(
        `/api/tours/${tourId}/status`,
        { status }
      );

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to update tour status.")
      );
    }
  }
);

// DELETE: Delete a tour.
export const deleteTour = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "tours/deleteTour",
  async (tourId, { rejectWithValue }) => {
    try {
      await api.delete<ApiResponse<null>>(
        `/api/tours/${tourId}`
      );

      return tourId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to delete tour.")
      );
    }
  }
);

// Tour slice.
const tourSlice = createSlice({
  name: "tours",
  initialState,

  reducers: {
    clearTourError: (state) => {
      state.error = null;
    },

    clearSelectedTour: (state) => {
      state.selectedTour = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Published tours.
      .addCase(getPublishedTours.pending, (state) => {
        state.isLoadingTours = true;
        state.error = null;
      })
      .addCase(getPublishedTours.fulfilled, (state, action) => {
        state.isLoadingTours = false;
        state.publicTours = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPublishedTours.rejected, (state, action) => {
        state.isLoadingTours = false;

        if (action.meta.aborted) return;

        state.error = action.payload || "Unable to load tours.";
      })

      // Single published tour.
      .addCase(getPublishedTourById.pending, (state) => {
        state.isLoadingTour = true;
        state.selectedTour = null;
        state.error = null;
      })
      .addCase(getPublishedTourById.fulfilled, (state, action) => {
        state.isLoadingTour = false;
        state.selectedTour = action.payload;
      })
      .addCase(getPublishedTourById.rejected, (state, action) => {
        state.isLoadingTour = false;
        state.error =
          action.payload || "Unable to load tour details.";
      })

      // Manageable tours.
      .addCase(getMyTours.pending, (state) => {
        state.isLoadingMyTours = true;
        state.error = null;
      })
      .addCase(getMyTours.fulfilled, (state, action) => {
        state.isLoadingMyTours = false;
        state.myTours = action.payload;
      })
      .addCase(getMyTours.rejected, (state, action) => {
        state.isLoadingMyTours = false;
        state.error =
          action.payload || "Unable to load your tours.";
      })

      // Single manageable tour.
      .addCase(getManagedTourById.pending, (state) => {
        state.isLoadingTour = true;
        state.selectedTour = null;
        state.error = null;
      })
      .addCase(getManagedTourById.fulfilled, (state, action) => {
        state.isLoadingTour = false;
        state.selectedTour = action.payload;
      })
      .addCase(getManagedTourById.rejected, (state, action) => {
        state.isLoadingTour = false;
        state.error =
          action.payload || "Unable to load tour details.";
      })

      // Create tour.
      .addCase(createTour.pending, (state) => {
        state.isSavingTour = true;
        state.error = null;
      })
      .addCase(createTour.fulfilled, (state, action) => {
        state.isSavingTour = false;
        state.myTours.unshift(action.payload);
      })
      .addCase(createTour.rejected, (state, action) => {
        state.isSavingTour = false;
        state.error =
          action.payload || "Unable to create tour.";
      })

      // Update tour.
      .addCase(updateTour.pending, (state) => {
        state.isSavingTour = true;
        state.error = null;
      })
      .addCase(updateTour.fulfilled, (state, action) => {
        state.isSavingTour = false;
        state.selectedTour = action.payload;

        const index = state.myTours.findIndex(
          (tour) => tour._id === action.payload._id
        );

        if (index !== -1) {
          state.myTours[index] = action.payload;
        }

        const publicIndex = state.publicTours.findIndex(
          (tour) => tour._id === action.payload._id
        );

        if (publicIndex !== -1) {
          if (action.payload.status === "published") {
            state.publicTours[publicIndex] = action.payload;
          } else {
            state.publicTours.splice(publicIndex, 1);
          }
        }
      })
      .addCase(updateTour.rejected, (state, action) => {
        state.isSavingTour = false;
        state.error =
          action.payload || "Unable to update tour.";
      })

      // Update tour status.
      .addCase(updateTourStatus.pending, (state) => {
        state.isUpdatingStatus = true;
        state.error = null;
      })
      .addCase(updateTourStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        state.selectedTour = action.payload;

        const index = state.myTours.findIndex(
          (tour) => tour._id === action.payload._id
        );

        if (index !== -1) {
          state.myTours[index] = action.payload;
        }

        const publicIndex = state.publicTours.findIndex(
          (tour) => tour._id === action.payload._id
        );

        if (action.payload.status === "published") {
          if (publicIndex === -1) {
            state.publicTours.push(action.payload);
          } else {
            state.publicTours[publicIndex] = action.payload;
          }
        } else if (publicIndex !== -1) {
          state.publicTours.splice(publicIndex, 1);
        }
      })
      .addCase(updateTourStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.error =
          action.payload || "Unable to update tour status.";
      })

      // Delete tour.
      .addCase(deleteTour.pending, (state) => {
        state.isDeletingTour = true;
        state.error = null;
      })
      .addCase(deleteTour.fulfilled, (state, action) => {
        state.isDeletingTour = false;

        state.myTours = state.myTours.filter(
          (tour) => tour._id !== action.payload
        );

        state.publicTours = state.publicTours.filter(
          (tour) => tour._id !== action.payload
        );

        if (state.selectedTour?._id === action.payload) {
          state.selectedTour = null;
        }
      })
      .addCase(deleteTour.rejected, (state, action) => {
        state.isDeletingTour = false;
        state.error =
          action.payload || "Unable to delete tour.";
      });
  },
});

// Export actions.
export const {
  clearTourError,
  clearSelectedTour,
} = tourSlice.actions;

// Export reducer.
export default tourSlice.reducer;
