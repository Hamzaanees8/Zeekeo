import { Navigate } from "react-router-dom";
import { useAuthStore } from "../routes/stores/useAuthStore";

export default function PrivateRoute({ children }) {
  const { sessionToken } = useAuthStore();

  if (!sessionToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
