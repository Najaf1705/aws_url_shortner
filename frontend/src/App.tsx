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
import { useAppDispatch } from "./store/hooks";
import { fetchLinks, claimGuestLinks } from "./store/slices/links/linksThunks";
import { clearLinks } from "./store/slices/links/linksSlice";
import { logout, setAuthLoading } from "./store/slices/auth/authSlice";
import { fetchCurrentUser } from "./store/slices/auth/authThunks";
import GuestRoute from "./routes/GuestRoute";
import PasswordRoute from "./routes/PasswordRoute";
import OtpRoute from "./routes/OtpRoute";
import SetPasswordRoute from "./routes/SetPasswordRoute";
import LinksTable from "./components/LinksTable";
import LinkDetail from "./pages/LinkDetail";
import Profile from "./components/Profile";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const dispatch = useAppDispatch();


  useEffect(() => {
    const bootstrap = async () => {
      dispatch(setAuthLoading(true));
      let linksFetched = false;

      try {
        await dispatch(fetchCurrentUser()).unwrap();
        try {
          await dispatch(claimGuestLinks()).unwrap();
          linksFetched = true;
        } catch (error) {
          console.error("Failed to claim guest links", error);
        }
      } catch {
        dispatch(logout());
        dispatch(clearLinks());
      } finally {
        dispatch(setAuthLoading(false));
        if (!linksFetched) {
          try {
            dispatch(fetchLinks());
          } catch (e) {
            console.error("Failed to dispatch fetchLinks", e);
          }
        }
      }
    };

    bootstrap();
  }, [dispatch]);
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
        <Route path="/links" element={<LinksTable />} />
        <Route path="/link/:code" element={<LinkDetail />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

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
