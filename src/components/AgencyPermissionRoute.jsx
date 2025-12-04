import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/user-helpers";
import toast from "react-hot-toast";

export default function AgencyPermissionRoute({ permissionKey, children }) {
  const user = getCurrentUser();
  const isAgencyConnected = !!user?.agency_username;
  const isAdmin = user?.admin === 1;
  const permissions = user?.agency_permissions || {};

  if (!isAdmin && isAgencyConnected && !user?.agency_admin && permissions[permissionKey] === false) {
    setTimeout(() => {
      toast.error("You do not have permission to access this section.");
    }, 0);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
