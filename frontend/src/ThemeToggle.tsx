import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");

        if (saved) {
            return saved === "dark";
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);

        localStorage.setItem(
            "theme",
            darkMode ? "dark" : "light"
        );
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode((prev) => !prev)}
            className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-full border-2 border-text bg-text text-bg transition-colors hover:bg-bg hover:text-text"
            aria-label="Toggle theme"
        >
            {darkMode ? <SunIcon /> : <MoonIcon />}

            {/* <span className="text-sm font-medium">
        {darkMode ? "Light" : "Dark"}
      </span> */}
        </button>
    );
}

function SunIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M12 16a4 4 0 100-8 4 4 0 000 8z"
            />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            />
        </svg>
    );
}