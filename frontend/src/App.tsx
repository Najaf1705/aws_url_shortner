import { useMemo, useState } from "react";
import "./App.css";

type CreateResponse = {
  code: string;
  expireAt: number; // epoch seconds
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

/** Better copy icon (two sheets, crisper) */
function IconCopy() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 18H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 14 19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 14v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green double-tick */
function IconDoubleCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.5 12.5 10 15l5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 12.5 15 15l5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 6 9 17l-5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResponse | null>(null);

  // Which icon button should show the green double tick
  const [copiedKey, setCopiedKey] = useState<CopyKey>(null);

  const shortUrl = useMemo(() => {
    if (!result || !API_BASE) return null;
    return `${API_BASE}/${result.code}`;
  }, [result, API_BASE]);

  async function createShortUrl() {
    setErr(null);
    setResult(null);

    if (!API_BASE) {
      setErr("Missing VITE_API_BASE in frontend/.env");
      return;
    }

    const trimmed = longUrl.trim();
    if (!trimmed) {
      setErr("Error: Destination URL is required.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { longUrl: trimmed };
      if (!useDefaultExpiry) payload.expiresInSeconds = expirySeconds;

      const res = await fetch(`${API_BASE}/links`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(`API error ${res.status}: ${text}`);

      const data = JSON.parse(text) as CreateResponse;
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function fillExample() {
    setLongUrl("https://example.com/very/long/path/to/resource?query=value");
    setExpirySeconds(86400);
    setUseDefaultExpiry(false);
  }

  function clearAll() {
    setErr(null);
    setResult(null);
    setLongUrl("");
    setExpirySeconds(3600);
    setUseDefaultExpiry(false);
    setCopiedKey(null);
  }

  async function copyWithFeedback(key: Exclude<CopyKey, null>, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((k) => (k === key ? null : k));
      }, 900);
    } catch {
      // fallback (rare)
      setErr("Error: Copy failed. Your browser may block clipboard access.");
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
    <div className="app">
      <div className="panel">
        <div className="topbar">
          <div className="brand">
            <span className="brandName">shorty.najaf.in</span>
            <span className="badge">v1</span>
          </div>

          <div className="status">
            <span className={`dot ${statusOnline ? "ok" : "down"}`} />
            <span className="statusText">{statusOnline ? "API online" : "API offline"}</span>
          </div>
        </div>

        <div className="hero">
          <h1>Shorty</h1>
          <p>Generate short links with optional expiry. Instant output.</p>
        </div>

        <div className="divider" />

        <div className="section">
          <div className="label">DESTINATION URL</div>
          <input
            className="input"
            type="url"
            inputMode="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/path/to/resource?query=value"
            spellCheck={false}
          />
          <div className="helper">Must include protocol (https:// or http://)</div>

          <div className="grid2">
            <div>
              <div className="label">EXPIRY (SECONDS)</div>
              <input
                className="input"
                type="number"
                value={expirySeconds}
                onChange={(e) => setExpirySeconds(Number(e.target.value))}
                disabled={useDefaultExpiry}
                min={60}
                step={60}
              />
              <div className="helper">Leave blank for API default (~24h)</div>
            </div>

            <div>
              <div className="label">DEFAULT EXPIRY</div>
              <label className="toggleWrap">
                <span className="toggle">
                  <input
                    type="checkbox"
                    checked={useDefaultExpiry}
                    onChange={(e) => setUseDefaultExpiry(e.target.checked)}
                  />
                  <span className="slider" />
                </span>
                <span className="toggleText">Use API default</span>
              </label>
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="actions">
          <button className="btn primary" onClick={createShortUrl} disabled={loading}>
            {loading ? "Creating..." : "Create Short URL"}
          </button>

          <button className="btn" onClick={fillExample} disabled={loading}>
            Fill example
          </button>

          {result && (
            <button className="btn ghost right" onClick={clearAll} disabled={loading}>
              × Clear
            </button>
          )}
        </div>

        {err && <div className="alert">{err}</div>}

        {result && (
          <>
            <div className="divider" />

            <div className="generatedBar">
              <div className="generatedLeft">
                <span className="okIcon">
                  <IconCheck />
                </span>
                <span className="generatedText">GENERATED</span>
              </div>
              <div className="generatedTime">{nowHHMMSS()}</div>
            </div>

            <div className="divider" />

            <div className="kvTable">
              <div className="kvRow">
                <div className="k">CODE</div>
                <div className="v mono">{result.code}</div>
                <div className="r">
                  <button
                    className={`iconBtn ${copiedKey === "code" ? "copied" : ""}`}
                    onClick={() => copyWithFeedback("code", result.code)}
                    title="Copy code"
                    aria-label="Copy code"
                  >
                    <span className="iconSwap">
                      <span className={`i ${copiedKey === "code" ? "out" : "in"}`}>
                        <IconCopy />
                      </span>
                      <span className={`i ok ${copiedKey === "code" ? "in" : "out"}`}>
                        <IconDoubleCheck />
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="kvRow">
                <div className="k">SHORT URL</div>
                <div className="v">
                  {shortUrl ? (
                    <a className="link" href={shortUrl} target="_blank" rel="noreferrer">
                      {shortUrl}
                    </a>
                  ) : (
                    <span className="muted">Missing API base</span>
                  )}
                </div>
                <div className="r">
                  {shortUrl && (
                    <>
                      <button
                        className={`iconBtn ${copiedKey === "shortUrl" ? "copied" : ""}`}
                        onClick={() => copyWithFeedback("shortUrl", shortUrl)}
                        title="Copy short URL"
                        aria-label="Copy short URL"
                      >
                        <span className="iconSwap">
                          <span className={`i ${copiedKey === "shortUrl" ? "out" : "in"}`}>
                            <IconCopy />
                          </span>
                          <span className={`i ok ${copiedKey === "shortUrl" ? "in" : "out"}`}>
                            <IconDoubleCheck />
                          </span>
                        </span>
                      </button>

                      <button
                        className="iconBtn"
                        onClick={() => window.open(shortUrl, "_blank")}
                        title="Open"
                        aria-label="Open"
                      >
                        <IconOpen />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="kvRow">
                <div className="k">EXPIRES</div>
                <div className="v">{expiresInText ?? "—"}</div>
                <div className="r mutedSmall">{formatExpireAt(result.expireAt)}</div>
              </div>

              <div className="kvRow">
                <div className="k">ORIGIN</div>
                <div className="v mono truncate">{longUrl}</div>
                <div className="r">
                  <button
                    className={`iconBtn ${copiedKey === "origin" ? "copied" : ""}`}
                    onClick={() => copyWithFeedback("origin", longUrl)}
                    title="Copy origin"
                    aria-label="Copy origin"
                  >
                    <span className="iconSwap">
                      <span className={`i ${copiedKey === "origin" ? "out" : "in"}`}>
                        <IconCopy />
                      </span>
                      <span className={`i ok ${copiedKey === "origin" ? "in" : "out"}`}>
                        <IconDoubleCheck />
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bottomLine mono">
        API Base: {API_BASE ?? "(not set)"} &nbsp;·&nbsp; Method: POST
      </div>
    </div>
  );
}