import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

export default function Logout() {
    const navigate = useNavigate();
    const hasLoggedOut = useRef(false);
    
    useEffect(() => {

        if (hasLoggedOut.current) return;

        hasLoggedOut.current = true;

        const doLogout = async () => {
            try {
                // Clear tokens
                localStorage.removeItem("sessionToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("userInfo");

                toast.success("Logged out successfully");
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
