
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { OperatorRegisterFormValues } from "@/lib/validation";
import type { OperatorApplication } from "@/types/operator.type";

interface OperatorApplicationResult {
  id: string;
  businessName: string;
  status: "pending";
  createdAt: string;
}

interface OperatorRegistrationResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "traveler";
    createdAt: string;
  };
  application: OperatorApplicationResult;
}

interface MyApplicationResponse {
  success: boolean;
  application: OperatorApplication | null;
}

interface ApiError {
  message: string;
}

interface OperatorState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  application: OperatorApplicationResult | null;

  // Logged-in user's operator application
  myApplication: OperatorApplication | null;
  isLoadingApplication: boolean;
}

const initialState: OperatorState = {
  isLoading: false,
  error: null,
  successMessage: null,
  application: null,

  myApplication: null,
  isLoadingApplication: false,
};

// Register a new operator account
export const registerOperator = createAsyncThunk<
  OperatorRegistrationResponse,
  OperatorRegisterFormValues,
  { rejectValue: string }
>(
  "operator/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post<OperatorRegistrationResponse>(
        "/api/operators/register",
        formData
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;

      return rejectWithValue(
        axiosError.response?.data?.message ||
          "Operator registration failed. Please try again."
      );
    }
  }
);

// Fetch the logged-in user's operator application
export const getMyOperatorApplication = createAsyncThunk<
  MyApplicationResponse,
  void,
  { rejectValue: string }
>(
  "operator/getMyApplication",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<MyApplicationResponse>(
        "/api/operators/my-application"
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;

      // A normal traveler may not have an operator application.
      if (axiosError.response?.status === 404) {
        return {
          success: true,
          application: null,
        };
      }

      return rejectWithValue(
        axiosError.response?.data?.message ||
          "Failed to load your operator application."
      );
    }
  }
);

const operatorSlice = createSlice({
  name: "operator",
  initialState,
  reducers: {
    clearOperatorError: (state) => {
      state.error = null;
    },

    clearOperatorRegistration: (state) => {
      state.error = null;
      state.successMessage = null;
      state.application = null;
    },

    clearMyOperatorApplication: (state) => {
      state.myApplication = null;
      state.isLoadingApplication = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Operator registration
      .addCase(registerOperator.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
        state.application = null;
      })
      .addCase(registerOperator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        state.application = action.payload.application;
      })
      .addCase(registerOperator.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Operator registration failed.";
      })

      // Fetch operator application
      .addCase(getMyOperatorApplication.pending, (state) => {
        state.isLoadingApplication = true;
        state.myApplication = null;
        state.error = null;
      })
      .addCase(getMyOperatorApplication.fulfilled, (state, action) => {
        state.isLoadingApplication = false;
        state.myApplication = action.payload.application;
      })
      .addCase(getMyOperatorApplication.rejected, (state, action) => {
        state.isLoadingApplication = false;
        state.myApplication = null;
        state.error =
          action.payload || "Failed to load your operator application.";
      });
  },
});

export const {
  clearOperatorError,
  clearOperatorRegistration,
  clearMyOperatorApplication,
} = operatorSlice.actions;

export default operatorSlice.reducer;
