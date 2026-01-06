import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { api } from "../../services/api";
import usePreviousStore from "../stores/usePreviousStore";

const AuthBridge = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const { sessionToken, currentUser, setTokens, setUser, login } =
    useAuthStore();

  useEffect(() => {
    const exchangeToken = async () => {
      const grant = searchParams.get("grant");
      const emailHint = searchParams.get("email");
      const target = searchParams.get("goto") || "/dashboard";
      const finalTarget = `${target}${
        target.includes("?") ? "&" : "?"
      }embed=true`;

      // VALIDATE SESSION IDENTITY IF EXISTS
      if (sessionToken && currentUser?.email && emailHint) {
        if (currentUser.email.toLowerCase() === emailHint.toLowerCase()) {
          console.log("Identity confirmed: Match found. Redirecting...");
          navigate(finalTarget);
          return;
        } else {
          console.log("Identity mismatch: Switching users...");
        }
      }

      if (!grant) {
        setError(true);
        return;
      }

      try {
        // Exchange encrypted grant for real tokens
        const { sessionToken: newSession, refreshToken: newRefresh } =
          await api.post("/auth/exchange", { grantToken: grant });

        setTokens(newSession, newRefresh);
        // Reset store with new user credentials
        login(newSession, newRefresh, null);

        // Fetch user details
        const userInfo = await api.get("/users");
        const userData = userInfo.user;

        usePreviousStore.getState().setPreviousView("user");
        setUser(userData);

        navigate(finalTarget);
      } catch (err) {
        console.error("SSO Exchange failed", err);
        setError(true);
      }
    };

    exchangeToken();
  }, [searchParams, navigate, sessionToken, currentUser, login, setUser]);

  if (error) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ color: "#d9534f" }}>Something went wrong.</h2>
        <p>Please contact support for assistance.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p>Loading... Please wait.</p>
    </div>
  );
};

export default AuthBridge;
