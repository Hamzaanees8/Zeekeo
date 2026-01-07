import { Navigate } from "react-router-dom";
import { useAuthStore } from "../routes/stores/useAuthStore";
import IframeResizer from "./IframeResizer";
import { useEffect } from "react";

export default function PrivateRoute({ children }) {
  const { sessionToken } = useAuthStore();

  useEffect(() => {
    // Detect if we are in an iframe
    const isIframe = window.self !== window.top;
    if (isIframe) {
      document.body.classList.add("is-embedded");
    } else {
      document.body.classList.remove("is-embedded");
    }

    return () => {
      document.body.classList.remove("is-embedded");
    };
  }, []);

  if (!sessionToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <IframeResizer />
      {children}
    </>
  );
}
