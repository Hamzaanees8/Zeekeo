import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const sessionToken = localStorage.getItem("sessionToken");

  if (!sessionToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
