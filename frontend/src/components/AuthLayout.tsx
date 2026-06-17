import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  err?: string[];
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  err,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-[min(550px,92vw)] border-2 border-text bg-bg rounded-md shadow-[0_18px_90px_rgba(0,203,210,.25)]">

        <div className="px-4 py-4">
          <h1 className="font-mono font-extrabold tracking-widest text-xl">
            {title}
          </h1>

          {subtitle && (
            <p className="font-mono text-sm text-text mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="border-t-2 border-text" />

        {err && err.length > 0 && (
          <div className="mx-4 mt-3 mb-0.5 border-2 border-[#f3c3cc] bg-[#fdecef] px-3.5 py-2 font-mono text-[13px] text-black">
            {err.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}