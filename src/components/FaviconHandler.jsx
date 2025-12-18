import { useEffect } from "react";
import { isWhitelabelDomain } from "../utils/whitelabel-helper";
import { useAgencySettingsStore } from "../routes/stores/useAgencySettingsStore";
import { useAuthStore } from "../routes/stores/useAuthStore";
import { AGENCY_ASSETS_BUCKET_URL } from "../services/agency";

/**
 * Handles favicon based on:
 * 1. Agency custom favicon if user belongs to agency with favicon enabled
 * 2. Blank favicon on whitelabel domains without custom favicon
 * 3. Default Zeekeo favicon on main domain
 */
export default function FaviconHandler() {
  const { favicon, agencyUsername, isLoaded } = useAgencySettingsStore();
  const currentUser = useAuthStore(state => state.currentUser);

  useEffect(() => {
    // For users not in an agency, we can update favicon immediately
    // For agency users (sub-users with agency_username) or agency admins (type === "agency"),
    // wait for agency settings to load
    const isAgencySubUser = !!currentUser?.agency_username;
    const isAgencyAdmin = currentUser?.type === "agency";
    const shouldWait = (isAgencySubUser || isAgencyAdmin) && !isLoaded;

    if (shouldWait) return;

    const updateFavicon = () => {
      // Remove existing favicon links
      const faviconLinks = document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"]'
      );
      faviconLinks.forEach(link => link.remove());

      if (agencyUsername && favicon) {
        // Use agency's custom favicon
        const customFavicon = document.createElement("link");
        customFavicon.rel = "icon";
        customFavicon.href = `${AGENCY_ASSETS_BUCKET_URL}/${agencyUsername}/favicon`;
        document.head.appendChild(customFavicon);
      } else if (isWhitelabelDomain()) {
        // On whitelabel without custom favicon, use blank
        const blankFavicon = document.createElement("link");
        blankFavicon.rel = "icon";
        blankFavicon.href = "data:image/x-icon;base64,AA";
        document.head.appendChild(blankFavicon);
      } else {
        // On main domain, restore default favicon
        const defaultFavicon = document.createElement("link");
        defaultFavicon.rel = "icon";
        defaultFavicon.type = "image/png";
        defaultFavicon.href = "/favicon.ico";
        document.head.appendChild(defaultFavicon);
      }
    };

    updateFavicon();
  }, [favicon, agencyUsername, isLoaded, currentUser?.agency_username, currentUser?.type]);

  return null;
}
