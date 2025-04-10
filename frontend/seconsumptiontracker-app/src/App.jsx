import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import UserDashboard from "./pages/UserDashboardPage";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./components/Footer";
import BillCalculator from "./pages/BillCalculator";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./App.css";
import BillCalcuOutput from "./pages/BillCalcuOutput";
import LoginFormDemo from "./components/login-form-demo";
import SignupFormDemo from "./components/signup-form-demo";
import HeroPage from "./pages/HeroPage";
import ProfilePage from "./pages/ProfilePage";
import BillPrediction from "./pages/BillPredictionPage";
import ForgotPassword from "./components/ForgotPasswordForm";
import AboutPage from "./pages/AboutPage";

function App() {
  const location = useLocation();
  const hideFooterPaths = ["/profile"];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <MantineProvider>
      {/* <AuthRedirect /> */}
      <Navigation />
      <Routes>
        <Route exact path="/" element={<HeroPage />} />
        <Route exact path="/login-form" element={<LoginFormDemo />} />
        <Route exact path="/signup-form" element={<SignupFormDemo />} />
        <Route exact path="/bill-calculator" element={<BillCalculator />} />
        <Route exact path="/bill-prediction" element={<BillPrediction />} />
        <Route exact path="/about" element={<AboutPage />} />
        <Route
          exact
          path="/forgot-password-form"
          element={<ForgotPassword />}
        />

        {/* Private route for user dashboard */}
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<UserDashboard />} />}
        />

        {/* Private route for user dashboard */}
        <Route
          path="/profile"
          element={<PrivateRoute element={<ProfilePage />} />}
        />

        <Route exact path="/bill-output" element={<BillCalcuOutput />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </MantineProvider>
  );
}

// Auto-redirect component for persisting login
const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    const expirationTime = localStorage.getItem("authExpiration");

    // Redirect to dashboard only if the token is valid
    if (idToken && expirationTime && Date.now() < parseInt(expirationTime)) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return null;
};

export default App;
