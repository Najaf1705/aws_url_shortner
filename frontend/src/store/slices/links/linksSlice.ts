import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchLinks,
  createLink,
  deleteLink,
  claimGuestLinks,
} from "./linksThunks";
import type { LinkItem } from "../../../types";

export interface QuotaInfo {
  freeLinksUsed: number;
  freeLinksLimit: number;
  freeLinksRemaining: number;
  extraLinkCost: number;
  extensionCost: number;
}

interface UserLinksState {
  links: LinkItem[];
  isLoading: boolean;
  error: string | null;
  quota: QuotaInfo | null;
}

const initialState: UserLinksState = {
  links: [],
  isLoading: false,
  error: null,
  quota: null,
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    clearLinks: (state) => {
      state.links = [];
      state.error = null;
      state.isLoading = false;
      state.quota = null;
    },
    addLink: (state, action: PayloadAction<LinkItem>) => {
      // Prepend new link so it appears at top of list
      state.links = [action.payload, ...state.links];
    },
    removeLink: (state, action: PayloadAction<string>) => {
      state.links = state.links.filter((link) => link.code !== action.payload);
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
        (state, action: PayloadAction<{ links: LinkItem[]; quota: QuotaInfo | null }>) => {
          state.isLoading = false;
          state.links = action.payload.links;
          state.quota = action.payload.quota;
        }
      )
      .addCase(fetchLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? "Something went wrong";
      })
      .addCase(createLink.fulfilled, (state, action) => {
        if ((action.payload as any).paymentRequired) {
          state.error = "Payment required to create more links";
          return;
        }

        const payload = action.payload as { link: LinkItem };
        state.links = [payload.link, ...state.links];
      })
      .addCase(createLink.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to create link";
      })
      .addCase(deleteLink.fulfilled, (state, action) => {
        state.links = state.links.filter((link) => link.code !== action.payload);
      })
      .addCase(deleteLink.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to delete link";
      })
      .addCase(claimGuestLinks.fulfilled, () => {
        // claimed guest links are handled by fetchLinks in the thunk
      })
      .addCase(claimGuestLinks.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to claim guest links";
      });
  },
});

export const { clearLinks, addLink, removeLink } = linksSlice.actions;
export default linksSlice.reducer;