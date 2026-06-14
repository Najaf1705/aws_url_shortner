import { useEffect, useRef, useState, type ChangeEvent } from "react";
import AuthLayout from "../AuthLayout";
import { simpleLogin } from "../../utils/authUtils/login.utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { getCurrentUser } from "../../utils/authUtils/user.utils";
import { setUser } from "../../store/slices/authSlice";

export default function Password() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [password, setPassword] = useState("");
    const [errEntities, setErrEntities] = useState<String>("");
    const [err, setErr] = useState<String[]>([]);
    const [email] = useState(location.state?.email ?? "");
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        passwordRef.current?.focus();
    }, []);

    const handleChange = (setter: (v: string) => void) =>
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setter(e.target.value);
            setErrEntities("");
            setErr([]);
        };

    const validate = () => {
        if (!password.trim()) {
            setErr(["Password is required"]);
            setErrEntities("password");
            return false;
        }

        setErr([]);
        return true;
    }



    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            await simpleLogin(email, "PASSWORD", password);

            const user = await getCurrentUser();

            dispatch(setUser(user));

            navigate("/", {
                replace: true,
            });
        } catch (err) {
            setErrEntities("password");

            setErr([
                err instanceof Error
                    ? err.message
                    : "Login failed",
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="PASSWORD"
            subtitle="Enter your password"
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
            {err.length > 0 && (
                <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
                    {err.map((e, i) => <div key={i}>{e}</div>)}
                </div>
            )}
        </AuthLayout>
    );
}