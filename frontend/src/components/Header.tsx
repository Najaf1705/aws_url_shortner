// components/Header.tsx

type Props = {
    statusOnline: boolean;
};

export default function Header({ statusOnline }: Props) {
    return (
        <>
        
        <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
            <div>
                <span>shorty.najaf.in</span>
                <span className="border border-text rounded-sm px-1 mx-2">v1</span>
            </div>
            <div className="flex items-center gap-2.5 font-mono">
                <span className={`w-2.5 h-2.5 rounded-full ${statusOnline ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-[13px]">{statusOnline ? "API online" : "API offline"}</span>
            </div>
        </div>

        {/* Hero */ }
        <div className="px-4 pb-3">
          <h1 className="shadow-game mt-1.5 mb-1.5 text-[32px] leading-tight font-bold">Shorty</h1>
          <p className="m-0 text-text text-[15px]">Generate short links with optional expiry. Instant output.</p>
        </div>

        </>
  );
}