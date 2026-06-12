import axios from "axios";

export async function getCurrentUser() {
    const AUTH_BASE = import.meta.env.VITE_AUTH_BASE as string | undefined;
    const res = await axios.get(
        `${AUTH_BASE}/me`,
        {
            withCredentials: true,
        }
    );

    return res.data;
}