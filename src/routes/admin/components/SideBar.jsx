import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AdminAgenciesIcon,
  AdminCancellationsIcon,
  AdminUsersIcon,
  DashboardIcon,
  LogoutIcon,
  NotificationIcon,
  SettingsIcon,
} from "../../../components/Icons";
import closeBtn from "../../../assets/s_close_btn.png";
import main_logo from "../../../assets/logo.png";
import NotificationModal from "../../../components/NotificationModal";
const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
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
      className={`bg-white h-screen border-r border-gray-200 shadow-xl flex flex-col sticky top-[1px] transition-all duration-300 ease-in-out z-50 ${
        isCollapsed
          ? "w-auto px-4 py-[43px]"
          : "w-[335px] p-[43px] overflow-hidden"
      }`}
    >
      <div className="flex text-2xl font-bold mb-8 justify-between items-center">
        {!isCollapsed && (
          <img src={main_logo} alt="Logo" className="w-[113px]" />
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

      <div className="mb-8">
        {!isCollapsed && (
          <div className="flex items-center mb-2.5">
            <div>
              <p className="font-normal text-[24px] text-grey font-raleway">
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
            text="Notifications"
            to="/admin/notifications"
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
              to="/admin/dashboard"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Agencies"
              to="/admin/agencies"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Users"
              to="/admin/users"
              isCollapsed={isCollapsed}
            />
            <MenuItem
              text="Cancellations"
              to="/admin/cancellations"
              isCollapsed={isCollapsed}
            />
          </ul>
        </div>

        <div className="mt-auto">
          <div className="border-t border-gray-200 mb-4"></div>
          <ul className="space-y-1">
            <MenuItem
              text="Settings"
              to="/admin/settings"
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

const MenuItem = ({ text, to, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  const withBadge = text === "Notifications";
  let fontSize = "text-[14px]";
  let fontWeight = "font-[500]";

  if (text === "Notification") {
    fontWeight = "font-[400]";
  } else if (text === "Settings" || text === "Logout") {
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
          {text === "Agencies" && (
            <AdminAgenciesIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Users" && (
            <AdminUsersIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Cancellations" && (
            <AdminCancellationsIcon
              className={isActive ? "fill-[#0387FF]" : "fill-[#6D6D6D]"}
            />
          )}
          {text === "Settings" && (
            <SettingsIcon
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
