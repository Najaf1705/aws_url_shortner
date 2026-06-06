import IconCopy from "./icons/IconCopy";
import IconDoubleCheck from "./icons/IconDoubleCheck";

export default function IconBtn({ copied, onClick, title }: { copied: boolean; onClick: () => void; title: string }) {
  return (
    <button
      className={`icon-btn w-9.5 h-8.5 border-2 border-text bg-black text-white grid place-items-center cursor-pointer p-0 hover:brightness-110 active:translate-y-px${copied ? " copied" : ""}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      <span className="icon-swap relative w-4.5 h-4.5 grid place-items-center">
        <span className={`i absolute inset-0 grid place-items-center transition-all duration-140 ease-in-out ${copied ? "opacity-0 scale-[0.85]" : "opacity-100 scale-100"}`}>
          <IconCopy />
        </span>
        <span className={`i ok absolute inset-0 grid place-items-center text-green-500 transition-all duration-140 ease-in-out ${copied ? "opacity-100 scale-100" : "opacity-0 scale-[0.8]"}`}>
          <IconDoubleCheck />
        </span>
      </span>
    </button>
  );
}