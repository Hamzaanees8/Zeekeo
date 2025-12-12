import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import closeBtn from "../assets/s_close_btn.png";
import main_logo from "../assets/logo_small.png";
import no_image from "../assets/no_image.png";
import NotificationModal from "./NotificationModal";
import { useNavigate } from "react-router-dom";
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
    console.log("Going back from:", currentType);

    // Exit one level of impersonation
    store.exitImpersonation();

    // Navigate based on what we're going back to
    if (currentType === "user") {
      navigate("/agency/dashboard");
    } else if (currentType === "user-agency-admin") {
      store.clearAllImpersonation();
      window.location.reload();
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

  return (
    <div
      className={`bg-white h-screen border-r border-[#7E7E7E] shadow-lg flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 ${
        isCollapsed
          ? "w-auto px-4 py-[43px]"
          : "w-[335px] p-[43px] overflow-hidden"
      }`}
    >
      <div className="relative flex items-center text-2xl font-bold mb-8">
        {!isCollapsed && (
          <div className="mx-auto">
            <img src={main_logo} alt="Logo" className="w-[50px]" />
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
              isCollapsed ? "rotate-180" : "mr-2"
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

      {!isCollapsed && <div className="border-t border-gray-200 mb-4"></div>}

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
            />
            <MenuItem
              text="Campaigns"
              to="/campaigns"
              isCollapsed={isCollapsed}
              hasSubmenu
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
            />
            <MenuItem text="Inbox" to="/inbox" isCollapsed={isCollapsed} />
          </ul>
        </div>

        <div className="mt-auto">
          <div className="border-t border-gray-200 mb-4"></div>
          <ul className="space-y-1">
            <MenuItem
              text="Blacklists"
              to="/blacklists"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Settings"
              to="/settings"
              isCollapsed={isCollapsed}
            />
            <MenuItem text="Billing" to="/billing" isCollapsed={isCollapsed} />
            <MenuItem
              text="Feature Suggestion"
              to="/feature-suggestion"
              isCollapsed={isCollapsed}
            />
            <MenuItem text="Logout" to="/logout" isCollapsed={isCollapsed} />
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
          const baseClasses =
            "flex items-center py-2 gap-[12px] text-[14px] hover:bg-gray-50";
          const activeText =
            isActive || isSubmenuActive ? "text-[#0387FF]" : "text-[#6D6D6D]";
          const bold = boldItems.includes(text) ? "text-[15px]" : "";
          return `${baseClasses} ${activeText} ${bold}`;
        }}
      >
        {({ isActive }) => (
          <>
            <span className="relative w-4 h-4">
              {text === "Notification" && (
                <NotificationIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Dashboard" && (
                <DashboardIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Campaigns" && (
                <CampaignsIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Social Engagements" && (
                <SocialEngagementsIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Inbox" && (
                <InboxIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Personas" && (
                <PersonasIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Blacklists" && (
                <BlacklistIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Settings" && (
                <SettingsIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Billing" && (
                <BillingIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Feature Suggestion" && (
                <FeatureIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
                />
              )}
              {text === "Logout" && (
                <LogoutIcon
                  className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
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
