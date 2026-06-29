import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { formatExpireAt } from "../utils/formatExpireAt";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { deleteLink } from "../store/slices/links/linksThunks";

export default function LinkDetail() {
    const { code } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [link, setLink] = useState<any | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const storeLink = useAppSelector((s) =>
        (s.links.links || []).find((l) => l.code === code)
    );

    const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

    useEffect(() => {
        if (!code) return;
        setLoading(true);
        setError(null);
        if (storeLink) {
            setLink(storeLink);
        } else {
            // Do not fall back to API; if it's not in redux, treat as not found
            setLink(null);
        }

        setLoading(false);
    }, [code, storeLink]);

    if (loading) return <div>Loading...</div>;
    if (error) return (
        <div>
            <p>Error: {error}</p>
            <RouterLink to="/">Back home</RouterLink>
        </div>
    );

    const SHORT_BASE = (import.meta.env.VITE_SHORT_BASE as string) || "https://short.najaf.in";
    const shortUrl = link ? `${SHORT_BASE}/${link.code}` : `${SHORT_BASE}/${code}`;

    const copyShort = async () => {
        try {
            await navigator.clipboard.writeText(shortUrl);
        } catch {
            console.error("Copy failed");
        }
    };

    const handleDelete = async () => {
        if (!code || !link) return;
        setDeleting(true);
        setDeleteError(null);

        try {
            await dispatch(deleteLink(code)).unwrap();
            setShowDeleteModal(false);
            navigate("/links", { replace: true });
        } catch (err: any) {
            setDeleteError(err ?? "Unable to delete link");
        } finally {
            setDeleting(false);
        }
    };

    // Render single card with header; body switches between Not Found and Details
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-[min(900px,92vw)] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">

                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <RouterLink title="Links" to="/links" replace className="text-2xl">{"<"}</RouterLink>
                        <div>
                            <span>{"Shorty -> "}</span>
                            <a href={shortUrl} target="_blank" rel="noreferrer" className="text-[#4cda91]">{shortUrl}</a>

                        </div>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                        <span className={`w-2.5 h-2.5 rounded-full ${isAuthenticated ? "bg-green-500" : "bg-red-500"}`} />
                        <span className="text-[13px]">{isAuthenticated ? "Signed in" : "Not signed in"}</span>
                    </div>
                </div>

                <div className="border-t-2 border-text" />

                <div className="pt-6 pb-4 px-6">
                    {link ? (
                        <>
                            <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-3">SHORT DETAILS</div>

                            <div className="space-y-4">
                                <div>
                                    <div className="font-mono text-[13px] font-extrabold mb-1">Code</div>
                                    <div className="text-sm break-all">{link.code}</div>
                                </div>

                                <div>
                                    <div className="font-mono text-[13px] font-extrabold mb-1">Destination</div>
                                    <div className="text-sm break-all">
                                        <a href={link.longUrl} target="_blank" rel="noreferrer" className="text-[#4cda91]">{link.longUrl}</a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pb-2">
                                    <div>
                                        <div className="font-mono text-[13px] font-extrabold mb-1">Clicks</div>
                                        <div className="text-sm">{link.clickCount ?? 0}</div>
                                    </div>
                                    <div>
                                        <div className="font-mono text-[13px] font-extrabold mb-1">Created</div>
                                        <div className="text-sm">{formatExpireAt(link.createdAt)}</div>
                                    </div>
                                    <div>
                                        <div className="font-mono text-[13px] font-extrabold mb-1">Expires</div>
                                        <div className="text-sm">{formatExpireAt(link.expireAt)}</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-3">Not Found</div>
                            <div className="text-sm">The short code <span className="font-mono text-[#4cda91]">{code}</span> was not found in your account or has expired.</div>
                        </>
                    )}
                </div>

                <div className="border-t-2 border-text" />

                <div className="pb-0 px-6">
                    <div className="py-2 flex gap-3 justify-end">
                        {link ? (
                            <>
                                <button type="button" onClick={copyShort} title="Copy short URL" className="min-w-20 flex-1 rounded border border-[#4cda91] bg-[#96fac3] px-3 py-2 text-sm text-black hover:bg-[#66ffab] cursor-pointer sm:flex-none">Copy</button>
                                <button type="button" onClick={() => window.open(shortUrl, "_blank")} title="Visit short URL" className="min-w-20 flex-1 rounded border border-text bg-bg px-3 py-2 text-sm text-text hover:bg-[#787878] cursor-pointer sm:flex-none">Visit</button>
                                <button type="button" onClick={() => setShowDeleteModal(true)} title="Delete link" className="min-w-20 flex-1 rounded border border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-500 hover:bg-red-500/20 cursor-pointer sm:flex-none">Delete</button>
                            </>
                        ) : (
                            <RouterLink to="/links" className="text-sm text-[#4cda91]">Back to links</RouterLink>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && link ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-md border-2 border-text bg-bg p-6 shadow-[0_18px_90px_rgba(0,203,210,.25)]">
                        <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-3">Confirm Delete</div>
                        <p className="text-sm text-text">Delete this short link <span className="font-mono text-[#4cda91]">{code}</span>? This action cannot be undone.</p>
                        {deleteError ? <p className="mt-3 text-sm text-red-500">{deleteError}</p> : null}
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowDeleteModal(false)} className="rounded border border-text bg-bg px-3 py-2 text-sm text-text hover:bg-[#787878] cursor-pointer">Cancel</button>
                            <button type="button" onClick={handleDelete} disabled={deleting} className="rounded border border-red-500 bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600 cursor-pointer disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}