import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AdminAgenciesIcon,
  AdminUsersIcon,
  BackIcon,
  BillingIcon,
  //CampaignsIcon,
  DashboardIcon,
  FeatureIcon,
  InboxIcon,
  LogoutIcon,
  LogsIcon,
  NotificationIcon,
  SettingsIcon,
  TemplatesIcon,
  WorkflowsIcon,
} from "../../../components/Icons";
import closeBtn from "../../../assets/s_close_btn.png";
import main_logo from "../../../assets/logo.png";
const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`bg-white h-screen border-r border-gray-200 shadow-xl flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 ${
        isCollapsed
          ? "w-auto px-4 py-[43px]"
          : "w-[290px] p-[43px] overflow-hidden"
      }`}
    >
      <div className="flex text-2xl font-bold mb-8 justify-between items-center">
        {!isCollapsed && (
          <NavLink to={"/"} className="cursor-pointer">
            <img src={main_logo} alt="Logo" className="w-[113px]" />
          </NavLink>
        )}
        <span className="cursor-pointer" onClick={toggleSidebar}>
          <img
            src={closeBtn}
            alt="Close"
            className={`w-[20px] h-[20px] rounded-full ${
              isCollapsed ? "rotate-180" : "mr-2"
            }`}
          />
        </span>
      </div>

      <div className="mb-4">
        {!isCollapsed && (
          <NavLink to={"/admin"}>
            <div className="flex items-center mb-2.5 w-full cursor-pointer border border-[#0387FF] px-[14px] py-[6px] rounded-2xl">
              <div className="flex items-center justify-start gap-x-3">
                <BackIcon />
                <p className="font-medium text-[#0387FF] text-[14px]">
                  Back to Admin
                </p>
              </div>
            </div>
          </NavLink>
        )}
        <ul className="space-y-2">
          <MenuItem
            text="Notifications"
            to="/agency/notifications"
            isCollapsed={isCollapsed}
          />
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
              to="/agency/dashboard"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Users"
              to="/agency/users"
              isCollapsed={isCollapsed}
            />
            {/* <MenuItem
              text="Campaigns"
              to="/agency/campaigns"
              isCollapsed={isCollapsed}
            /> */}
            <MenuItem
              text="Logs"
              to="/agency/agency-logs"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Inbox"
              to="/agency/inbox"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Templates"
              to="/agency/templates"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Workflows"
              to="/agency/workflows"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Sub Agencies"
              to="/agency/sub-agencies"
              isCollapsed={isCollapsed}
            />
          </ul>
        </div>

        <div className="mt-auto">
          <div className="border-t border-gray-200 mb-4"></div>
          <ul className="space-y-1">
            <MenuItem
              text="Settings"
              to="/agency/settings"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Billing"
              to="/agency/billing"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Feature Suggestion"
              to="/agency/feature-suggestion"
              isCollapsed={isCollapsed}
            />
            <MenuItem text="Logout" to="/logout" isCollapsed={isCollapsed} />
          </ul>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ text, to, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  const withBadge = text === "Notifications";
  let fontSize = "text-[14px]";
  let fontWeight = "font-[500]";

  if (text === "Notification") {
    fontWeight = "font-[400]";
  } else if (
    text === "Settings" ||
    text === "Logout" ||
    text === "Billing" ||
    text === "Feature Suggestion"
  ) {
    fontSize = "text-[16px]";
    fontWeight = "font-[500]";
  }
  return (
    <li className="relative">
      <NavLink
        to={to}
        end={to === "/dashboard"}
        className={() => {
          const baseClasses = `flex items-center py-2 gap-[12px] hover:bg-gray-50 ${fontSize} ${fontWeight}`;
          const activeText = isActive ? "text-[#0387FF]" : "text-[#6D6D6D]";
          return `${baseClasses} ${activeText}`;
        }}
      >
        <span className="relative w-4 h-4">
          {text === "Notifications" && (
            <NotificationIcon
              className={isActive ? "stroke-[#0387FF]" : "stroke-[#6D6D6D]"}
            />
          )}
          {text === "Dashboard" && (
            <DashboardIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Users" && (
            <AdminUsersIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {/* {text === "Campaigns" && (
            <CampaignsIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )} */}
          {text === "Logs" && (
            <LogsIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Inbox" && (
            <InboxIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Templates" && (
            <TemplatesIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Workflows" && (
            <WorkflowsIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Sub Agencies" && (
            <AdminAgenciesIcon
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
      </NavLink>
    </li>
  );
};

export default SideBar;
