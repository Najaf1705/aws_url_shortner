import { useEffect, useRef, useState, type ChangeEvent } from "react";
import AuthLayout from "../AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { simpleLogin } from "../../utils/authUtils/login.utils";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [errEntities, setErrEntities] = useState<String>();
    const [err, setErr] = useState<String[]>([]);
    const nameRef = useRef<HTMLInputElement>(null);
    const [sendingOtp, setSendingOtp] = useState<boolean>(false);

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const handleChange = (setter: (v: string) => void) =>
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setter(e.target.value);
            setErrEntities("");
            setErr([]);
        };

    const validate = () => {
        if (!email.trim()) {
            setErr(["Email is required"]);
            setErrEntities("email");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErr(["Enter a valid email"]);
            setErrEntities("email");
            return false;
        }
        setErr([]);
        return true;
    }


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
                    disabled={sendingOtp}
                    onChange={handleChange(setEmail)}
                    required
                    placeholder="najaf@example.com"
                />
            </div>

            <div className="border-t-2 border-text" />

            <div className="flex justify-between px-4 py-3 items-center">
                <Link
                    to="/signup"
                    className="text-sm text-[#4cda91]"
                >
                    Don't have an account? Signup.
                </Link>
                <div className="flex gap-4">
                    <button
                        onClick={usePassword}
                        className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black">
                        Password
                    </button>
                    <button
                        onClick={useOtp}
                        disabled={sendingOtp}
                        className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed">
                        {sendingOtp ? "Sending OTP..." : "OTP"}

                    </button>
                </div>
            </div>
            {err.length > 0 && (
                <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black ">
                    {err.map((e, i) => <div key={i}>{e}</div>)}
                </div>
            )}
        </AuthLayout>
    );
}