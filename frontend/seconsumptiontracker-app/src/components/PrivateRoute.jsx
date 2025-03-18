import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ element }) => {
  const idToken = localStorage.getItem("idToken"); // Check if user is authenticated

  if (!idToken) {
    return <Navigate to="/login-form" replace />; // Redirect to login page if not authenticated
  }

  return element;
};

export default PrivateRoute;
