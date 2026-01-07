import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import closeBtn from "../assets/s_close_btn.png";
import main_logo from "../assets/logo_small.png";
import whitelabel_logo from "../assets/wl-default-logo.png";
import no_image from "../assets/no_image.png";
import NotificationModal from "./NotificationModal";
import { useNavigate } from "react-router-dom";
import { isWhitelabelDomain } from "../utils/whitelabel-helper";
import toast from "react-hot-toast";

import {
  NotificationIcon,
  DashboardIcon,
  CampaignsIcon,
  SocialEngagementsIcon,
  InboxIcon,
  PersonasIcon,
  SettingsIcon,
  BillingIcon,
  FeatureIcon,
  LogoutIcon,
  BackIcon,
  ArrowRight,
  BlacklistIcon,
} from "./Icons";
import { useAuthStore } from "../routes/stores/useAuthStore";
import { useAgencySettingsStore } from "../routes/stores/useAgencySettingsStore";
import { loginAsAgency } from "../services/users";
import usePreviousStore from "../routes/stores/usePreviousStore";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const store = useAuthStore();
  const user = store.currentUser; // Current user (impersonated user)
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Agency branding settings
  const {
    menuBackground,
    menuColor,
    menuTextBackgroundHover,
    menuTextHoverColor,
    logoImage,
    logoWidth,
    isLoaded,
    loadSettingsForUser,
  } = useAgencySettingsStore();

  // Load agency settings if user belongs to an agency
  useEffect(() => {
    if (user?.agency_username && !isLoaded) {
      loadSettingsForUser();
    }
  }, [user?.agency_username, isLoaded, loadSettingsForUser]);

  // Helper functions
  const isImpersonating = store.impersonationChain.length > 0;

  const getCurrentUserType = () => {
    // if (store.impersonationChain.length === 0) {
    //   if (user?.admin === 1) return "admin";
    //   if (user?.agency_admin) return "agency";
    //   return "user";
    // }
    return store.impersonationChain[store.impersonationChain.length - 1]
      .userType;
  };

  const getOriginalUser = () => {
    return store.originalUser;
  };
  const originalUser = getOriginalUser();
  const getGoBackButtonText = () => {
    if (!isImpersonating) return "";

    const currentType = getCurrentUserType();

    if (currentType === "user") {
      return "Go back to Agency";
    } else if (currentType === "user-agency-admin") {
      return `Go back to ${originalUser?.first_name || "Your Profile"}`;
    } else if (
      currentType === "user-agency-admin" &&
      originalUser.admin === 1
    ) {
      return `Go back to Admin`;
    } else if (currentType === "admin-to-user") {
      return "Go back to Admin";
    } else if (currentType === "agency") {
      if (originalUser?.admin === 1) {
        return "Go back to Admin";
      } else {
        return "Go back to User";
      }
    }
    return "Go back";
  };

  // Button handlers
  const handleGoBack = () => {
    if (!isImpersonating) return;

    const currentType = getCurrentUserType();

    // Exit one level of impersonation
    store.exitImpersonation();

    // Navigate based on what we're going back to
    if (currentType === "user") {
      navigate("/agency/dashboard");
    } else if (currentType === "user-agency-admin") {
      store.clearAllImpersonation();
      window.location.reload();
    } else if (currentType === "admin-to-user") {
      navigate("/admin/dashboard");
    } else if (currentType === "agency") {
      const originalUser = store.currentUser;
      if (originalUser?.admin === 1) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleGoToAgency = async () => {
    if (user?.agency_admin && user?.agency_username) {
      try {
        const res = await loginAsAgency(user.agency_username);

        if (res?.sessionToken) {
          const currentUser = useAuthStore.getState().currentUser;

          // FIXED: Pass refreshToken
          useAuthStore.getState().enterImpersonation(
            res.sessionToken,
            res.refreshToken || null,
            currentUser, // Original agency user
            "agency-admin", // String type
          );

          toast.success("Now viewing as agency");
          navigate("/agency/dashboard");
        } else {
          toast.error("Failed to login as agency");
        }
      } catch (err) {
        console.error("Login as agency failed:", err);
        toast.error("Something went wrong");
      }
    }
  };

  const handleGoToAdmin = () => {
    navigate("/admin/dashboard");
  };

  const displayUser = user;

  const showGoBackButton = isImpersonating;
  const showGoToAgencyButton =
    user?.agency_admin && user?.agency_username && !isImpersonating;
  const showGoToAdminButton = user?.admin === 1 && !isImpersonating;

  // Check subscription status
  const paidUntil = user?.paid_until;
  const paidUntilDate = paidUntil ? new Date(paidUntil + "T00:00:00Z") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isExpired = paidUntilDate && paidUntilDate < today;
  const isAgencyUser = !!user?.agency_username;

  // Check if user belongs to an agency and settings are loaded
  const hasAgencyBranding = user?.agency_username && isLoaded;

  // Use store values for branding (store handles defaults)
  const sidebarBgColor = hasAgencyBranding
    ? menuBackground || "white"
    : "white";
  const borderColor =
    hasAgencyBranding && menuColor ? `${menuColor}30` : "#e5e7eb";

  return (
    <div
      className={`h-screen border-r border-gray-200 shadow-xl flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 shrink-0 ${
        isCollapsed
          ? "w-auto px-4 py-[43px]"
          : "w-[300px] p-[43px] overflow-hidden"
      }`}
      style={{
        backgroundColor: sidebarBgColor,
      }}
    >
      <div className="relative flex items-center text-2xl font-bold mb-8 justify-between">
        {!isCollapsed && (!user?.agency_username || isLoaded) && (
          <div className="mx-auto">
            {logoImage ? (
              <img src={logoImage} alt="Logo" style={{ width: logoWidth }} />
            ) : isWhitelabelDomain() ? (
              <img src={whitelabel_logo} alt="Logo" className="w-[160px]" />
            ) : (
              <img src={main_logo} alt="Logo" className="w-[50px]" />
            )}
          </div>
        )}
        <span
          onClick={toggleSidebar}
          className={`cursor-pointer ${
            !isCollapsed ? "absolute right-0" : ""
          }`}
        >
          <img
            src={closeBtn}
            alt="Close"
            className={`w-[20px] h-[20px] rounded-full ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </span>
      </div>

      <div className="mb-8">
        {!isCollapsed && (
          <div className="flex items-center mb-2.5">
            {/* Profile picture with fallback - show original user */}
            <img
              src={
                displayUser?.accounts?.linkedin?.data?.profile_picture_url ||
                no_image
              }
              alt={`${displayUser?.first_name} ${displayUser?.last_name}`}
              className="w-10 h-10 rounded-full mr-3"
            />

            <div>
              <p className="font-normal text-[20px] text-[#454545] font-raleway">
                {displayUser?.first_name} {displayUser?.last_name}
              </p>
              <p className="text-normal text-grey text-[11px] font-raleway">
                {displayUser?.email}
              </p>
            </div>
          </div>
        )}
        {!isCollapsed && (
          <div className="space-y-2">
            {/* Go Back Button (when impersonating) */}
            {showGoBackButton && (
              <div
                onClick={handleGoBack}
                className="flex items-center w-full cursor-pointer border border-[#0387FF] px-[14px] py-[6px] rounded-2xl hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-start gap-x-3">
                  <BackIcon />
                  <p className="font-medium text-[#0387FF] text-[14px]">
                    {getGoBackButtonText()}
                  </p>
                </div>
              </div>
            )}

            {/* Go to Agency Button */}
            {showGoToAgencyButton && (
              <div
                onClick={handleGoToAgency}
                className="flex items-center w-full cursor-pointer border border-[#0387FF] px-[14px] py-[6px] rounded-2xl hover:bg-blue-50 transition-colors"
              >
                <div className="w-full flex items-center justify-between">
                  <p className="font-medium text-[#0387FF] text-[14px]">
                    Go to Agency
                  </p>
                  <ArrowRight />
                </div>
              </div>
            )}

            {/* Go to Admin Button */}
            {showGoToAdminButton && (
              <div
                onClick={handleGoToAdmin}
                className="flex items-center w-full cursor-pointer border border-[#0387FF] px-[14px] py-[6px] rounded-2xl hover:bg-blue-50 transition-colors"
              >
                <div className="w-full flex items-center justify-between">
                  <p className="font-medium text-[#0387FF] text-[14px]">
                    Go to Admin
                  </p>
                  <ArrowRight />
                </div>
              </div>
            )}
          </div>
        )}

        {/*
     <ul className="space-y-2">
      <MenuItem
      text="Notification"
      to="/notification"
      isCollapsed={isCollapsed}
     /> 
     <li
      className="flex items-center py-2 gap-[12px] text-[14px] text-[#6D6D6D] cursor-pointer hover:bg-gray-50"
      onClick={() => setIsNotificationOpen(true)}
     >
      <span className="relative w-4 h-4">
       <NotificationIcon className="fill-[#6D6D6D]" />
       <span className="absolute -top-1 -right-1 w-[13px] h-[13px] text-[11px] text-white bg-[#0387FF] rounded-full flex justify-center items-center">
        1
       </span>
      </span>
      {!isCollapsed && <span>Notification</span>}
     </li>
    </ul>
    */}
      </div>

      {!isCollapsed && (
        <div className="border-t mb-4" style={{ borderColor }}></div>
      )}

      <div
        className={`${
          isCollapsed ? "" : "overflow-y-auto max-h-[calc(100vh-300px)]"
        }`}
      >
        <div className="mb-6">
          <ul className="space-y-2">
            <MenuItem
              text="Dashboard"
              to="/dashboard"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
            <MenuItem
              text="Campaigns"
              to="/campaigns"
              isCollapsed={isCollapsed}
              hasSubmenu
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            >
              <ul
                className={`text-[#6D6D6D] ${
                  isCollapsed
                    ? "space-y-2 text-sm"
                    : "pl-8 mt-1 space-y-2 text-sm"
                }`}
              >
                <li className="relative group">
                  {isExpired ? (
                    <>
                      <span className="block py-1 text-gray-400 cursor-not-allowed">
                        Create a Campaign
                      </span>
                      <span className="absolute left-full ml-2 top-0 w-[200px] bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-50 pointer-events-none">
                        {isAgencyUser
                          ? "Subscription expired. Contact your agency administrator."
                          : "Subscription expired. Please renew to create campaigns."}
                      </span>
                    </>
                  ) : (
                    <NavLink
                      to="/campaigns/create"
                      className={({ isActive }) =>
                        `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
                      }
                    >
                      Create a Campaign
                    </NavLink>
                  )}
                </li>
                <li>
                  <NavLink
                    to="/campaigns/workflows"
                    className={({ isActive }) =>
                      `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
                    }
                  >
                    Workflows
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/campaigns/templates"
                    className={({ isActive }) =>
                      `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
                    }
                  >
                    Templates
                  </NavLink>
                </li>
                {/* <li>
         <NavLink
          to="/campaigns/templates"
          className={({ isActive }) =>
           `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
          }
         >
          Templates
         </NavLink>
        </li> */}
                <li>
                  <NavLink
                    to="/campaigns/personas"
                    className={({ isActive }) =>
                      `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
                    }
                  >
                    Personas
                  </NavLink>
                </li>
              </ul>
            </MenuItem>
            <MenuItem
              text="Social Engagements"
              to="/social-engagements"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
            <MenuItem
              text="Inbox"
              to="/inbox"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
          </ul>
        </div>

        <div className="mt-auto">
          <div className="border-t mb-4" style={{ borderColor }}></div>
          <ul className="space-y-1">
            <MenuItem
              text="Blacklists"
              to="/blacklists"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
            <MenuItem
              text="Settings"
              to="/settings"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
            {!isAgencyUser && (
              <MenuItem
                text="Billing"
                to="/billing"
                isCollapsed={isCollapsed}
                menuColor={hasAgencyBranding ? menuColor : null}
                menuTextBackgroundHover={
                  hasAgencyBranding ? menuTextBackgroundHover : null
                }
                menuTextHoverColor={
                  hasAgencyBranding ? menuTextHoverColor : null
                }
              />
            )}
{/* <MenuItem
              text="Feature Suggestion"
              to="/feature-suggestion"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            /> */}
            <MenuItem
              text="Logout"
              to="/logout"
              isCollapsed={isCollapsed}
              menuColor={hasAgencyBranding ? menuColor : null}
              menuTextBackgroundHover={
                hasAgencyBranding ? menuTextBackgroundHover : null
              }
              menuTextHoverColor={
                hasAgencyBranding ? menuTextHoverColor : null
              }
            />
          </ul>
        </div>
      </div>
      {isNotificationOpen && (
        <NotificationModal onClose={() => setIsNotificationOpen(false)} />
      )}
    </div>
  );
};

const MenuItem = ({
  text,
  to,
  isCollapsed,
  children,
  hasSubmenu,
  disabled = false,
  tooltipText = null,
  menuColor,
  menuTextBackgroundHover,
  menuTextHoverColor,
}) => {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isSubmenuActive = hasSubmenu && location.pathname.startsWith(to);
  const withBadge = text === "Notification";
  const boldItems = [
    "Blacklists",
    "Settings",
    "Billing",
    "Feature Suggestion",
    "Logout",
  ];

  // Determine icon color based on active state and menuColor prop
  const getIconColor = isActive => {
    if (isActive) return "#0387FF"; // Active color remains blue
    return menuColor || "#6D6D6D"; // Use menuColor prop if provided, otherwise default
  };

  const baseStyle = menuColor ? { color: menuColor } : {};
  const hoverStyle =
    hovered && menuTextBackgroundHover
      ? {
          backgroundColor: menuTextBackgroundHover,
          color: menuTextHoverColor || menuColor || "#6D6D6D",
        }
      : {};

  if (disabled) {
    return (
      <li className="relative group flex items-start py-2 gap-[12px] text-[14px] cursor-not-allowed font-medium">
        <span className="relative w-4 h-4">
          {text === "Social Engagements" && (
            <SocialEngagementsIcon className="fill-gray-400" />
          )}
          {text === "Campaigns" && <CampaignsIcon className="fill-gray-400" />}
        </span>
        {!isCollapsed && (
          <>
            <span className="text-gray-400">{text}</span>
            {tooltipText && (
              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-[200px] bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-normal z-50 pointer-events-none">
                {tooltipText}
              </span>
            )}
          </>
        )}
      </li>
    );
  }

  return (
    <li
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={to}
        end={to === "/dashboard"}
        className={({ isActive }) => {
          const baseClasses = `flex items-center py-2 gap-[12px] text-[14px] ${
            menuColor ? "" : "hover:bg-gray-50"
          }`;
          const activeText =
            isActive || isSubmenuActive
              ? "text-[#0387FF]"
              : menuColor
              ? ""
              : "text-[#6D6D6D]";
          const bold = boldItems.includes(text) ? "text-[15px]" : "";
          return `${baseClasses} ${activeText} ${bold}`;
        }}
        style={({ isActive }) => ({
          ...(isActive ? {} : baseStyle),
          ...(!isActive ? hoverStyle : {}),
        })}
      >
        {({ isActive }) => (
          <>
            <span className="relative w-4 h-4">
              {text === "Notification" && (
                <NotificationIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Dashboard" && (
                <DashboardIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Campaigns" && (
                <CampaignsIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Social Engagements" && (
                <SocialEngagementsIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Inbox" && (
                <InboxIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Personas" && (
                <PersonasIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Blacklists" && (
                <BlacklistIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Settings" && (
                <SettingsIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Billing" && (
                <BillingIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Feature Suggestion" && (
                <FeatureIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {text === "Logout" && (
                <LogoutIcon
                  className={
                    isActive
                      ? "fill-[#0387FF]"
                      : menuColor
                      ? ""
                      : "fill-[#6D6D6D]"
                  }
                  fill={!isActive ? getIconColor(isActive) : undefined}
                />
              )}
              {withBadge && (
                <span className="absolute -top-1 -right-1 w-[13px] h-[13px] text-[11px] text-white bg-[#0387FF] rounded-full flex justify-center items-center">
                  1
                </span>
              )}
            </span>
            {!isCollapsed && <span>{text}</span>}
          </>
        )}
      </NavLink>

      {isCollapsed && hasSubmenu && hovered && (
        <div className="absolute top-0 left-full ml-2 bg-white border border-gray-200 shadow-md rounded p-3 w-48 z-[9999]">
          {children}
        </div>
      )}

      {!isCollapsed && hasSubmenu && isSubmenuActive && children}
    </li>
  );
};

export default SideBar;
