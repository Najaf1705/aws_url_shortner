import { useState } from "react";
import AuthLayout from "../AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { useAuthForm, useAutoFocus } from "./useAuthForm";
import { claimGuestLinks } from "../../store/slices/links/linksThunks";
import { loginUser } from "../../store/slices/auth/authThunks";

export default function Password() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [password, setPassword] = useState("");
    const { err, errEntities, handleChange, setFieldError, setErr } = useAuthForm();
    const [email] = useState(location.state?.email ?? "");
    const [loading, setLoading] = useState(false);
    const passwordRef = useAutoFocus<HTMLInputElement>();

    const validate = () => {
        if (!password.trim()) {
            setFieldError("password", ["Password is required"]);
            return false;
        }

        setErr([]);
        return true;
    };



    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            await dispatch(loginUser({ email, loginMode: "PASSWORD", password })).unwrap();
        try {
            await dispatch(claimGuestLinks()).unwrap();
        } catch (error) {
            console.error("Failed to claim guest links", error);
        }

            navigate("/", {
                replace: true,
            });
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            setFieldError("password", [msg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="PASSWORD"
            subtitle="Enter your password"
            err={err}
        >
            <div className="px-4 py-4">

                <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
                    PASSWORD
                </div>

                <input
                    type="password"
                    value={password}
                    disabled={loading}
                    ref={passwordRef}

                    onChange={handleChange(setPassword)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                            handleSubmit();
                        }
                    }}
                    className={`w-full ${errEntities === "password"
                        ? "border-red-500"
                        : "border-[#6b6b6b]"
                        } border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
                />

            </div>

            <div className="border-t-2 border-text" />

            <div className="flex justify-end px-4 py-3 gap-2">

                <button
                    disabled={loading}
                    className="border-2 border-text bg-bg font-mono text-[15px] px-4.5 py-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => navigate(-1)}
                >
                    Go back
                </button>

                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] text-black px-4 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Signing in..." : "Submit"}
                </button>
            </div>
        </AuthLayout>
    );
}
