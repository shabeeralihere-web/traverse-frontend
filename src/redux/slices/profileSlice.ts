
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "@/lib/axios";
import type { User } from "@/types";
import type { ApiResponse } from "@/types/api.type";

interface ProfileState {
  profile: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isUploadingPhoto: boolean;
  error: string | null;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isUpdating: false,
  isUploadingPhoto: false,
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiResponse<unknown>>;

  return axiosError.response?.data?.message || fallback;
};

// Fetch logged-in user's profile.
export const getMyProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("profile/getMyProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<User>>("/api/profile");

    return response.data.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to load your profile.")
    );
  }
});

// Update name, phone and bio.
export const updateMyProfile = createAsyncThunk<
  User,
  UpdateProfileData,
  { rejectValue: string }
>("profile/updateMyProfile", async (profileData, { rejectWithValue }) => {
  try {
    const response = await api.patch<ApiResponse<User>>(
      "/api/profile",
      profileData
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to update your profile.")
    );
  }
});

// Upload profile photo to Cloudinary through the backend.
export const uploadMyProfilePhoto = createAsyncThunk<
  User,
  File,
  { rejectValue: string }
>("profile/uploadMyProfilePhoto", async (photo, { rejectWithValue }) => {
  try {
    const formData = new FormData();

    formData.append("profilePhoto", photo);

    const response = await api.post<ApiResponse<User>>(
      "/api/profile/photo",
      formData
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to upload your profile photo.")
    );
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,

  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },

    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Get profile
      .addCase(getMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Unable to load your profile.";
      })

      // Update profile
      .addCase(updateMyProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Unable to update your profile.";
      })

      // Upload profile photo
      .addCase(uploadMyProfilePhoto.pending, (state) => {
        state.isUploadingPhoto = true;
        state.error = null;
      })
      .addCase(uploadMyProfilePhoto.fulfilled, (state, action) => {
        state.isUploadingPhoto = false;
        state.profile = action.payload;
      })
      .addCase(uploadMyProfilePhoto.rejected, (state, action) => {
        state.isUploadingPhoto = false;
        state.error =
          action.payload || "Unable to upload your profile photo.";
      });
  },
});

export const { clearProfileError, clearProfile } = profileSlice.actions;

export default profileSlice.reducer;
