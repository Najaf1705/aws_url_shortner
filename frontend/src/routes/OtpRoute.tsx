import {
    Navigate,
    useLocation,
} from "react-router-dom";

export default function OtpRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const location = useLocation();

    if (!location.state?.email) {
        return (
            <Navigate
                to="/signup"
                replace
            />
        );
    }

    return <>{children}</>;
}