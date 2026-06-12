import { LogIn, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearUser } from "../../store/slices/authSlice";
import { logout } from "../../utils/authUtils/logout.utils";

export default function UserStatus() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await logout();
    dispatch(clearUser());

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate("/login");
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="cursor-pointer border-2 border-text p-2 rounded-full"
        aria-label="Login"
        title="Login"
      >
        <LogIn size={18} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => navigate("/profile")}
        className="cursor-pointer border-2 border-text p-2 rounded-full"
        aria-label="Profile"
        title="Profile"
      >
        <User size={18} />
      </button>

      <button
        onClick={handleLogout}
        className="cursor-pointer border-2 border-text p-2 rounded-full"
        aria-label="Logout"
        title="Logout"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}