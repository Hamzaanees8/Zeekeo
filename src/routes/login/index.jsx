import "./index.css";
import logo from "../../assets/logo.png";
import whitelabelLogo from "../../assets/wl-default-logo.png";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { toast } from "react-hot-toast";
import { api } from "../../services/api";
import { Helmet } from "react-helmet";
import { useAuthStore } from "../stores/useAuthStore";
import usePreviousStore from "../stores/usePreviousStore";
import { useAgencySettingsStore } from "../stores/useAgencySettingsStore";
import { isWhitelabelDomain } from "../../utils/whitelabel-helper";
import { AGENCY_ASSETS_BUCKET_URL } from "../../services/agency";

// Default colors matching the standard login page
const DEFAULT_COLORS = {
  background: "#000000",
  card: "#FFFFFF",
  text: "#454545",
  button_background: "#0387FF",
  button_text: "#FFFFFF",
};

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Agency UI customization state
  const [uiSettings, setUiSettings] = useState(null);
  const [agencyUsername, setAgencyUsername] = useState(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [hasFavicon, setHasFavicon] = useState(false);

  const { setTokens, setUser } = useAuthStore.getState();

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

  // Handle favicon for login page on whitelabel domains
  useEffect(() => {
    if (!settingsLoaded || !isWhitelabelDomain()) return;

    // Remove existing favicons
    const faviconLinks = document.querySelectorAll(
      'link[rel="icon"], link[rel="shortcut icon"]'
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
  const buttonBgColor = uiSettings?.button_background || DEFAULT_COLORS.button_background;
  const buttonTextColor = uiSettings?.button_text || DEFAULT_COLORS.button_text;

  // Construct logo URL if agency has custom logo
  const customLogoUrl = uiSettings?.logo?.enabled && agencyUsername
    ? `${AGENCY_ASSETS_BUCKET_URL}/${agencyUsername}/login_logo`
    : null;
  const logoWidth = uiSettings?.logo?.width || "300px";

  // Determine which logo to show:
  // - Custom logo if agency has one configured
  // - Whitelabel default logo if on whitelabel domain without custom logo
  // - Main Zeekeo logo on main domain
  const isWhitelabel = isWhitelabelDomain();
  const logoSrc = customLogoUrl || (isWhitelabel ? whitelabelLogo : logo);

  const handleLogin = async () => {
    if (!username.trim()) {
      setErrors({ username: "Username or email is required" });
      return;
    }

    if (!password.trim()) {
      setErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);

    try {
      const { sessionToken, refreshToken, type } = await api.post(
        "/auth/login",
        {
          username,
          password,
        },
      );

      setTokens(sessionToken, refreshToken);
      useAuthStore.getState().login(sessionToken, refreshToken, null);

      // Clear cached agency UI settings when logging in on non-whitelabel domain
      if (!isWhitelabelDomain()) {
        useAgencySettingsStore.getState().clearSettings();
      }

      // Fetch user details
      let user;

      if (type === "agency") {
        const agencyInfo = await api.get("/agency");
        user = agencyInfo.agency;
        usePreviousStore.getState().setPreviousView("agency");
        setUser(user);
        navigate("/agency/dashboard");
      } else {
        const userInfo = await api.get("/users");
        user = userInfo.user;
        usePreviousStore.getState().setPreviousView("user");
        setUser(user);
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  // Don't render until settings are loaded to prevent flash of default colors
  if (!settingsLoaded) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center" style={{ backgroundColor: DEFAULT_COLORS.background }}>
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
        <title>{isWhitelabelDomain() ? "Login" : "Zeekeo Launchpad - Login"}</title>
      </Helmet>
      <style>
        {`
          .login-input::placeholder {
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
              className={customLogoUrl ? "h-auto" : "w-[280px] sm:w-[300px] h-auto"}
            />
            <p
              className="text-2xl sm:text-[32px] font-medium"
              style={{ color: textColor }}
            >
              Log In
            </p>
          </div>

          <div className="flex flex-col gap-y-6 w-full">
            {/* Username/Email Field */}
            <div className="flex flex-col w-full">
              <Input
                type="text"
                placeholder="Username or Email"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`login-input w-full h-[45px] rounded-[6px] px-4 py-2 border ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                style={{ color: textColor, backgroundColor: "transparent" }}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative w-full flex flex-col">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`login-input w-full h-[45px] px-4 py-2 rounded-[6px] border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                style={{ color: textColor, backgroundColor: "transparent" }}
              />
              <span>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </span>
              <span
                className="absolute right-3 top-2.5 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* Eye Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.00004 13.25C8.70954 13.25 9.35754 13.1727 9.94854 13.0392L8.63079 11.7215C8.42604 11.7372 8.21829 11.75 8.00004 11.75C3.9868 11.75 2.43204 8.86548 2.05554 7.99998C2.33825 7.36908 2.72008 6.78748 3.18654 6.27723L2.13804 5.22873C0.984545 6.47898 0.547295 7.73823 0.539045 7.76298C0.48731 7.917 0.48731 8.0837 0.539045 8.23773C0.554795 8.28723 2.2753 13.25 8.00004 13.25ZM8.00004 2.74998C6.62229 2.74998 5.49054 3.04698 4.54704 3.48573L1.7803 0.719727L0.719795 1.78023L14.2198 15.2802L15.2803 14.2197L12.791 11.7305C14.7515 10.2672 15.4513 8.26923 15.4618 8.23773C15.5135 8.0837 15.5135 7.917 15.4618 7.76298C15.4453 7.71273 13.7248 2.74998 8.00004 2.74998ZM11.729 10.6685L10.019 8.95848C10.1615 8.66598 10.25 8.34423 10.25 7.99998C10.25 6.76923 9.23079 5.74998 8.00004 5.74998C7.65579 5.74998 7.33404 5.83848 7.04229 5.98173L5.6863 4.62573C6.43068 4.37029 7.21308 4.24323 8.00004 4.24998C12.0133 4.24998 13.568 7.13448 13.9445 7.99998C13.718 8.51898 13.07 9.75648 11.729 10.6685Z"
                    fill={textColor}
                  />
                </svg>
              </span>

              <div className="mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: textColor }}
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <div className="flex flex-col gap-y-4 w-full">
              <Button
                onClick={handleLogin}
                type="button"
                disabled={loading}
                className="w-full rounded-[6px] cursor-pointer py-3 hover:opacity-90 transition font-medium text-sm"
                style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
