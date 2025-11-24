import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AdminAgenciesIcon,
  AdminUsersIcon,
  BackIcon,
  BillingIcon,
  CampaignsIcon,
  DashboardIcon,
  FeatureIcon,
  InboxIcon,
  LogoutIcon,
  LogsIcon,
  NotificationIcon,
  SettingsIcon,
  TemplatesIcon,
  WorkflowsIcon,
} from "../../../../components/Icons";
import closeBtn from "../../../../assets/s_close_btn.png";
import main_logo from "../../../../assets/logo.png";

const SideBar = ({ bg, logo, width, textColor }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <div
      className={`h-screen border-r border-gray-200 shadow-xl flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 ${
        isCollapsed
          ? "w-auto px-4 py-[43px]"
          : "w-[270px] p-[43px] overflow-hidden"
      }`}
      style={{
        backgroundColor: bg || "white",
      }}
    >
      <div className="flex text-2xl font-bold mb-8 justify-between items-center">
        {!isCollapsed && logo ? (
          <img src={logo} alt="Logo" style={{ width: width || "113px" }} />
        ) : (
          <p
            className="text-[16px] font-normal"
            style={{ color: textColor || "#6D6D6D" }}
          >
            Logo will appear here
          </p>
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
          <div
            className="flex items-center mb-2.5 w-full cursor-pointer border px-[14px] py-[6px] rounded-2xl"
            style={{ borderColor: textColor || "#0387FF" }}
          >
            <div className="flex items-center justify-start gap-x-3">
              <BackIcon fill={textColor || "#0387FF"} />
              <p
                className="font-medium text-[14px]"
                style={{ color: textColor || "#0387FF" }}
              >
                Back to Admin
              </p>
            </div>
          </div>
        )}
        {!isCollapsed && (
          <div className="flex items-center mb-2.5">
            <div>
              <p
                className="font-normal text-[24px] font-raleway"
                style={{ color: textColor || "#6D6D6D" }}
              >
                Robert Kerk
              </p>
              <p
                className="text-normal text-[11px] font-raleway"
                style={{ color: textColor || "#6D6D6D" }}
              >
                robert.kerk@example.com
              </p>
            </div>
          </div>
        )}
        <ul className="space-y-2">
          <MenuItem
            text="Notifications"
            //to="/agency/notifications"
            isCollapsed={isCollapsed}
            textColor={textColor}
          />
        </ul>
      </div>

      {!isCollapsed && (
        <div
          className="border-t mb-4"
          style={{ borderColor: textColor ? `${textColor}30` : "#6D6D6D30" }}
        ></div>
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
              //to="/agency/dashboard"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Users"
              //to="/agency/users"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Campaigns"
              //to="/agency/campaigns"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Logs"
              //to="/agency/agency-logs"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Inbox"
              //to="/agency/inbox"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Templates"
              //to="/agency/templates"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Workflows"
              //to="/agency/workflows"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Sub Agencies"
              //to="/agency/sub-agencies"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
          </ul>
        </div>

        <div className="mt-auto">
          {!isCollapsed && (
            <div
              className="border-t mb-4"
              style={{
                borderColor: textColor ? `${textColor}30` : "#6D6D6D30",
              }}
            ></div>
          )}
          <ul className="space-y-1">
            <MenuItem
              text="Settings"
              //to="/agency/settings"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Billing"
              //to="/agency/billing"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Feature Suggestion"
              //to="/agency/feature-suggestion"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Logout"
              /*to="/logout"*/
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
          </ul>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ text, to, isCollapsed, textColor }) => {
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

  // Determine icon color based on active state and textColor prop
  const getIconColor = isActive => {
    if (isActive) return "#0387FF"; // Active color remains blue
    return textColor || "#6D6D6D"; // Use textColor prop if provided, otherwise default
  };

  const iconColor = getIconColor(isActive);

  return (
    <li className="relative">
      <NavLink
        to={to}
        end={to === "/dashboard"}
        className={() => {
          const baseClasses = `flex items-center py-2 gap-[12px] hover:bg-gray-50 ${fontSize} ${fontWeight}`;
          const activeText = isActive ? "text-[#0387FF]" : "";
          return `${baseClasses} ${activeText}`;
        }}
        style={!isActive ? { color: textColor || "#6D6D6D" } : {}}
      >
        <span className="relative w-4 h-4">
          {text === "Notifications" && (
            <NotificationIcon
              className={isActive ? "stroke-[#0387FF]" : ""}
              stroke={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Dashboard" && (
            <DashboardIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Users" && (
            <AdminUsersIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Campaigns" && (
            <CampaignsIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Logs" && (
            <LogsIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Inbox" && (
            <InboxIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Templates" && (
            <TemplatesIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Workflows" && (
            <WorkflowsIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Sub Agencies" && (
            <AdminAgenciesIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Settings" && (
            <SettingsIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Billing" && (
            <BillingIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Feature Suggestion" && (
            <FeatureIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {text === "Logout" && (
            <LogoutIcon
              className={isActive ? "fill-[#0387FF]" : ""}
              fill={!isActive ? iconColor : undefined}
            />
          )}
          {withBadge && (
            <span
              className="absolute -top-1 -right-1 w-[13px] h-[13px] text-[11px] text-white rounded-full flex justify-center items-center"
              style={{ backgroundColor: textColor || "#0387FF" }}
            >
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
