import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { setAuthLoading } from "../../store/slices/auth/authSlice";
import { authenticateWithGoogle, fetchCurrentUser } from "../../store/slices/auth/authThunks";
import { claimGuestLinks } from "../../store/slices/links/linksThunks";

export default function GoogleButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;

    let cancelled = false;

    // First check if user is already logged in via existing session (/me)
    (async function checkCurrent() {
      dispatch(setAuthLoading(true));
      try {
        const user = await dispatch(fetchCurrentUser()).unwrap();
        if (user && !cancelled) {
          navigate("/");
          return;
        }
      } catch (e) {
        // not logged in — continue to load Google One Tap
      } finally {
        if (!cancelled) dispatch(setAuthLoading(false));
      }
    })();

    const existing = document.getElementById("google-identity-js");
      if (!existing) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.id = "google-identity-js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
      s.onload = () => initGsi(clientId);
    } else {
      // script already present
      // @ts-ignore
      if (window.google) initGsi(clientId);
    }

    function initGsi(clientId: string) {
      // @ts-ignore
      if (!window.google || !containerRef.current) return;

      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        auto_select: true,
        callback: async (resp: any) => {
          const idToken = resp?.credential;
          if (!idToken) return;

          dispatch(setAuthLoading(true));
          try {
            const result = await dispatch(authenticateWithGoogle({ idToken })).unwrap();

            if (result.requiresPassword) {
              const email = result.email ?? resp?.email ?? "";
              navigate("/set-password", { state: { email, idToken } });
              return;
            }

            await dispatch(fetchCurrentUser()).unwrap();
            try {
              await dispatch(claimGuestLinks()).unwrap();
            } catch (error) {
              console.error("Failed to claim guest links", error);
            }
            navigate("/");
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Google signin error", err);
          } finally {
            dispatch(setAuthLoading(false));
          }
        },
      });
      // render the classic button
      // @ts-ignore
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        text: "continue_with",
      });

      // show One Tap prompt (will not disrupt if not supported)
      try {
        // @ts-ignore
        window.google.accounts.id.prompt();
      } catch (e) {
        // ignore
      }
    }
    return () => { cancelled = true; };
  }, [dispatch, navigate]);

  return <div ref={containerRef} />;
}
