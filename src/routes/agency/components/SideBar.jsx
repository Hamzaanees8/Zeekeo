import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AdminAgenciesIcon,
  AdminUsersIcon,
  BackIcon,
  BillingIcon,
  BlacklistIcon,
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
import NotificationModal from "../../../components/NotificationModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore"; // Import the API function
import { getAgencySettings } from "../../../services/agency";

const SideBar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuBackground, setMenuBackground] = useState("");
  const [textColor, setTextColor] = useState("");
  const [logoImage, setLogoImage] = useState(null);
  const [logoWidth, setLogoWidth] = useState("113px");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { currentUser: user } = useAuthStore();
  const loginAsSessionToken = useAuthStore(s => s.loginAsSessionToken);
  const clearLoginAsToken = useAuthStore(s => s.clearLoginAsToken);

  // Fetch agency settings for sidebar customization
  useEffect(() => {
    const fetchAgencySettings = async () => {
      try {
        const data = await getAgencySettings();
        const dashboardSettings = data?.agency?.settings?.dashboard || {};

        if (dashboardSettings) {
          const { logo, menuBackground, textColor } = dashboardSettings;
          setMenuBackground(menuBackground || "#FFFFFF");
          setTextColor(textColor || "#6D6D6D");

          if (logo) {
            setLogoImage(logo.image || null);
            const { width } = logo;
            setLogoWidth(width ? `${width}` : "113px");
          }
        }
      } catch (error) {
        console.error("Error fetching agency settings for sidebar:", error);
      }
    };

    fetchAgencySettings();
  }, []);

  return (
    <div
      className={`h-screen border-r border-gray-200 shadow-xl flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 ${isCollapsed
        ? "w-auto px-4 py-[43px]"
        : "w-[335px] p-[43px] overflow-hidden"
        }`}
      style={{
        backgroundColor: menuBackground || "white",
      }}
    >
      <div className="flex text-2xl font-bold mb-8 justify-between items-center">
        {!isCollapsed && (
          <NavLink to={"/"} className="cursor-pointer">
            {logoImage ? (
              <img src={logoImage} alt="Logo" style={{ width: logoWidth }} />
            ) : (
              <img src={main_logo} alt="Logo" className="w-[113px]" />
            )}
          </NavLink>
        )}
        <span className="cursor-pointer" onClick={toggleSidebar}>
          <img
            src={closeBtn}
            alt="Close"
            className={`w-[20px] h-[20px] rounded-full ${isCollapsed ? "rotate-180" : "mr-2"
              }`}
          />
        </span>
      </div>

      <div className="mb-4">
        {!isCollapsed && (
          <>
            {loginAsSessionToken && (
              <div
                onClick={() => {
                  clearLoginAsToken();
                  navigate("/admin");
                }}
                className="flex items-center mb-2.5 w-full cursor-pointer border px-[14px] py-[6px] rounded-2xl"
                style={{ borderColor: textColor || "#0387FF" }}
              >
                <div className="flex items-center justify-start gap-x-3">
                  <BackIcon fill={textColor || "#0387FF"} />
                  <p
                    className="font-medium text-[14px]"
                    style={{ color: textColor || "#0387FF" }}
                  >
                    Go back to Admin
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        <ul className="space-y-2">
          <li
            className="flex items-center py-2 gap-[12px] text-[14px] cursor-pointer hover:bg-gray-50"
            onClick={() => setIsNotificationOpen(true)}
            style={{ color: textColor || "#6D6D6D" }}
          >
            <span className="relative w-4 h-4">
              <NotificationIcon
                className={textColor ? "" : "fill-[#6D6D6D]"}
                fill={textColor || undefined}
              />
              <span
                className="absolute -top-1 -right-1 w-[13px] h-[13px] text-[11px] text-white rounded-full flex justify-center items-center"
                style={{ backgroundColor: textColor || "#0387FF" }}
              >
                1
              </span>
            </span>
            {!isCollapsed && <span>Notification</span>}
          </li>
        </ul>
      </div>

      {!isCollapsed && (
        <div
          className="border-t mb-4"
          style={{ borderColor: textColor ? `${textColor}30` : "#6D6D6D30" }}
        ></div>
      )}

      <div
        className={`${isCollapsed ? "" : "overflow-y-auto max-h-[calc(100vh-300px)]"
          }`}
      >
        <div className="mb-6">
          <ul className="space-y-2">
            <MenuItem
              text="Dashboard"
              to="/agency/dashboard"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Users"
              to="/agency/users"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Logs"
              to="/agency/agency-logs"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Inbox"
              to="/agency/inbox"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Templates"
              to="/agency/templates"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Workflows"
              to="/agency/workflows"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Blacklists"
              to="/agency/blacklist"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Sub Agencies"
              to="/agency/sub-agencies"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
          </ul>
        </div>

        <div className="mt-auto">
          <div
            className="border-t mb-4"
            style={{ borderColor: textColor ? `${textColor}30` : "#6D6D6D30" }}
          ></div>
          <ul className="space-y-1">
            <MenuItem
              text="Settings"
              to="/agency/settings"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Billing"
              to="/agency/billing"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Feature Suggestion"
              to="/agency/feature-suggestion"
              isCollapsed={isCollapsed}
              textColor={textColor}
            />
            <MenuItem
              text="Logout"
              to="/logout"
              isCollapsed={isCollapsed}
              textColor={textColor}
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
          {text === "Blacklists" && (
            <BlacklistIcon
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
