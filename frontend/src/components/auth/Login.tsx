import { useState } from "react";
import AuthLayout from "../AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { simpleLogin } from "../../utils/authUtils/login.utils";
import { useAuthForm, useAutoFocus } from "./useAuthForm";
import GoogleButton from "./GoogleButton";
import { useAppSelector } from "../../store/hooks";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const { err, errEntities, handleChange, setFieldError, setErr } = useAuthForm();
    const nameRef = useAutoFocus<HTMLInputElement>();
    const [sendingOtp, setSendingOtp] = useState<boolean>(false);
    const isAuthLoading = useAppSelector((s) => s.auth.isAuthLoading);

    const validate = () => {
        if (!email.trim()) {
            setFieldError("email", ["Email is required"]);
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError("email", ["Enter a valid email"]);
            return false;
        }
        setErr([]);
        return true;
    };


    async function usePassword() {
        console.log(email, "Pass opted");
        if (!validate()) return;
        navigate("/password", {
            state: {
                email,
            },
        });

    }

    async function useOtp() {
        console.log(email, "Otp opted");
        if (!validate()) return;
        setSendingOtp(true);
        const res = await simpleLogin(email, "OTP");
        setSendingOtp(false);
        console.log("OTP: ", res)
        navigate("/otp", {
            state: {
                email,
                otpId: res.otpId,
                loginMode: "OTP",
                mode: "login"
            },
        });

    }

    return (
        <AuthLayout
            title="LOGIN"
            subtitle="Enter your email to continue"
            err={err}
        >
            <div className="px-4 py-4">

                <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
                    EMAIL
                </div>

                <input
                    className={`w-full ${errEntities === "email" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:opacity-50 disabled:cursor-not-allowed`}
                    type="email"
                    value={email}
                    ref={nameRef}
                    disabled={sendingOtp || isAuthLoading}
                    onChange={handleChange(setEmail)}
                    required
                    placeholder="najaf@example.com"
                />
            </div>

            <div className="border-t-2 border-text" />

            <div className="flex justify-end px-4 py-3 items-center">
                <div className="flex gap-4">
                    <GoogleButton />

                    <button
                        onClick={usePassword}
                        disabled={isAuthLoading}
                        className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed">
                        {isAuthLoading ? "Signing in..." : "Password"}
                    </button>
                    <button
                        onClick={useOtp}
                        disabled={sendingOtp || isAuthLoading}
                        className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed">
                        {sendingOtp ? "Sending OTP..." : isAuthLoading ? "Signing in..." : "OTP"}
                    </button>
                </div>
            </div>
            <div className="flex flex-col items-end gap-3 pb-4 px-4">
                <Link
                    to="/signup"
                    className="text-sm text-[#4cda91]"
                >
                    Don't have an account? Signup.
                </Link>      </div>
        </AuthLayout>
    );
}