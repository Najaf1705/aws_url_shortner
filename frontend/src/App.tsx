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

export default function App() {
  const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

  const [longUrl, setLongUrl] = useState("");
  const [expirySeconds, setExpirySeconds] = useState<number>(3600); // default 1 hr
  const [useDefaultExpiry, setUseDefaultExpiry] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [result, setResult] = useState<CreateResponse | null>(null);

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
      setErr("Please enter a long URL.");
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
      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = JSON.parse(text) as CreateResponse;
      setResult(data);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function fillExample() {
    setLongUrl("https://example.com");
    setExpirySeconds(3600);
    setUseDefaultExpiry(false);
  }

  return (
    <div className="page">
      <div className="card">
        <h1>URL Shortener</h1>
        <p className="sub">
          Create a short URL using your AWS API (API Gateway + Lambda + DynamoDB).
        </p>

        <div className="field">
          <label>Long URL</label>
          <input
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/some/long/path"
            spellCheck={false}
          />
        </div>

        <div className="row">
          <div className="field grow">
            <label>Expiry (seconds)</label>
            <input
              type="number"
              value={expirySeconds}
              onChange={(e) => setExpirySeconds(Number(e.target.value))}
              disabled={useDefaultExpiry}
              min={60}
              step={60}
            />
            <div className="hint">Min 60, step 60. Example: 3600 = 1 hour</div>
          </div>

          <div className="field checkbox">
            <label className="checkLabel">
              <input
                type="checkbox"
                checked={useDefaultExpiry}
                onChange={(e) => setUseDefaultExpiry(e.target.checked)}
              />
              Use API default expiry
            </label>
            <div className="hint">If checked, we don’t send expiresInSeconds.</div>
          </div>
        </div>

        <div className="buttons">
          <button onClick={createShortUrl} disabled={loading}>
            {loading ? "Creating..." : "Create short URL"}
          </button>
          <button className="secondary" onClick={fillExample} disabled={loading}>
            Fill example
          </button>
        </div>

        {err && <div className="error">❌ {err}</div>}

        {result && (
          <div className="result">
            <h2>Created</h2>
            <div className="kv">
              <div className="k">Code</div>
              <div className="v">
                <code>{result.code}</code>
              </div>

              <div className="k">Expire At</div>
              <div className="v">{formatExpireAt(result.expireAt)}</div>

              <div className="k">Short URL</div>
              <div className="v">
                {shortUrl ? (
                  <>
                    <a href={shortUrl} target="_blank" rel="noreferrer">
                      {shortUrl}
                    </a>
                    <div className="miniBtns">
                      <button
                        className="tiny"
                        onClick={() => navigator.clipboard.writeText(shortUrl)}
                      >
                        Copy
                      </button>
                      <button className="tiny" onClick={() => window.open(shortUrl, "_blank")}>
                        Test redirect
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="muted">Missing API base</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="footer">
          <span className="muted">
            API Base: <code>{API_BASE ?? "(not set)"}</code>
          </span>
        </div>
      </div>
    </div>
  );
}