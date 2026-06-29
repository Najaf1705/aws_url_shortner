import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";
import {
    fetchCurrentUser,
    loginUser,
    logoutUser,
    signupUser,
} from "./authThunks";

export interface User {
    userId?: string;
    email: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isAuthLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isAuthLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthLoading: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.isAuthLoading =
                action.payload;
        },

        setUser: (
            state,
            action: PayloadAction<User>
        ) => {
            state.user =
                action.payload;

            state.isAuthenticated = true;
            state.error = null;
        },

        clearUser: (state)=>{
            state.user=null;
            state.isAuthenticated=false;
        },

        setError: (
            state,
            action: PayloadAction<string>
        ) => {
            state.error =
                action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },

        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isAuthLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isAuthLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isAuthLoading = false;
                state.error = null;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isAuthLoading = false;
                state.error = action.payload ?? "Failed to fetch user";
            })
            .addCase(loginUser.pending, (state) => {
                state.isAuthLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                if (action.payload.user) {
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                }
                state.isAuthLoading = false;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isAuthLoading = false;
                state.error = action.payload ?? "Login failed";
            })
            .addCase(signupUser.pending, (state) => {
                state.isAuthLoading = true;
                state.error = null;
            })
            .addCase(signupUser.fulfilled, (state, action) => {
                if (action.payload.user) {
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                } else {
                    state.user = null;
                    state.isAuthenticated = false;
                }
                state.isAuthLoading = false;
                state.error = null;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isAuthLoading = false;
                state.error = action.payload ?? "Signup failed";
            })
            .addCase(logoutUser.pending, (state) => {
                state.isAuthLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isAuthLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isAuthLoading = false;
                state.error = action.payload ?? "Logout failed";
            });
    },
});

export const {
    setAuthLoading,
    setUser,
    clearUser,
    setError,
    clearError,
    logout,
} = authSlice.actions;

export default authSlice.reducer;