import { useMemo, useState } from "react";

import Header from "../components/Header";
import UrlForm from "../components/UrlForm";
import ResultCard from "../components/ResultCard";

// URL creation moved into UrlForm component

export type CreateResponse = {
    code: string;
    expireAt: number;
};

export type CopyKey =
    | "code"
    | "shortUrl"
    | "origin"
    | null;

export default function App() {
    const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

    const [longUrl, setLongUrl] = useState("");
    const [expirySeconds, setExpirySeconds] = useState(3600);
    const [useDefaultExpiry, setUseDefaultExpiry] = useState(false);
    const [result, setResult] = useState<CreateResponse | null>(null);
    const [generationTime, setGenerationTime] = useState<string | null>(null);
    const [displayResult, setDisplayResult] = useState(false);
    const [copiedKey, setCopiedKey] = useState<CopyKey>(null);
    // errors/loading handled inside UrlForm

    const shortUrl = useMemo(() => {
        if (!result || !API_BASE) return null;

        return `${API_BASE}/${result.code}`;
    }, [result, API_BASE]);

    const statusOnline = Boolean(API_BASE);

    const expiresInText =
        result &&
            typeof result.expireAt === "number"
            ? (() => {
                const now = Math.floor(
                    Date.now() / 1000
                );

                const diff = Math.max(
                    0,
                    result.expireAt - now
                );

                const h = Math.floor(diff / 3600);
                const m = Math.floor(
                    (diff % 3600) / 60
                );

                return `${h}h ${m}m`;
            })()
            : null;

    function onCreated(data: CreateResponse, genTime: string) {
        setResult(data);
        setGenerationTime(genTime);
        setDisplayResult(true);
    }


    function clearAll() {
        setResult(null);
        setLongUrl("");
        setExpirySeconds(3600);
        setUseDefaultExpiry(false);
        setCopiedKey(null);
        setDisplayResult(false);
    }

    async function copyWithFeedback(
        key: Exclude<CopyKey, null>,
        text: string
    ) {
        try {
            await navigator.clipboard.writeText(
                text
            );

            setCopiedKey(key);

            window.setTimeout(() => {
                setCopiedKey((current) =>
                    current === key
                        ? null
                        : current
                );
            }, 900);
        } catch {
            console.error("Error: Copy failed. Your browser may block clipboard access.");
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-5">

            <div className="w-[min(980px,92vw)] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">
                <Header
                    statusOnline={statusOnline}
                />
                <div className="border-t-2 border-text" />


                {!displayResult ? (
                    <UrlForm
                        longUrl={longUrl}
                        setLongUrl={setLongUrl}
                        expirySeconds={expirySeconds}
                        setExpirySeconds={setExpirySeconds}
                        useDefaultExpiry={useDefaultExpiry}
                        setUseDefaultExpiry={setUseDefaultExpiry}
                        onCreated={onCreated}
                    />
                ) : (
                    result && (
                        <ResultCard
                            result={result}
                            longUrl={longUrl}
                            shortUrl={shortUrl}
                            generationTime={
                                generationTime
                            }
                            copiedKey={copiedKey}
                            expiresInText={
                                expiresInText
                            }
                            copyWithFeedback={
                                copyWithFeedback
                            }
                            clearAll={clearAll}
                        />
                    )
                )}
            </div>

            <div className="mt-3 px-1 text-[13px] text-text font-mono opacity-85">
                API Base:{" "}
                {API_BASE ?? "(not set)"} ·
                Method: POST
            </div>
        </div>
    );
}