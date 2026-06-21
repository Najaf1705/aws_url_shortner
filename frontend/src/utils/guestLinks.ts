import axios from "axios";

export async function claimGuestLinks() {
    const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

    if (!API_BASE) return 0;

    const res = await axios.post(
        `${API_BASE}/links/claim`,
        {},
        {
            withCredentials: true,
        }
    );

    return res.data.claimed ?? 0;
}
