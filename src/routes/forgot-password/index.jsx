import "./index.css";
import logo from "../../assets/logo.png";
import whitelabelLogo from "../../assets/wl-default-logo.png";
import { Link } from "react-router";
import { isWhitelabelDomain } from "../../utils/whitelabel-helper";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { api } from "../../services/api";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { AGENCY_ASSETS_BUCKET_URL } from "../../services/agency";

// Default colors matching the standard login page
const DEFAULT_COLORS = {
  background: "#000000",
  card: "#FFFFFF",
  text: "#454545",
  button_background: "#0387FF",
  button_text: "#FFFFFF",
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Agency UI customization state
  const [uiSettings, setUiSettings] = useState(null);
  const [agencyUsername, setAgencyUsername] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hasFavicon, setHasFavicon] = useState(false);

  // Fetch agency UI settings for whitelabel domains
  useEffect(() => {
    const fetchAgencySettings = async () => {
      if (!isWhitelabelDomain()) {
        setSettingsLoaded(true);
        return;
      }

      try {
        const response = await api.get("/auth/login/agency-ui");
        // Always set agency username if returned (needed for favicon URL)
        if (response.agency_username) {
          setAgencyUsername(response.agency_username);
        }
        if (response.login) {
          setUiSettings(response.login);
        }
        if (response.favicon) {
          setHasFavicon(true);
        }
      } catch (error) {
        console.error("Failed to fetch agency UI settings:", error);
      } finally {
        setSettingsLoaded(true);
      }
    };

    fetchAgencySettings();
  }, []);

  // Handle favicon for forgot password page on whitelabel domains
  useEffect(() => {
    if (!settingsLoaded || !isWhitelabelDomain()) return;

    // Remove existing favicons
    const faviconLinks = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"]',
    );
    faviconLinks.forEach(link => link.remove());

    if (hasFavicon && agencyUsername) {
      // Use agency's custom favicon
      const customFavicon = document.createElement("link");
      customFavicon.rel = "icon";
      customFavicon.href = `${AGENCY_ASSETS_BUCKET_URL}/${agencyUsername}/favicon`;
      document.head.appendChild(customFavicon);
    } else {
      // Use blank favicon on whitelabel
      const blankFavicon = document.createElement("link");
      blankFavicon.rel = "icon";
      blankFavicon.href = "data:image/x-icon;base64,AA";
      document.head.appendChild(blankFavicon);
    }
  }, [settingsLoaded, hasFavicon, agencyUsername]);

  // Compute styles based on settings
  const bgColor = uiSettings?.background || DEFAULT_COLORS.background;
  const cardColor = uiSettings?.card || DEFAULT_COLORS.card;
  const textColor = uiSettings?.text || DEFAULT_COLORS.text;
  const buttonBgColor =
    uiSettings?.button_background || DEFAULT_COLORS.button_background;
  const buttonTextColor =
    uiSettings?.button_text || DEFAULT_COLORS.button_text;

  // Construct logo URL if agency has custom logo
  const customLogoUrl =
    uiSettings?.logo?.enabled && agencyUsername
      ? `${AGENCY_ASSETS_BUCKET_URL}/${agencyUsername}/login_logo`
      : null;
  const logoWidth = uiSettings?.logo?.width || "300px";

  // Determine which logo to show:
  // - Custom logo if agency has one configured
  // - Whitelabel default logo if on whitelabel domain without custom logo
  // - Main Zeekeo logo on main domain
  const isWhitelabel = isWhitelabelDomain();
  const logoSrc = customLogoUrl || (isWhitelabel ? whitelabelLogo : logo);

  const handleSendResetLink = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset", {
        method: "send-token",
        email,
      });

      // Reset form field
      setEmail("");

      toast.success("Reset link sent to your email");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset link";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until settings are loaded to prevent flash of default colors
  if (!settingsLoaded) {
    return (
      <div
        className="w-full min-h-screen flex justify-center items-center"
        style={{ backgroundColor: DEFAULT_COLORS.background }}
      >
        <div className="animate-pulse">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          {isWhitelabelDomain()
            ? "Forgot Password"
            : "Zeekeo Launchpad - Forgot Password"}
        </title>
      </Helmet>
      <style>
        {`
          .forgot-password-input::placeholder {
            color: ${textColor};
            opacity: 0.6;
          }
        `}
      </style>
      <div
        className="w-full min-h-screen flex justify-center items-center px-4"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="w-full max-w-[530px] sm:max-w-lg md:max-w-xl p-6 sm:p-10 flex flex-col gap-y-8 items-center rounded-md"
          style={{ backgroundColor: cardColor }}
        >
          <div className="flex flex-col gap-y-6 items-center">
            <img
              src={logoSrc}
              alt="Logo"
              style={{ width: customLogoUrl ? logoWidth : undefined }}
              className={
                customLogoUrl ? "h-auto" : "w-[180px] sm:w-[220px] h-auto"
              }
            />
            <p
              className="text-2xl sm:text-[32px] font-medium"
              style={{ color: textColor }}
            >
              Forgot Password
            </p>
          </div>

          <div className="flex flex-col gap-y-6 w-full">
            <div className="flex flex-col w-full">
              <Input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`forgot-password-input w-full rounded-[6px] h-[45px] px-4 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                style={{ color: textColor, backgroundColor: "transparent" }}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex flex-col gap-y-4 w-full">
              <Button
                className="w-full rounded-[6px] cursor-pointer py-3 hover:opacity-90 transition font-medium text-sm"
                style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                onClick={handleSendResetLink}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Password Link"}
              </Button>
            </div>
            <div className="flex self-center">
              <Link
                to="/login"
                className="text-sm hover:underline"
                style={{ color: textColor }}
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
