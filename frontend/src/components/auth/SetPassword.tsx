import { useState } from "react";
import AuthLayout from "../AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { simpleSignup } from "../../utils/authUtils/signup.utils";
import { useAuthForm, useAutoFocus } from "./useAuthForm";

export default function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { err, errEntities, handleChange, setFieldError, setErr } = useAuthForm();
  const [email] = useState(location.state?.email ?? "");
  const [name] = useState(location.state?.name ?? "");
  const [loading, setLoading] = useState(false);
  const passwordRef = useAutoFocus<HTMLInputElement>();

  const validate = () => {
    if (!password.trim() && !confirmPassword.trim()) {
      setFieldError("password", ["Password is required"]);
      return false;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setFieldError("password", ["Passwords do not match"]);
      return false;
    }

    if (password.trim().length < 4) {
      setFieldError("password", ["Atleast 4 chars required"]);
      return false;
    }

    setErr([]);
    return true;
  };

  async function handleSubmit() {
    if (!validate()) return;
    setErr([]);
    setLoading(true);

    try {
      const signupResponse = await simpleSignup(name, email, password);
      if (signupResponse.code === "EMAIL_VERIFICATION_REQUIRED") {
        navigate("/otp", {
          state: { email, name, password, otpId: signupResponse.otpId },
        });
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="SET PASSWORD"
      subtitle="Create a password"
      err={err}
    >
      <div className="px-4 py-4 space-y-4">

        <div>
          <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
            PASSWORD
          </div>

          <input
            type="password"
            value={password}
            ref={passwordRef}

            disabled={loading}
            onChange={handleChange(setPassword)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleSubmit();
              }
            }}
            className={`w-full ${errEntities === "password" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
          />
        </div>
        <div>
          <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
            CONFIRM PASSWORD
          </div>

          <input
            type="password"
            value={confirmPassword}
            disabled={loading}
            onChange={handleChange(setConfirmPassword)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleSubmit();
              }
            }}
            className={`w-full ${errEntities === "password" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
          />

        </div>
      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-end px-4 py-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black  disabled:opacity-50 disabled:cursor-not-allowed" >
          Save Password
        </button>
      </div>
      {/* errors shown by AuthLayout */}
    </AuthLayout>
  );
}