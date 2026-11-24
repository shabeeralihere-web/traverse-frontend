
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registerLoading: boolean;
  loginLoading: boolean;
  logoutLoading: boolean;
  initialized: boolean;
  error: string | null;
}

interface ApiError {
  message: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: User["role"];
  };
}

interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: User["role"];
  };
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  registerLoading: false,
  loginLoading: false,
  logoutLoading: false,
  initialized: false,
  error: null,
};

// Register traveler and automatically authenticate.
export const registerUser = createAsyncThunk<
  User,
  RegisterData,
  { rejectValue: string }
>("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>(
      "/api/auth/register",
      userData
    );

    const user = response.data.user;

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    return rejectWithValue(
      axiosError.response?.data?.message || "Registration failed."
    );
  }
});

// Login traveler.
export const loginUser = createAsyncThunk<
  User,
  LoginData,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );

    const user = response.data.user;

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    return rejectWithValue(
      axiosError.response?.data?.message || "Login failed."
    );
  }
});

// Get currently logged-in user.
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<MeResponse>("/api/auth/me");

    const user = response.data.user;

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    return rejectWithValue(
      axiosError.response?.data?.message || "Unable to get user."
    );
  }
});

// Logout traveler.
export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    return rejectWithValue(
      axiosError.response?.data?.message || "Logout failed."
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Register
      .addCase(registerUser.pending, (state) => {
        state.registerLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.registerLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerLoading = false;
        state.error = action.payload || "Registration failed.";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload || "Login failed.";
      })

      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.initialized = true;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.logoutLoading = false;
        state.error = action.payload || "Logout failed.";
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
