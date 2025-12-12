import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  AdminAgenciesIcon,
  AdminCancellationsIcon,
  AdminUsersIcon,
  BackIcon,
  DashboardIcon,
  LogoutIcon,
  NotificationIcon,
  SettingsIcon,
} from "../../../components/Icons";
import closeBtn from "../../../assets/s_close_btn.png";
import main_logo from "../../../assets/logo_small.png";
import NotificationModal from "../../../components/NotificationModal";
import { useAuthStore } from "../../stores/useAuthStore";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const store = useAuthStore();
  const user = store.currentUser;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // Helper functions
  const isImpersonating = store.impersonationChain.length > 0;
  const getCurrentUserType = () => {
    if (store.impersonationChain.length === 0) return "admin";
    return store.impersonationChain[store.impersonationChain.length - 1]
      .userType;
  };

  const getOriginalUser = () => {
    return store.originalUser || store.currentUser;
  };

  // Handle back button - only shown when impersonating from admin
  const handleBack = () => {
    if (isImpersonating) {
      const currentType = getCurrentUserType();
      store.exitImpersonation();

      if (currentType === "agency") {
        // Admin → Agency → back to Admin
        window.location.reload();
      } else if (currentType === "user") {
        // Admin → User → back to Admin
        navigate("/admin/dashboard");
      }
    }
  };

  // Display user (show original when impersonating)
  const displayUser = getOriginalUser();

  // Only show back button when admin is impersonating
  const showBackButton = isImpersonating;

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
          <div className="mx-auto">
            <img src={main_logo} alt="Logo" className="w-[50px]" />
          </div>
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
                {displayUser?.first_name} {displayUser?.last_name}
              </p>
              <p className="text-normal text-grey text-[11px] font-raleway">
                {displayUser?.email}
              </p>
            </div>
          </div>
        )}

        {/* Show back button only when admin is impersonating */}
        {!isCollapsed && showBackButton && (
          <div onClick={handleBack}>
            <div className="flex items-center mb-2.5 w-full cursor-pointer border border-[#0387FF] px-[14px] py-[6px] rounded-2xl hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-start gap-x-3">
                <BackIcon />
                <p className="font-medium text-[#0387FF] text-[14px]">
                  Go back to Admin
                </p>
              </div>
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
