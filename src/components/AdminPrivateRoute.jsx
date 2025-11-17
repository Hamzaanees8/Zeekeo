import { Navigate } from "react-router-dom";
import { useAuthStore } from "../routes/stores/useAuthStore";

const AdminPrivateRoute = ({ children }) => {
  const { currentUser: user } = useAuthStore();
  if (!user || user.admin !== 1) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminPrivateRoute;
