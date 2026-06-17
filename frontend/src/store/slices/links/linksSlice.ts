import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { fetchLinks } from "./linksThunks";
import type { LinkItem } from "../../../types";

interface UserLinksState {
  links: LinkItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserLinksState = {
  links: [],
  isLoading: false,
  error: null,
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    clearLinks: (state) => {
      state.links = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchLinks.fulfilled,
        (state, action: PayloadAction<LinkItem[]>) => {
          state.isLoading = false;
          state.links = action.payload;
        }
      )
      .addCase(fetchLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? "Something went wrong";
      });
  },
});

export const { clearLinks } = linksSlice.actions;
export default linksSlice.reducer;