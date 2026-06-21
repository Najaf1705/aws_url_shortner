import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout as logoutApi } from "../utils/authUtils/logout.utils";
import { logout as logoutAction } from "../store/slices/authSlice";

export default function Profile() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
    const isAuthLoading = useAppSelector((state: any) => state.auth.isLoading);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const handleLogout = async () => {
        setErr(null);
        setLoading(true);
        try {
            await logoutApi();
            dispatch(logoutAction());
        } catch (e: any) {
            setErr(e?.message || "Logout failed");
        } finally {
            setLoading(false);
        }
    };

    // Page layout like NotFound: centered card
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-[min(900px,92vw)] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <span>shorty.najaf.in</span>
                        <span className="border border-text rounded-sm px-1 mx-2">v1</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                        <span className={`w-2.5 h-2.5 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-[13px]">{isAuthenticated ? "Signed in" : "Not signed in"}</span>
                    </div>
                </div>

                <div className="border-t-2 border-text" />

                {/* Body */}
                <div className="pt-6 px-6">
                    <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-3">ACCOUNT</div>

                    {isAuthLoading ? (
                        <div className="text-sm">Loading...</div>
                    ) : !isAuthenticated || !user ? (
                        <div className="text-sm">You must be signed in to view your profile.</div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="font-mono text-[13px] font-extrabold mb-1">Name</div>
                                <div className="text-sm">{user.name ?? "-"}</div>
                            </div>

                            <div>
                                <div className="font-mono text-[13px] font-extrabold mb-1">Email</div>
                                <div className="text-sm">{user.email ?? "-"}</div>
                            </div>

                            <div>
                                <div className="font-mono text-[13px] font-extrabold mb-1">User ID</div>
                                <div className="text-sm pb-2 font-mono break-all">{user.userId ?? "-"}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t-2 border-text" />

                <div className="pb-4 px-6">
                    <div className="pt-2 flex gap-3 justify-end">
                        <button
                            onClick={handleLogout}
                            className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#36ff97] text-black px-4 py-2 font-bold"
                            disabled={!isAuthenticated || loading}
                        >
                            {loading ? "Logging out..." : "Logout"}
                        </button>
                    </div>
                    {err && (
                        <div className="mt-3 text-red-500 font-mono text-[13px]">{err}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
