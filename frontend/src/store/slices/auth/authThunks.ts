import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "./authSlice";
import { fetchLinks } from "../links/linksThunks";

interface LoginPayload {
  email: string;
  loginMode: string;
  password?: string;
  otpId?: string;
  otp?: string;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
  otp?: string;
  otpId?: string;
}

interface AuthResult {
  user?: User | null;
  requiresOtp?: boolean;
  otpId?: string;
  loginMode?: string;
}

const normalizeError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data || error.message;
  }

  return error instanceof Error ? error.message : String(error);
};

const getAuthBase = () => import.meta.env.VITE_AUTH_BASE as string | undefined;

const getCurrentUserFromApi = async (): Promise<User> => {
  const AUTH_BASE = getAuthBase();
  const res = await axios.get(`${AUTH_BASE}/me`, { withCredentials: true });
  return res.data as User;
};

const fetchUserLinksWithRetry = async (dispatch: any) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await dispatch(fetchLinks()).unwrap();
      return;
    } catch {
      if (attempt === 1) {
        throw new Error("Failed to fetch links");
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
};

export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const user = await getCurrentUserFromApi();
      await fetchUserLinksWithRetry(thunkAPI.dispatch).catch(() => undefined);
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeError(error));
    }
  }
);

export const loginUser = createAsyncThunk<AuthResult, LoginPayload, { rejectValue: string }>(
  "auth/loginUser",
  async (payload, thunkAPI) => {
    try {
      const AUTH_BASE = getAuthBase();
      const res = await axios.post(
        `${AUTH_BASE}/login`,
        {
          email: payload.email,
          password: payload.password,
          otpId: payload.otpId,
          otp: payload.otp,
          loginMode: payload.loginMode,
        },
        { withCredentials: true }
      );

      const data = res.data ?? {};
      if (data?.code === "EMAIL_VERIFICATION_REQUIRED" || data?.otpId) {
        return {
          requiresOtp: true,
          otpId: data?.otpId,
          loginMode: payload.loginMode,
        };
      }

      const user = await getCurrentUserFromApi();
      await fetchUserLinksWithRetry(thunkAPI.dispatch).catch(() => undefined);
      return { user };
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeError(error));
    }
  }
);

export const signupUser = createAsyncThunk<AuthResult, SignupPayload, { rejectValue: string }>(
  "auth/signupUser",
  async (payload, thunkAPI) => {
    try {
      const AUTH_BASE = getAuthBase();
      const res = await axios.post(
        `${AUTH_BASE}/signup`,
        {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          otpId: payload.otpId,
          otp: payload.otp,
        },
        { withCredentials: true }
      );

      const data = res.data ?? {};
      if (data?.code === "EMAIL_VERIFICATION_REQUIRED" || data?.otpId) {
        return {
          requiresOtp: true,
          otpId: data?.otpId,
        };
      }

      const user = await getCurrentUserFromApi();
      await fetchUserLinksWithRetry(thunkAPI.dispatch).catch(() => undefined);
      return { user };
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeError(error));
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const AUTH_BASE = getAuthBase();
      await axios.post(`${AUTH_BASE}/logout`, {}, { withCredentials: true });
    } catch (error) {
      return rejectWithValue(normalizeError(error));
    }
  }
);

export interface GoogleAuthResult {
  user?: User | null;
  requiresPassword?: boolean;
  email?: string;
  status?: string;
}

export const authenticateWithGoogle = createAsyncThunk<
  GoogleAuthResult,
  { idToken: string; password?: string },
  { rejectValue: string }
>(
  "auth/authenticateWithGoogle",
  async ({ idToken, password }, thunkAPI) => {
    try {
      const AUTH_BASE = getAuthBase();
      const res = await axios.post(
        `${AUTH_BASE}/google`,
        { idToken, password },
        { withCredentials: true, validateStatus: (status) => status < 500 }
      );

      if (res.status === 200) {
        const user = await getCurrentUserFromApi();
        return { user };
      }

      if (res.status === 202 || res.data?.status === "INCOMPLETE_SIGNUP") {
        return {
          requiresPassword: true,
          email: res.data?.email,
          status: res.data?.status,
        };
      }

      return thunkAPI.rejectWithValue(res.data?.message || "Google authentication failed");
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeError(error));
    }
  }
);
