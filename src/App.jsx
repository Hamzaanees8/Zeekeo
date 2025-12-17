import { Navigate } from "react-router-dom";

function App() {
  // Redirect to dashboard - PrivateRoute already handles auth check
  return <Navigate to="/dashboard" replace />;
}

export default App;
