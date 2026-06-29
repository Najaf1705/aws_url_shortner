export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
      <div className="w-full max-w-245 rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(0,203,210,.25)]">
        <div className="px-3 py-12 sm:px-4 sm:py-16 flex flex-col items-center justify-center gap-4">
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-3 border-text/20"></div>
            <div
              className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#4cda91] animate-spin"
              style={{
                animationDuration: "1s",
              }}
            ></div>
          </div>
          <p className="text-text text-sm sm:text-base font-mono">Loading...</p>
        </div>
      </div>
    </div>
  );
}
