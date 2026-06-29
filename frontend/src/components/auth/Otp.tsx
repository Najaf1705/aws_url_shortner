import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import AuthLayout from "../AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { useAuthForm } from "./useAuthForm";
import { claimGuestLinks } from "../../store/slices/links/linksThunks";
import { loginUser, signupUser } from "../../store/slices/auth/authThunks";

type OtpMode = "signup" | "login" | "reset" | "verify";

export type OtpProps = {
  mode?: OtpMode;
  onVerify?: (otp: string, ctx?: { email?: string; name?: string; password?: string; otpId?: string }) => Promise<any>;
  onResend?: (ctx?: { email?: string }) => Promise<any>;
};

const DIGITS = 6;

export default function Otp(props: OtpProps = {}) {
  const { mode: propMode, onVerify, onResend } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [otpArr, setOtpArr] = useState<string[]>(Array(DIGITS).fill(""));
  const [loading, setLoading] = useState(false);
  const { err, errEntities, setErrEntities, setErr } = useAuthForm();

  const [email] = useState(location.state?.email ?? "");
  const [name] = useState(location.state?.name ?? "");
  const [password] = useState(location.state?.password ?? "");
  const [otpId] = useState(location.state?.otpId ?? "");
  const [loginMode] = useState(location.state?.loginMode ?? "");
  const mode = (propMode ?? (location.state?.mode as OtpMode) ?? "signup") as OtpMode;

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const setDigit = (index: number, value: string) => {
    if (value !== "" && !/^[0-9]$/.test(value)) return;
    setOtpArr((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleDigitChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(-1);
    setDigit(index, val);
    if (val && index < DIGITS - 1) {
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key === "Backspace") {
      if (otpArr[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < DIGITS - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, DIGITS - index).split("");
    if (digits.length === 0) return;
    setOtpArr((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length; i++) {
        next[index + i] = digits[i];
      }
      return next;
    });
    const lastIndex = Math.min(DIGITS - 1, index + digits.length - 1);
    setTimeout(() => inputsRef.current[lastIndex]?.focus(), 0);
  };

  async function verifyOtp() {
    const otp = otpArr.join("");
    const isComplete = otpArr.every((d) => d.match(/^[0-9]$/));
    if (!isComplete) {
      setErr([`Enter the complete ${DIGITS}-digit code`]);
      setErrEntities("otp");
      return;
    }

    setErr([]);
    setErrEntities(null);
    setLoading(true);

    try {
      const ctx = { email, name, password, otpId };
      if (onVerify) {
        await onVerify(otp, ctx);
      } else if (mode === "signup") {
        await dispatch(signupUser({ name, email, password, otp, otpId })).unwrap();
        try {
          await dispatch(claimGuestLinks()).unwrap();
        } catch (error) {
          console.error("Failed to claim guest links", error);
        }
        navigate("/", { replace: true });
      } else if (mode === "login") {
        await dispatch(loginUser({ email, loginMode, password, otpId, otp })).unwrap();
        try {
          await dispatch(claimGuestLinks()).unwrap();
        } catch (error) {
          console.error("Failed to claim guest links", error);
        }
        navigate("/", { replace: true });
      } else {
        throw new Error("No verification handler provided for this mode");
      }
    } catch (error: any) {
      setErrEntities("otp");
      setErr([error instanceof Error ? error.message : String(error)]);
    } finally {
      setLoading(false);
    }
  }

  const resend = async () => {
    try {
      if (onResend) {
        await onResend({ email });
      } else {
        // fallback: no-op or call a resend API if available
        console.log("resend not implemented", email);
      }
    } catch (error: any) {
      setErr([error instanceof Error ? error.message : String(error)]);
    }
  };

  return (
    <AuthLayout
      title="VERIFY OTP"
      subtitle="Enter the code sent to your email"
      err={err}
    >
      <div className="px-4 py-6">

        <div className="flex justify-center gap-2">
          {Array.from({ length: DIGITS }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el }}
              maxLength={1}
              disabled={loading}
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpArr[i]}
              onChange={handleDigitChange(i)}
              onKeyDown={handleKeyDown(i)}
              onPaste={handlePaste(i)}
              className={`w-12 h-12 ${errEntities === "otp" ? "border-red-500" : "border-[#6b6b6b]"} text-center border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`} />
          ))}
        </div>

      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-end px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={verifyOtp}
            disabled={loading || !otpArr.every((d) => d !== "")}
            className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] text-black px-4 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            Verify
          </button>
          <button
            onClick={resend}
            disabled={loading}
            className="text-sm underline text-[#4cda91] px-2 py-2 disabled:opacity-50">
            Resend
          </button>
        </div>
      </div>
      {/* errors displayed by AuthLayout */}
    </AuthLayout>
  );
}
