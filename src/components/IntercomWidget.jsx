import { useEffect, useState, useRef } from "react";
import { useIntercom } from "react-use-intercom";
import { useAuthStore } from "../routes/stores/useAuthStore";
import { api } from "../services/api";

const IntercomWidget = () => {
  const { boot, shutdown } = useIntercom();
  const currentUser = useAuthStore(state => state.currentUser);
  const sessionToken = useAuthStore(state => state.sessionToken);
  const [isBooted, setIsBooted] = useState(false);
  const hasInitialized = useRef(false);

  // Check if user is part of an agency
  const isAgencyUser = !!currentUser?.agency_username;

  // Boot Intercom once when component mounts or user changes
  useEffect(() => {
    // Don't initialize Intercom for agency users
    if (isAgencyUser) {
      if (isBooted) {
        shutdown();
        setIsBooted(false);
        hasInitialized.current = false;
      }
      return;
    }

    // Prevent multiple initializations
    if (hasInitialized.current) return;

    const initializeIntercom = async () => {
      if (currentUser && sessionToken) {
        // User is logged in - fetch JWT and boot with user identity
        try {
          const response = await api.get("/intercom");
          const userJwt = response.user_jwt;

          const bootConfig = {
            email: currentUser.email,
            name: currentUser.first_name + " " + currentUser.last_name,
            userId: currentUser.email,
            createdAt: currentUser.createdAt
              ? Math.floor(new Date(currentUser.createdAt).getTime() / 1000)
              : undefined,
          };

          // Add JWT for Identity Verification
          if (userJwt) {
            bootConfig.intercomUserJwt = userJwt;
          }

          boot(bootConfig);
          setIsBooted(true);
          hasInitialized.current = true;
        } catch (error) {
          console.error("Failed to fetch Intercom JWT:", error);
          // Boot without JWT if fetch fails
          boot({
            email: currentUser.email,
            name: currentUser.first_name + " " + currentUser.last_name,
            userId: currentUser.email,
            createdAt: currentUser.createdAt
              ? Math.floor(new Date(currentUser.createdAt).getTime() / 1000)
              : undefined,
          });
          setIsBooted(true);
          hasInitialized.current = true;
        }
      } else {
        // User is not logged in - boot anonymously
        boot();
        setIsBooted(true);
        hasInitialized.current = true;
      }
    };

    initializeIntercom();

    // Cleanup: shutdown Intercom and reset when user changes or component unmounts
    return () => {
      if (isBooted) {
        shutdown();
        setIsBooted(false);
        hasInitialized.current = false;
      }
    };
  }, [currentUser?.email, sessionToken, boot, shutdown, isAgencyUser]);

  // This component doesn't render anything visible
  return null;
};

export default IntercomWidget;
