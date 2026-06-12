import axios from "axios";

export async function getCurrentUser() {
    const res = await axios.get(
        `${import.meta.env.VITE_AUTH_BASE}/me`,
        {
            withCredentials: true,
        }
    );

    return res.data;
}