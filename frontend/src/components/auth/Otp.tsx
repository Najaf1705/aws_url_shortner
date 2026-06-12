import { useState } from "react";
import AuthLayout from "../AuthLayout";

export default function Otp() {
  const [otp, setOtp] = useState("");

  async function verifyOtp() {
    console.log(otp);
  }

  return (
    <AuthLayout
      title="VERIFY OTP"
      subtitle="Enter the code sent to your email"
    >
      <div className="px-4 py-6">

        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              maxLength={1}
              className="
                w-12
                h-12
                border-2
                border-[#6b6b6b]
                text-center
                font-mono
                text-lg
                outline-none
                focus:border-[#4cda91]
              "
              onChange={(e) => {
                const value = e.target.value;
                const arr = otp.split("");

                arr[i] = value;

                setOtp(arr.join(""));
              }}
            />
          ))}
        </div>

      </div>

      <div className="border-t-2 border-text" />

      <div className="flex justify-end px-4 py-3">
        <button
          onClick={verifyOtp}
          className="btn-3d border-2 border-[#2b2b2b] bg-[#4cda91] px-4 py-2 font-bold"
        >
          Verify
        </button>
      </div>
    </AuthLayout>
  );
}