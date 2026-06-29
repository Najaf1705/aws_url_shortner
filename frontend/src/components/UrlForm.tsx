
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createLink } from "../store/slices/links/linksThunks";
import { nowHHMMSS } from "../utils/nowHHMMSS";
import { PaymentModal } from "./PaymentModal";
import type { CreateResponse } from "../pages/Home";
// guest id is now managed by backend cookie

type Props = {
    longUrl: string;
    setLongUrl: (v: string) => void;
    onCreated: (res: CreateResponse, genTime: string) => void;
};

export default function UrlForm({ longUrl, setLongUrl, onCreated }: Props) {
    const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
    const dispatch = useAppDispatch();
    const quota = useAppSelector((state) => state.links.quota);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string[]>([]);
    const [errEntities, setErrEntities] = useState<string>("");
    const [days, setDays] = useState<number>(1);
    const [hours, setHours] = useState<number>(0);
    const [minutes, setMinutes] = useState<number>(0);
    const [alias, setAlias] = useState<string>("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingCreatePayload, setPendingCreatePayload] = useState<any>(null);
    const [pendingPaymentId, setPendingPaymentId] = useState<string | undefined>(undefined);


    function fillExample() {
        setErr([])
        setErrEntities("");
        setLongUrl("https://najaf.in");
        setDays(1);
        setHours(0);
        setMinutes(0);
        setAlias("");
    }

    const createShortUrl = async () => {
        setErr([]);
        setErrEntities("")
        if (!API_BASE) {
            setErr((e) => [...e, "API Base missing"]);
            return;
        }

        const trimmed = longUrl.trim();
        if (!trimmed) {
            setErr((e) => [...e, "Error: Destination URL is required."]);
            setErrEntities("URL_INPUT")
            return;
        }

        try {
            new URL(trimmed);
        } catch {
            setErr((e) => [...e, "Error: Enter a valid URL"]);
            setErrEntities("URL_INPUT")
            return;
        }

        // compute expiry from days/hours/minutes
        const totalSeconds = (Number(days) * 24 * 60 * 60) + (Number(hours) * 60 * 60) + (Number(minutes) * 60);
        const minSeconds = 60 * 2; // 2 minutes
        const maxSeconds = 365 * 24 * 60 * 60;

        if (totalSeconds < minSeconds) {
            setErr((e) => [...e, "Expiry must be at least 2 minutes"]);
            setErrEntities("EXPIRY_INPUT")
            return;
        }

        if (totalSeconds > maxSeconds) {
            setErr((e) => [...e, "Expiry cannot exceed 365 days"]);
            setErrEntities("EXPIRY_INPUT")
            return;
        }

        setLoading(true);

        try {
            const payload: any = { longUrl: trimmed };

            const expiresAt = Math.floor(Date.now() / 1000) + totalSeconds;
            payload.expiresAt = expiresAt;

            if (alias && alias.trim()) {
                const a = alias.trim();
                const ALIAS_PATTERN = /^[A-Za-z0-9_-]{5,30}$/;
                if (!ALIAS_PATTERN.test(a)) {
                    setErr((e) => [...e, "Alias invalid. Use 5-30 chars: letters, numbers, - or _"]);
                    setErrEntities("ALIAS_INPUT");
                    setLoading(false);
                    return;
                }

                payload.alias = a;
            }

            const action = await dispatch(createLink(payload)).unwrap();
            console.log("payment action: ", action);

            if ((action as any).paymentRequired) {
                setPendingCreatePayload(payload);
                setPendingPaymentId((action as any).paymentId);
                setShowPaymentModal(true);
                setLoading(false);
                return;
            }

            if (!("link" in action)) {
                throw new Error("Unexpected create link response");
            }

            const createdLink = action.link;
            const genTime = nowHHMMSS();
            onCreated({ code: createdLink.code, expireAt: createdLink.expireAt }, genTime);
        } catch (e: any) {
            const message = e.response?.data?.message || e.response?.data || e.message || "Something went wrong";
            setErr((errState) => [...errState, message]);
        } finally {
            setLoading(false);
        }
    }

    const handlePaymentConfirm = async (paymentId?: string) => {
        setShowPaymentModal(false);
        if (!pendingCreatePayload) {
            setErr((e) => [...e, "No pending link creation to retry"]);
            return;
        }

        const retryPayload = {
            ...pendingCreatePayload,
            paymentId: paymentId ?? pendingPaymentId,
        };

        setErr((e) => [...e, "Payment successful. Retrying link creation..."]);
        try {
            const action = await dispatch(createLink(retryPayload)).unwrap();
            if ((action as any).paymentRequired) {
                setErr((e) => [...e, "Payment is still required to create this link"]);
                return;
            }

            const createdLink = (action as any).link;
            const genTime = nowHHMMSS();
            onCreated({ code: createdLink.code, expireAt: createdLink.expireAt }, genTime);
            setPendingCreatePayload(null);
            setPendingPaymentId(undefined);
        } catch (e: any) {
            const message = e.response?.data?.message || e.response?.data || e.message || "Something went wrong";
            setErr((errState) => [...errState, message]);
        }
    };

    const isQuotaExhausted = quota && quota.freeLinksRemaining === 0;

    return (
        <>
            <div className="px-4 py-3.5 ">

                <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">DESTINATION URL</div>
                <input
                    className={`w-full ${errEntities === "URL_INPUT" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
                    type="url"
                    inputMode="url"
                    required
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://najaf.in"
                    spellCheck={false}
                />
                <div className="mt-1.5 font-mono text-text text-[13px]">Must include protocol (https:// or http://)</div>

                <div className="grid grid-cols-[1fr_1fr] gap-4.5 mt-3.5 items-start max-sm:grid-cols-1">
                    <div>
                        <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">EXPIRY</div>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <input
                                    className={`w-full ${errEntities === "EXPIRY_INPUT" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] placeholder:text-[#9aa0a6]`}
                                    type="number"
                                    value={days}
                                    onChange={(e) => {
                                        const v = Math.max(0, Math.min(365, Math.floor(Number(e.target.value) || 0)));
                                        setDays(v);
                                    }}
                                    min={0}
                                    max={365}
                                    placeholder="0"
                                />
                                <div className="font-mono text-[13px] mt-1">days</div>
                            </div>
                            <div>
                                <input
                                    className={`w-full ${errEntities === "EXPIRY_INPUT" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] placeholder:text-[#9aa0a6]`}
                                    type="number"
                                    value={hours}
                                    onChange={(e) => {
                                        const v = Math.max(0, Math.min(23, Math.floor(Number(e.target.value) || 0)));
                                        setHours(v);
                                    }}
                                    min={0}
                                    max={23}
                                    placeholder="0"
                                />
                                <div className="font-mono text-[13px] mt-1">hours</div>
                            </div>
                            <div>
                                <input
                                    className={`w-full ${errEntities === "EXPIRY_INPUT" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] placeholder:text-[#9aa0a6]`}
                                    type="number"
                                    value={minutes}
                                    onChange={(e) => {
                                        const v = Math.max(0, Math.min(59, Math.floor(Number(e.target.value) || 0)));
                                        setMinutes(v);
                                    }}
                                    min={0}
                                    max={59}
                                    placeholder="0"
                                />
                                <div className="font-mono text-[13px] mt-1">mins</div>
                            </div>
                        </div>
                        {/* <div className="mt-1.5 font-mono text-text text-[13px]">Example: 1 day → enter 1 in day</div> */}
                    </div>

                    <div>
                        <div className="font-mono font-extrabold tracking-widest text-[13px] text-text mb-2">ALIAS (optional)</div>
                        <input
                            className={`w-full ${errEntities === "ALIAS_INPUT" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91]`}
                            type="text"
                            value={alias}
                            onChange={(e) => setAlias(e.target.value)}
                            placeholder="custom-alias (5-30 chars)"
                            maxLength={30}
                        />
                        <div className="mt-1.5 font-mono text-text text-[13px]">Allowed: letters, numbers, - and _</div>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-text" />


            <div className="flex items-center justify-end gap-3 px-4 py-3.5">
                <button
                    className="border-2 border-text bg-text text-bg px-4.5 py-2.5 text-[15px] cursor-pointer shadow-[0_1px_0_rgba(0,0,0,.15)] disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => { setErr([]); fillExample(); }}
                    disabled={loading}
                >
                    Fill example
                </button>

                <button
                    className="btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] text-black px-4.5 py-2.5 font-bold text-[15px] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={createShortUrl}
                    disabled={loading}
                    title={isQuotaExhausted ? "Free quota is exhausted; payment will be requested when needed." : ""}
                >
                    {loading ? "Creating..." : "Create Short URL"}
                </button>
            </div>
            {err.length > 0 && (
                <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
                    {err.map((e, i) => <div key={i}>{e}</div>)}
                </div>
            )}

            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                quota={quota || undefined}
                paymentId={pendingPaymentId}
                onConfirm={handlePaymentConfirm}
            />
        </>
    )
}
