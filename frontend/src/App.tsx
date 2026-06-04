import { useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";

type CreateResponse = {
  code: string;
  expireAt: number;
};

function formatExpireAt(expireAt: number) {
  const d = new Date(expireAt * 1000);
  return d.toLocaleString();
}

function nowHHMMSS() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function IconCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V8Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M7 18H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5h5v5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 14 19 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M19 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconDoubleCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.5 12.5 10 15l5-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 12.5 15 15l5-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type CopyKey = "code" | "shortUrl" | "origin" | null;

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

  const [longUrl, setLongUrl] = useState("");
  const [expirySeconds, setExpirySeconds] = useState<number>(3600);
  const [useDefaultExpiry, setUseDefaultExpiry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string[]>([]);
  const [result, setResult] = useState<CreateResponse | null>(null);
  const [generationTime, setGenerationTime] = useState<string | null>(null);
  const [displayResult, setDisplayResult] = useState(false);
  const [copiedKey, setCopiedKey] = useState<CopyKey>(null);

  const shortUrl = useMemo(() => {
    if (!result || !API_BASE) return null;
    return `${API_BASE}/${result.code}`;
  }, [result, API_BASE]);

  async function createShortUrl() {
    setErr([]);
    setResult(null);
    if (!API_BASE) { setErr(err => [...err, "API Base missing"]); return; }
    const trimmed = longUrl.trim();
    if (!trimmed) { setErr(err => [...err, "Error: Destination URL is required."]); return; }
    if(!isValidUrl(trimmed)){ setErr(err => [...err, "Error: Enter a valid URL"]); return; }
    setLoading(true);
    try {
      const payload: any = { longUrl: trimmed };
      if (!useDefaultExpiry) {
        if (expirySeconds < 60) { setErr(err => [...err, "Expiry must be  > 60secs"]); return; }
        payload.expiresInSeconds = expirySeconds;
      }
      const res = await fetch(`${API_BASE}/links`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`API error ${res.status}: ${text}`);
      const data = JSON.parse(text) as CreateResponse;
      setResult(data);
      setGenerationTime(nowHHMMSS());
      setDisplayResult(true);
    } catch (e: any) {
      setErr(err=>[...err, e?.message ?? "Something went wrong"]);
    } finally {
      setLoading(false);
    }
  }

  function fillExample() {
    setLongUrl("https://najaf.in");
    setExpirySeconds(86400);
    setUseDefaultExpiry(false);
    setErr([]);
  }

  function clearAll() {
    setErr([]);
    setResult(null);
    setLongUrl("");
    setExpirySeconds(3600);
    setUseDefaultExpiry(false);
    setCopiedKey(null);
    setDisplayResult(false);
  }

  async function copyWithFeedback(key: Exclude<CopyKey, null>, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 900);
    } catch {
      setErr(err => [...err, "Error: Copy failed. Your browser may block clipboard access."]);
    }
  }

  const statusOnline = Boolean(API_BASE);

  const expiresInText =
    result && typeof result.expireAt === "number"
      ? (() => {
        const now = Math.floor(Date.now() / 1000);
        const diff = Math.max(0, result.expireAt - now);
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        return `${h}h ${m}m`;
      })()
      : null;

  return (
    <div className=" bg-red min-h-screen flex flex-col items-center justify-center py-5 px-0">
      <div className="fixed bottom-4 right-4 z-50 cursor-pointer">
        <ThemeToggle />
      </div>
      {/* Panel */}
      <div className="w-[min(980px,92vw)] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">

        {/* Status + toggle */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
          <div>
            <span>shorty.najaf.in</span>
            <span className="border border-text rounded-sm px-1 mx-2">v1</span>
          </div>
          <div className="flex items-center gap-2.5 font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${statusOnline ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-[13px]">{statusOnline ? "API online" : "API offline"}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="px-4 pb-3">
          <h1 className="shadow-game mt-1.5 mb-1.5 text-[32px] leading-tight font-bold">Shorty</h1>
          <p className="m-0 text-text text-[15px]">Generate short links with optional expiry. Instant output.</p>
        </div>

        <div className="border-t-2 border-text" />

        {!displayResult && (
          <>
            <div className="px-4 py-3.5">
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

            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <button
                className="btn-3d border-2 border-[#2b2b2b] bg-[#ff2a2a] text-white px-4.5 py-2.5 font-bold text-[15px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={createShortUrl}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Short URL"}
              </button>

              <button
                className="border-2 border-text bg-text text-bg px-4.5 py-2.5 text-[15px] cursor-pointer shadow-[0_1px_0_rgba(0,0,0,.15)] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={fillExample}
                disabled={loading}
              >
                Fill example
              </button>

              {/* {result && (
                <button
                  className="ml-auto border-2 border-text bg-white text-[#0b0b0b] px-[18px] py-2.5 font-mono text-[15px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={clearAll}
                  disabled={loading}
                >
                  × Clear
                </button>
              )} */}
            </div>

            {err.length > 0 && (
              <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
                {err.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}
          </>
        )}

        {result && displayResult && (
          <>
            <div className="border-t-2 border-text" />

            {/* Generated bar */}
            <div className="flex justify-between items-center px-4 py-2.5">
              <div className="inline-flex items-center gap-2.5 font-mono">
                <span className="text-green-600 inline-flex">
                  <IconCheck />
                </span>
                <span className="font-extrabold tracking-widest text-green-600 text-[13px]">GENERATED</span>
              </div>
              <div className="font-mono text-text text-[13px]">{generationTime}</div>
            </div>

            {/* KV table */}
            <div className="w-full text-text">
              {/* CODE row */}
              <KvRow
                label="CODE"
                value={<span className="font-mono">{result.code}</span>}
                right={
                  <IconBtn
                    copied={copiedKey === "code"}
                    onClick={() => copyWithFeedback("code", result.code)}
                    title="Copy code"
                  />
                }
              />

              {/* SHORT URL row */}
              <KvRow
                label="SHORT URL"
                value={
                  shortUrl
                    ? <a className="text-[#5a8cff] no-underline hover:underline font-mono" href={shortUrl} title={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
                    : <span className="text-[#666]">Missing API base</span>
                }
                right={
                  shortUrl ? (
                    <>
                      <IconBtn copied={copiedKey === "shortUrl"} onClick={() => copyWithFeedback("shortUrl", shortUrl)} title="Copy short URL" />
                      <button
                        className="w-9.5 h-8.5 border-2 border-text bg-black text-white grid place-items-center cursor-pointer p-0 hover:brightness-110 active:translate-y-px"
                        onClick={() => window.open(shortUrl, "_blank")}
                        title="Open"
                        aria-label="Open"
                      >
                        <IconOpen />
                      </button>
                    </>
                  ) : null
                }
              />

              {/* EXPIRES row */}
              <KvRow
                label="EXPIRES"
                value={expiresInText ?? "—"}
                right={<span className="text-text text-[12px] font-mono">{formatExpireAt(result.expireAt)}</span>}
              />

              {/* ORIGIN row */}
              <KvRow
                label="ORIGIN"
                value={<span className="font-mono overflow-hidden text-ellipsis whitespace-nowrap" title={longUrl}>{longUrl}</span>}
                right={
                  <IconBtn copied={copiedKey === "origin"} onClick={() => copyWithFeedback("origin", longUrl)} title="Copy origin" />
                }
              />

              {/* Create new */}
              <div className="border-t-2 border-text flex justify-end px-4 py-2.5">
                <button
                  className="border-2 border-text bg-bg font-mono text-[15px] px-4.5 py-2.5 cursor-pointer disabled:opacity-60"
                  onClick={clearAll}
                  disabled={loading}
                >
                  Create new
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom line */}
      <div className="mt-3 px-1 text-[13px] text-text font-mono opacity-85">
        API Base: {API_BASE ?? "(not set)"} &nbsp;·&nbsp; Method: POST
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KvRow({ label, value, right }: { label: string; value: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr_140px] gap-3 px-4 py-2.5 border-t-2 border-text items-center max-sm:grid-cols-[120px_1fr]">
      <div className="font-mono tracking-widest text-text text-[13px]">{label}</div>
      <div className="text-[15px] text-text overflow-hidden">{value}</div>
      <div className="flex justify-end gap-2.5 items-center max-sm:justify-start">{right}</div>
    </div>
  );
}

function IconBtn({ copied, onClick, title }: { copied: boolean; onClick: () => void; title: string }) {
  return (
    <button
      className={`icon-btn w-[38px] h-[34px] border-2 border-text bg-black text-white grid place-items-center cursor-pointer p-0 hover:brightness-110 active:translate-y-px${copied ? " copied" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <span className="icon-swap relative w-[18px] h-[18px] grid place-items-center">
        <span className={`i absolute inset-0 grid place-items-center transition-all duration-[140ms] ease-in-out ${copied ? "opacity-0 scale-[0.85]" : "opacity-100 scale-100"}`}>
          <IconCopy />
        </span>
        <span className={`i ok absolute inset-0 grid place-items-center text-green-500 transition-all duration-[140ms] ease-in-out ${copied ? "opacity-100 scale-100" : "opacity-0 scale-[0.8]"}`}>
          <IconDoubleCheck />
        </span>
      </span>
    </button>
  );
}