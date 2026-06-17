import { Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";
import UserStatus from "./components/auth/UserStatus";
import LinksButton from "./components/LinksButton";

export default function Layout() {
  const navigate = useNavigate();
  return (
    <>
      <div className="fixed w-full top-4 z-50 flex  px-6 items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer"
          onClick={() => navigate("/")}
          title="Create URLs"
        >
          <img src="./favicon-32x32.png" alt="" className="rounded-xl" />
          <h1 className="shadow-game mt-1.5 mb-1.5 text-[28px] leading-tight font-bold">Shorty</h1>
        </div>
      <div className="flex gap-2">
        <LinksButton/>
        <UserStatus />
        <ThemeToggle />
      </div>
    </div >

      <Outlet />
    </>
  );
}