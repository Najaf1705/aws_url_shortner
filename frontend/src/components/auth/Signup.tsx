import { useEffect, useRef, useState, type ChangeEvent } from "react";
import AuthLayout from "../AuthLayout";
import { Link, useNavigate } from "react-router-dom";


export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<String[]>([]);
  const [errEntities, setErrEntities] = useState<String>("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleChange = (setter: (v: string) => void) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setErrEntities("");
      setErr([]);
    };

  const validate = () => {
    if (!name.trim()) {
      setErr(["Name is required"]);
      setErrEntities("name");
      return false;
    }
    if (!email.trim()) {
      setErr(["Email is required"]);
      setErrEntities("email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr(["Enter a valid email"]);
      setErrEntities("email");
      return false;
    }

    setErr([]);
    return true;
  }

  async function handleSignup() {
    console.log({ name, email });
    if (!validate()) return;
    navigate("/set-password", {
      state: { name, email },
    });
  }

  return (
    <AuthLayout
      title="SIGN UP"
      subtitle="Create your account"
    >
      <div className="px-4 py-4 space-y-4">

        <div>
          <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2" >
            NAME
          </div>

          <input
            className={`w-full ${errEntities === "name" ? "border-red-500" : "border-[#6b6b6b]"} border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91]`}
            value={name}
            ref={nameRef}
            onChange={handleChange(setName)}
            placeholder="Najaf Shaikh"
          />
        </div>


        <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
          EMAIL
        </div>

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
        <Link
          to="/login"
          className="text-sm text-[#4cda91]"
        >
          Already have an account? Login.
        </Link>
        <div className="flex gap-4">

          <button
            onClick={handleSignup}
  className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold text-black"          >
            Continue
          </button>
        </div>

      </div>
      {err.length > 0 && (
        <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
          {err.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </AuthLayout>
  );
}