import { Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Otp from "./components/auth/Otp";
import Password from "./components/auth/Password";
import SetPassword from "./components/auth/SetPassword";
import { useEffect } from "react";
import { getCurrentUser } from "./utils/authUtils/user.utils";
import { useAppDispatch } from "./store/hooks";
import { logout, setUser } from "./store/slices/authSlice";
import GuestRoute from "./routes/GuestRoute";
import PasswordRoute from "./routes/PasswordRoute";
import OtpRoute from "./routes/OtpRoute";
import SetPasswordRoute from "./routes/SetPasswordRoute";

export default function App() {
  const dispatch = useAppDispatch();


  useEffect(() => {
    const bootstrap =
      async () => {
        try {
          const user =
            await getCurrentUser();

          dispatch(
            setUser(user)
          );
        } catch {
          dispatch(
            logout()
          );
        }
      };

    bootstrap();
  }, []);
  return (
    <Routes>
      {/* <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />

        <Route path="/otp" element={<Otp />} />
        <Route path="/password" element={<Password />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route> */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <GuestRoute>
              <Signup />
            </GuestRoute>
          }
        />

        <Route
          path="/password"
          element={
            <PasswordRoute>
              <Password />
            </PasswordRoute>
          }
        />

        <Route
          path="/otp"
          element={
            <OtpRoute>
              <Otp />
            </OtpRoute>
          }
        />

        <Route
          path="/set-password"
          element={
            <SetPasswordRoute>
              <SetPassword />
            </SetPasswordRoute>
          }
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Route>
    </Routes>
  );
}