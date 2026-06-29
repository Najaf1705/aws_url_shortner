import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LinkItem } from "../../../types";
import type { QuotaInfo } from "./linksSlice";
import axios from "axios";

const getApiBase = () => import.meta.env.VITE_API_BASE as string | undefined;

export const fetchLinks = createAsyncThunk<
  { links: LinkItem[]; quota: QuotaInfo | null },
  void,
  { rejectValue: string }
>(
  "links/fetchLinks",
  async (_, { rejectWithValue }) => {
    try {
      const AUTH_BASE = getApiBase();
      if (!AUTH_BASE) {
        return rejectWithValue("API base is not configured");
      }

      const res = await axios.get(`${AUTH_BASE}/links`, {
        withCredentials: true,
      });

      if (res.status < 200 || res.status >= 300) {
        return rejectWithValue("Failed to fetch links");
      }

      return {
        links: res.data.links as LinkItem[],
        quota: res.data.quota as QuotaInfo | null,
      };
    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);

export interface CreateLinkPayload {
  longUrl: string;
  expiresAt: number;
  alias?: string;
}

interface CreateLinkSuccess {
  link: LinkItem;
}

interface CreateLinkPaymentRequired {
  paymentRequired: true;
  paymentId: string;
  cost: number;
  purpose: string;
}

export const createLink = createAsyncThunk<
  CreateLinkSuccess | CreateLinkPaymentRequired,
  CreateLinkPayload,
  { rejectValue: string }
>(
  "links/createLink",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_BASE = getApiBase();
      if (!AUTH_BASE) {
        return rejectWithValue("API base is not configured");
      }

      const res = await axios.post(`${AUTH_BASE}/link`, payload, {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 402) {
        return {
          paymentRequired: true,
          paymentId: res.data.paymentId,
          cost: res.data.cost,
          purpose: res.data.purpose,
        };
      }

      if (res.status < 200 || res.status >= 300) {
        return rejectWithValue(res.data?.message || "Failed to create link");
      }

      const link: LinkItem = {
        code: res.data.code,
        longUrl: payload.longUrl,
        clickCount: 0,
        createdAt: Math.floor(Date.now() / 1000),
        expireAt: res.data.expireAt,
      };

      return { link };
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      return rejectWithValue(message);
    }
  }
);

export const deleteLink = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "links/deleteLink",
  async (code, { rejectWithValue }) => {
    try {
      const AUTH_BASE = getApiBase();
      if (!AUTH_BASE) {
        return rejectWithValue("API base is not configured");
      }

      const res = await axios.delete(`${AUTH_BASE}/link/${code}`, {
        withCredentials: true,
      });

      if (res.status < 200 || res.status >= 300) {
        return rejectWithValue(res.data?.message || "Failed to delete link");
      }

      return code;
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      return rejectWithValue(message);
    }
  }
);

export const claimGuestLinks = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>(
  "links/claimGuestLinks",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const AUTH_BASE = getApiBase();
      if (!AUTH_BASE) {
        return rejectWithValue("API base is not configured");
      }

      const res = await axios.post(
        `${AUTH_BASE}/links/claim`,
        {},
        { withCredentials: true }
      );

      await dispatch(fetchLinks());

      return res.data?.claimed ?? 0;
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      return rejectWithValue(message);
    }
  }
);

export const initiatePayment = createAsyncThunk<
  { paymentId: string; amount: number; purpose: string },
  { purpose: "extra-link" | "alias-creation" | "extend-30days"; linkCode?: string; days?: number },
  { rejectValue: string }
>(
  "links/initiatePayment",
  async (payload, { rejectWithValue }) => {
    try {
      const AUTH_BASE = getApiBase();
      if (!AUTH_BASE) {
        return rejectWithValue("API base is not configured");
      }

      const res = await axios.post(`${AUTH_BASE}/payment/initiate`, payload, {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status < 200 || res.status >= 300) {
        return rejectWithValue(res.data?.message || "Failed to initiate payment");
      }

      return {
        paymentId: res.data.paymentId,
        amount: res.data.amount,
        purpose: res.data.purpose,
      };
    } catch (err: any) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : String(err);
      return rejectWithValue(message);
    }
  }
);
