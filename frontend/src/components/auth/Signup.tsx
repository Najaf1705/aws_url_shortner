import { useState } from "react";
import AuthLayout from "../AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { useAuthForm, useAutoFocus } from "./useAuthForm";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
            className={`w-full ${errEntities === "name" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91]`}
            value={name}
            ref={nameRef}
            onChange={handleChange(setName)}
            placeholder="Najaf Shaikh"
          />
        </div>

        <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">EMAIL</div>

        <input
          className={`w-full ${errEntities === "email" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91]`}
          type="email"
          value={email}
          onChange={handleChange(setEmail)}
          required
          placeholder="najaf@example.com"
        />
      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-between px-4 py-3 items-center">
        <Link to="/login" className="text-sm text-[#4cda91]">Already have an account? Login.</Link>
        <div className="flex gap-4">
          <button onClick={handleSignup} className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black">Continue</button>
        </div>
      </div>
    </AuthLayout>
  );
}