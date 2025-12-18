import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/user-helpers";

/**
 * Route guard that blocks agency users from accessing certain pages.
 * Agency users (users with agency_username) are redirected to dashboard.
 */
export default function NonAgencyRoute({ children }) {
  const user = getCurrentUser();
  const isAgencyUser = !!user?.agency_username;

  if (isAgencyUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
