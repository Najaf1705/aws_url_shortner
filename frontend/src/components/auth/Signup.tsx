import { useState } from "react";
import AuthLayout from "../AuthLayout";
import GoogleButton from "./GoogleButton";
import { useAppSelector } from "../../store/hooks";
import { Link, useNavigate } from "react-router-dom";
import { useAuthForm, useAutoFocus } from "./useAuthForm";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const isAuthLoading = useAppSelector((s) => s.auth.isAuthLoading);
  const { err, errEntities, handleChange, setFieldError, setErr } = useAuthForm();
  const nameRef = useAutoFocus<HTMLInputElement>();

  const validate = () => {
    if (!name.trim()) {
      setFieldError("name", ["Name is required"]);
      return false;
    }
    if (!email.trim()) {
      setFieldError("email", ["Email is required"]);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("email", ["Enter a valid email"]);
      return false;
    }

    setErr([]);
    return true;
  };

  async function handleSignup() {
    if (!validate()) return;
    navigate("/set-password", {
      state: { name, email },
    });
  }

  return (
    <AuthLayout title="SIGN UP" subtitle="Create your account" err={err}>
      <div className="px-4 py-4 space-y-4">

        <div>
          <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">NAME</div>

          <input
            className={`w-full ${errEntities === "name" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
            value={name}
            ref={nameRef}
            disabled={isAuthLoading}
            onChange={handleChange(setName)}
            placeholder="Najaf Shaikh"
          />
        </div>

        <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">EMAIL</div>

        <input
          className={`w-full ${errEntities === "email" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
          type="email"
          value={email}
          disabled={isAuthLoading}
          onChange={handleChange(setEmail)}
          required
          placeholder="najaf@example.com"
        />
      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-end px-4 py-3 flex-wrap items-center gap-3">
        <GoogleButton />
          <div className="flex gap-4">
          <button onClick={handleSignup} disabled={isAuthLoading} className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed">{isAuthLoading ? "Working..." : "Continue"}</button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3 pb-4 px-4">
        <Link to="/login" className="text-sm text-[#4cda91]">Already have an account? Login.</Link>
      </div>
    </AuthLayout>
  );
}