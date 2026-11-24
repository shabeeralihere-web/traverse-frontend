
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api.type";
import type { OperatorApplication } from "@/types/operator.type";

// Actual response returned by the pending applications endpoint.
interface PendingApplicationsResponse {
  success: boolean;
  count: number;
  applications: OperatorApplication[];
}

// API error helper.
const getErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;

  return axiosError.response?.data?.message || fallback;
};

// Reject application data.
interface RejectApplicationData {
  applicationId: string;
  rejectionReason: string;
}

// Admin Redux state.
interface AdminState {
  pendingApplications: OperatorApplication[];
  isLoadingApplications: boolean;
  isApprovingApplication: boolean;
  isRejectingApplication: boolean;
  error: string | null;
}

// Initial state.
const initialState: AdminState = {
  pendingApplications: [],
  isLoadingApplications: false,
  isApprovingApplication: false,
  isRejectingApplication: false,
  error: null,
};

// GET: Pending operator applications.
export const getPendingApplications = createAsyncThunk<
  OperatorApplication[],
  void,
  { rejectValue: string }
>(
  "admin/getPendingApplications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<PendingApplicationsResponse>(
        "/api/admin/operator-applications/pending"
      );

      return response.data.applications;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Unable to load operator applications."
        )
      );
    }
  }
);

// PATCH: Approve operator application.
export const approveApplication = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "admin/approveApplication",
  async (applicationId, { rejectWithValue }) => {
    try {
      await api.patch(
        `/api/admin/operator-applications/${applicationId}/approve`
      );

      return applicationId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Unable to approve operator application."
        )
      );
    }
  }
);

// PATCH: Reject operator application.
export const rejectApplication = createAsyncThunk<
  string,
  RejectApplicationData,
  { rejectValue: string }
>(
  "admin/rejectApplication",
  async (
    { applicationId, rejectionReason },
    { rejectWithValue }
  ) => {
    try {
      await api.patch(
        `/api/admin/operator-applications/${applicationId}/reject`,
        { rejectionReason }
      );

      return applicationId;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(
          error,
          "Unable to reject operator application."
        )
      );
    }
  }
);

// Admin slice.
const adminSlice = createSlice({
  name: "admin",
  initialState,

  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Pending applications.
      .addCase(getPendingApplications.pending, (state) => {
        state.isLoadingApplications = true;
        state.error = null;
      })
      .addCase(getPendingApplications.fulfilled, (state, action) => {
        state.isLoadingApplications = false;
        state.pendingApplications = action.payload;
      })
      .addCase(getPendingApplications.rejected, (state, action) => {
        state.isLoadingApplications = false;
        state.error =
          action.payload || "Unable to load operator applications.";
      })

      // Approve application.
      .addCase(approveApplication.pending, (state) => {
        state.isApprovingApplication = true;
        state.error = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        state.isApprovingApplication = false;
        state.pendingApplications = state.pendingApplications.filter(
          (application) => application._id !== action.payload
        );
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.isApprovingApplication = false;
        state.error =
          action.payload || "Unable to approve application.";
      })

      // Reject application.
      .addCase(rejectApplication.pending, (state) => {
        state.isRejectingApplication = true;
        state.error = null;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        state.isRejectingApplication = false;
        state.pendingApplications = state.pendingApplications.filter(
          (application) => application._id !== action.payload
        );
      })
      .addCase(rejectApplication.rejected, (state, action) => {
        state.isRejectingApplication = false;
        state.error =
          action.payload || "Unable to reject application.";
      });
  },
});

// Export actions.
export const { clearAdminError } = adminSlice.actions;

// Export reducer.
export default adminSlice.reducer;
