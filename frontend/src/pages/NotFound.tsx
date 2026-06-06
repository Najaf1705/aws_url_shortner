import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-[min(900px,92vw)] rounded-md bg-bg border-2 border-text shadow-[0_18px_90px_rgba(255,0,0,.15)]">

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <span>shorty.najaf.in</span>
                        <span className="border border-text rounded-sm px-1 mx-2">
                            v1
                        </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-[13px]">
                            RESOURCE NOT FOUND
                        </span>
                    </div>
                </div>

                <div className="border-t-2 border-text" />

                {/* Body */}
                <div className="pt-6 px-6">
                    <div className="font-mono font-extrabold tracking-widest text-red-500 mb-3">
                        ERROR 404
                    </div>

                    <h1 className="shadow-game text-4xl font-bold mb-4">
                        Link unavailable
                    </h1>

                    <div className="font-mono text-sm mb-6 space-y-2">
                        <p>
                            The requested resource could not be found.
                        </p>

                        <p>
                            Possible reasons:
                        </p>

                        <ul className="list-disc pl-6 space-y-1">
                            <li>Short URL does not exist</li>
                            <li>Link has expired</li>
                            <li>URL was entered incorrectly</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t-2 border-text" />

                <div className="pb-4 px-6">


                    <div className="pt-2 flex gap-3 justify-end">
                        <Link
                            to="/"
                            className="btn-3d border-2 border-[#2b2b2b] bg-[#36ff97] text-black px-4 py-2 font-bold"
                        >
                            Create New Link
                        </Link>

                    </div>
                </div>
                {/* <div className="px-4 pb-2 font-mono text-[12px] opacity-80">
                    STATUS: NOT_FOUND
                </div> */}
            </div>

        </div>
    );
}