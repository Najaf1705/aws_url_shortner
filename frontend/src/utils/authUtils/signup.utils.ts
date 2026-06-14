import axios from "axios";


export async function simpleSignup(name: string, email: string, password: string, otp?: string, otpId?: string): Promise<any> {
    try {
        const AUTH_BASE = import.meta.env.VITE_AUTH_BASE as string | undefined;
        const res = await axios.post(
            `${AUTH_BASE}/signup`,
            { name, email, password, otpId, otp },
            {
                withCredentials: true,
            }
        );
        return res.data;
    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                error.response?.data?.message || error.response?.data || error.message
            );
        }
        throw new Error(String(error));
    }
}