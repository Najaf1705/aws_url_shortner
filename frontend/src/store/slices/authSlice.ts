import {
    createSlice,
    type PayloadAction,
} from "@reduxjs/toolkit";

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