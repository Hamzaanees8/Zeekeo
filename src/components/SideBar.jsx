import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import closeBtn from "../assets/s_close_btn.png";
import main_logo from "../assets/logo_small.png";
import no_image from "../assets/no_image.png";
import NotificationModal from "./NotificationModal";
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
} from "./Icons";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const location = useLocation();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const userObj = JSON.parse(userInfo);
        setUser(userObj);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }
  }, []);

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
            {/* Profile picture with fallback */}
            <img
              src={
                user?.accounts?.linkedin?.data?.profile_picture_url || no_image
              }
              alt={`${user.first_name} ${user.last_name}`}
              className="w-10 h-10 rounded-full mr-3"
            />

            <div>
              <p className="font-normal text-[18px] text-grey font-raleway">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-normal text-grey text-[11px] font-raleway">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <ul className="space-y-2">
          {/* <MenuItem
            text="Notification"
            to="/notification"
            isCollapsed={isCollapsed}
          /> */}
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
                <li>
                  <NavLink
                    to="/campaigns/create"
                    className={({ isActive }) =>
                      `block py-1 ${isActive ? "text-[#0387FF]" : ""}`
                    }
                  >
                    Create a Campaign
                  </NavLink>
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
              disabled
            />
            <MenuItem text="Inbox" to="/inbox" isCollapsed={isCollapsed} />
          </ul>
        </div>

        <div className="mt-auto">
          <div className="border-t border-gray-200 mb-4"></div>
          <ul className="space-y-1">
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
}) => {
  const [hovered, setHovered] = useState(false);
  const location = useLocation();
  const isSubmenuActive = hasSubmenu && location.pathname.startsWith(to);
  const withBadge = text === "Notification";
  const boldItems = ["Settings", "Billing", "Feature Suggestion", "Logout"];

  if (disabled) {
    return (
      <li className="relative flex items-start py-2 gap-[12px] text-[14px] text-[#6D6D6D] cursor-not-allowed">
        <span className="relative w-4 h-4">
          {text === "Social Engagements" && (
            <SocialEngagementsIcon className="fill-gray-400" />
          )}
        </span>
        {!isCollapsed && (
          <span>
            {text}{" "}
            <span className="ml-2 text-xs text-gray-400">(Coming Soon)</span>
          </span>
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
          const bold = boldItems.includes(text)
            ? "font-semibold text-raleway"
            : "";
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
