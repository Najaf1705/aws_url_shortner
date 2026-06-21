import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const isAuthenticated = useAppSelector(
        (state) => state.auth.isAuthenticated
    );
    const isAuthLoading = useAppSelector((state: any) => state.auth.isLoading);

    if (isAuthLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
