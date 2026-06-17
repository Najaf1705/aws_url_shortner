import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchLinks } from "../store/slices/links/linksThunks";

export default function LinksTable() {
    const dispatch = useAppDispatch();
    const SHORT_BASE = (import.meta.env.VITE_SHORT_BASE as string) || "https://short.najaf.in";
    const { links, isLoading: linksIsLoading, error } = useAppSelector((state) => state.links);

    const copy = async (code: string) => {
        const url = `${SHORT_BASE}/${code}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        dispatch(fetchLinks());
    }, [dispatch]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
                <div className="w-full max-w-[980px] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">
                    <div className="px-3 py-5 text-center font-mono text-sm text-red-600 sm:px-4 sm:py-6 sm:text-base">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
            <div className="w-full max-w-245 rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">
                <h1 className="px-3 py-3 text-xl font-semibold sm:px-4 sm:py-4 sm:text-2xl">Your Shorties</h1>
                <div className="border-t-2 border-text" />

                <div className="px-2 py-2.5 sm:px-4 sm:py-3.5">
                    <style>{`
                        .links-list { max-height: min(62vh, 620px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--text) rgba(255,255,255,0.06); }
                        .links-list-row:nth-child(odd) { background: color-mix(in srgb, var(--text) 5%, var(--bg)); }
                        .links-list-row:nth-child(even) { background: color-mix(in srgb, #4cda91 12%, var(--bg)); }
                        .links-list-row:hover { background: color-mix(in srgb, #4cda91 20%, var(--bg)); }
                        .links-scroll::-webkit-scrollbar { height: 10px; width: 10px; }
                        .links-scroll::-webkit-scrollbar-thumb { background: var(--text); border-radius: 8px; }
                        .links-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); }
                    `}</style>

                    <div className="links-list links-scroll flex flex-col font-mono">
                        {linksIsLoading ? (
                            <div className="px-3 py-8 text-center text-text">Loading...</div>
                        ) : links.length === 0 ? (
                            <div className="px-3 py-8 text-center text-text">No links found</div>
                        ) : (
                            links.map((l) => {
                                const shortUrl = `${SHORT_BASE}/${l.code}`;

                                return (
                                    <div key={l.code} className="links-list-row flex flex-col gap-3 px-2.5 py-3 sm:flex-row sm:items-center sm:px-3 md:px-4">
                                        <div className="min-w-0 flex-1">
                                            <a href={shortUrl} target="_blank" rel="noreferrer" className="block w-fit max-w-full text-sm font-semibold leading-snug text-[#4cda91] break-all sm:text-base">
                                                {shortUrl}
                                            </a>
                                            <div title={l.longUrl} className="mt-1.5 max-w-full truncate text-xs leading-relaxed text-text/70 sm:mt-2 sm:text-[13px] md:text-sm">
                                                {l.longUrl}
                                            </div>
                                        </div>

                                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
                                            <button type="button" onClick={() => copy(l.code)} title="Copy short URL" className="min-w-20 flex-1 rounded border border-[#4cda91] bg-[#96fac3] px-3 py-2 text-sm text-black hover:bg-[#66ffab] cursor-pointer sm:flex-none">
                                                Copy
                                            </button>
                                            <button type="button" onClick={() => window.open(shortUrl, "_blank")} title="Visit short URL" className="min-w-20 flex-1 rounded border border-text bg-bg px-3 py-2 text-sm text-text hover:bg-[#787878] cursor-pointer sm:flex-none">
                                                Visit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
