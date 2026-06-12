import {
    Navigate,
    useLocation,
} from "react-router-dom";

export default function PasswordRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const location = useLocation();

    if (!location.state?.email) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return <>{children}</>;
}