import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";
import usePreviousStore from "../stores/usePreviousStore";

export default function Logout() {
  const navigate = useNavigate();
  const hasLoggedOut = useRef(false);

  const logout = useAuthStore(state => state.logout);
  const clearPreviousView = usePreviousStore(s => s.clearPreviousView);

  useEffect(() => {
    if (hasLoggedOut.current) return;

    hasLoggedOut.current = true;

    const doLogout = async () => {
      try {
        // Clear tokens
        logout();
        toast.success("Logged out successfully");
        clearPreviousView();
      } catch (err) {
        console.warn("Logout failed", err);
      } finally {
        navigate("/login");
      }
    };

    doLogout();
  }, [navigate]);

  return null;
}
