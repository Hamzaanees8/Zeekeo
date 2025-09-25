import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../utils/user-helpers";

const CampaignPrivateRoute = ({ children }) => {
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin;
  const email = user?.accounts?.email;
  if (!linkedin || !email) {
    return <Navigate to="/campaigns" replace />;
  }

  return children;
};

export default CampaignPrivateRoute;
