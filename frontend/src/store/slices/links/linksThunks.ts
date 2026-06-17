import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LinkItem } from "../../../types";
import axios from "axios";

export const fetchLinks = createAsyncThunk<
  LinkItem[],
  void,
  { rejectValue: string }
>(
  "links/fetchLinks",
  async (_, { rejectWithValue }) => {
    try {
      const AUTH_BASE = import.meta.env.VITE_API_BASE as string | undefined;
    const res = await axios.get(
        `${AUTH_BASE}/links`,
        {
            withCredentials: true,
        }
    );

    if (res.status < 200 || res.status >= 300) {
      return rejectWithValue("Failed to fetch links");
    }

    return res.data.links as LinkItem[];

    } catch (err) {
      return rejectWithValue("Network error");
    }
  }
);