import { useEffect, useRef, useState, type ChangeEvent } from "react";
import AuthLayout from "../AuthLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { setUser } from "../../store/slices/authSlice";
import { getCurrentUser } from "../../utils/authUtils/user.utils";
import { simpleSignup } from "../../utils/authUtils/signup.utils";


export default function SetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState<String[]>([]);
  const [errEntities, setErrEntities] = useState<String>("");
  const [email] = useState(location.state?.email ?? "");
  const [name] = useState(location.state?.name ?? "");
  const [loading, setLoading] = useState(false);
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
    if (!password.trim() && !confirmPassword.trim()) {
      setErr(["Password is required"]);
      setErrEntities("password");
      return false;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setErr(["Passwords do not match"]);
      setErrEntities("password");
      return false;
    }

    if (password.trim().length < 4) {
      setErr(["Atleast 4 chars required"]);
      setErrEntities("password");
      return false;
    }

    setErr([]);
    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setErrEntities("")

    setLoading(true);

    try {
      await simpleSignup(name, email, password);

      const user = await getCurrentUser();

      dispatch(setUser(user));

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      // setErrEntities("password");

      setErr([
        err instanceof Error
          ? err.message
          : "Login failed",
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="SET PASSWORD"
      subtitle="Create a password"
    >
      <div className="px-4 py-4 space-y-4">

        <div>
          <div className="font-mono font-extrabold tracking-widest text-[13px] mb-2">
            PASSWORD
          </div>

          <input
            type="password"
            value={password}
            ref={nameRef}

            disabled={loading}
            onChange={handleChange(setPassword)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleSubmit();
              }
            }}
            className={`w-full ${errEntities === "password"
              ? "border-red-500"
              : "border-[#6b6b6b]"
              } border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
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
            className={`w-full ${errEntities === "password"
              ? "border-red-500"
              : "border-[#6b6b6b]"
              } border-2 px-3 py-2.5 font-mono outline-none focus:border-[#4cda91] disabled:bg-gray-400 disabled:cursor-not-allowed`}
          />

        </div>
      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-end px-4 py-3">
        <button
          onClick={handleSubmit}
          className="cursor-pointer btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold"
        >
          Save Password
        </button>
      </div>
      {err.length > 0 && (
        <div className="mx-4 mb-3.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-3 font-mono text-[13px] text-black">
          {err.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </AuthLayout>
  );
}