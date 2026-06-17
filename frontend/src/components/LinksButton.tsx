import { Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LinksButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/links")}
            className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-full border-2 border-text bg-text text-bg transition-colors hover:bg-bg hover:text-text"
            aria-label="Links"
            title="Links"
        >
            <Link size={16} />
        </button>
    );
}

