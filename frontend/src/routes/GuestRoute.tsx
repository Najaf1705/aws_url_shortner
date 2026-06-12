import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function GuestRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}