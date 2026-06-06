import { Outlet } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";

export default function Layout() {
  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Outlet />
    </>
  );
}