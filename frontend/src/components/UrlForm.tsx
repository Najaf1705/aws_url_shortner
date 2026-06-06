
type Props = {
    longUrl: string;
    setLongUrl: (v: string) => void;
    expirySeconds: number;
    setExpirySeconds: (v: number) => void;
    useDefaultExpiry: boolean;
    setUseDefaultExpiry: (v: boolean) => void;
    loading: boolean;
    err: string[];
    createShortUrl: () => void;
    fillExample: () => void;
};

export default function UrlForm({ longUrl, setLongUrl, expirySeconds, setExpirySeconds, setUseDefaultExpiry, useDefaultExpiry, createShortUrl, loading, fillExample, err}: Props) {
    return (
        <>
            <div className="px-4 py-3.5 ">

                <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">DESTINATION URL</div>
                <input
                    className="w-full border-2 border-[#6b6b6b] px-3 py-2.5 font-mono text-[15px] outline-none focus:border-[#111]"
                    type="url"
                    inputMode="url"
                    required
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://najaf.in"
                    spellCheck={false}
                />
                <div className="mt-1.5 font-mono text-text text-[13px]">Must include protocol (https:// or http://)</div>

                <div className="grid grid-cols-[2.2fr_1fr] gap-4.5 mt-3.5 items-start max-sm:grid-cols-1">
                    <div>
                        <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">EXPIRY (SECONDS)</div>
                        <input
                            className="w-full border-2 border-[#6b6b6b] px-3 py-2.5 font-mono text-[15px] outline-none focus:border-[#111] disabled:opacity-60"
                            type="number"
                            value={expirySeconds}
                            onChange={(e) => setExpirySeconds(Number(e.target.value))}
                            disabled={useDefaultExpiry}
                            min={60}
                            step={60}
                        />
                        <div className="mt-1.5 font-mono text-text text-[13px]">Leave blank for API default (~24h)</div>
                    </div>

                    <div>
                        <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">DEFAULT EXPIRY</div>
                        <label className="inline-flex items-center gap-3 border-2 border-[#6b6b6b] px-3 py-2 bg-bg cursor-pointer">
                            <span className="relative w-13.5 h-7 inline-block shrink-0">
                                <input
                                    type="checkbox"
                                    className="opacity-0 w-0 h-0 absolute"
                                    checked={useDefaultExpiry}
                                    onChange={(e) => setUseDefaultExpiry(e.target.checked)}
                                />
                                <span
                                    className="absolute inset-0 rounded-full transition-colors duration-150"
                                    style={{ background: useDefaultExpiry ? "#7fa7ff" : "grey" }}
                                >
                                    <span
                                        className="absolute top-1 left-1 w-5 h-5 rounded-full transition-transform duration-150"
                                        style={{
                                            background: useDefaultExpiry ? "#002564" : "white",
                                            transform: useDefaultExpiry ? "translateX(26px)" : "translateX(0)",
                                        }}
                                    />
                                </span>
                            </span>
                            <span className="font-mono text-[14px]">Use API default</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-text" />


            <div className="flex items-center justify-end gap-3 px-4 py-3.5">
                <button
                    className="border-2 border-text bg-text text-bg px-4.5 py-2.5 text-[15px] cursor-pointer shadow-[0_1px_0_rgba(0,0,0,.15)] disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={fillExample}
                    disabled={loading}
                >
                    Fill example
                </button>

                <button
                    className="btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] text-black px-4.5 py-2.5 font-bold text-[15px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={createShortUrl}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Short URL"}
                </button>
            </div>

            {err.length > 0 && (
              <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
                {err.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}

        </>
    )
}
