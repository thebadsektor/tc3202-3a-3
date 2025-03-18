import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get, getDatabase } from "firebase/database";
// import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Import Firebase auth
import "../App.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Function to handle Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const db = getDatabase();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Send ID token to Django for verification
      const response = await fetch(
        "http://127.0.0.1:8000/auth/verify-google-token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for production, 1 min for testings

        localStorage.setItem("idToken", idToken);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("profilePic", user.photoURL);
        localStorage.setItem("authExpiration", expirationTime);

        // save the last page visited
        localStorage.setItem("lastVisitedPage", "/dashboard");

        // Check if user exists in Firebase Realtime Database
        const userRef = ref(db, "users/" + user.uid);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
          // If user does NOT exist, add to Firebase Realtime Database
          await set(userRef, {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
          });
        }

        navigate("/dashboard", { replace: true });
      } else {
        setErrors({
          googleSigninEmail: data.error || "Google Sign-In failed. Try again.",
        });
        setTimeout(() => setErrors({ googleSigninEmail: "" }), 3000);
      }
    } catch (error) {
      setErrors({
        googleSigninEmail: "Google Sign-In failed. Try again.",
      });
      setTimeout(() => setErrors({ googleSigninEmail: "" }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = { email: "", password: "", general: "" };
    let isValid = true;

    if (!email.trim()) {
      validationErrors.email = "Email is required.";
      isValid = false;
    } else if (!validateEmail(email)) {
      validationErrors.email = "Enter a valid email.";
      isValid = false;
    }

    if (!password.trim()) {
      validationErrors.password = "Password is required.";
      isValid = false;
    }

    setErrors(validationErrors);

    if (!isValid) {
      setTimeout(
        () => setErrors({ email: "", password: "", general: "" }),
        3000
      );
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch(
        "http://127.0.0.1:8000/auth/verify-login-token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for production, 1 min for testings

        localStorage.setItem("idToken", idToken); // Store ID token
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("authExpiration", expirationTime);

        // save the last page visited
        localStorage.setItem("lastVisitedPage", "/dashboard");

        setRedirecting(true);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setErrors({
          ...validationErrors,
          general: data.error || "Login failed",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ ...validationErrors, general: "Invalid email or password" });
    }

    setTimeout(() => setErrors({ email: "", password: "", general: "" }), 3000);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-t to-[#DEF6FF] from-[#8B9EE8]">
      <div className="container h-[92vh] flex items-center justify-center">
        <div className="flex flex-col gap-3 login-card bg-white h-auto py-10 px-15 rounded-2xl relative">
          <h1 className="text-center mb-5 text-2xl font-semibold text-font-black">
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Email address*"
              className="border-2 border-[#00000018] rounded-lg px-5 py-3 focus:border-cta-blue focus:ring-0 focus:outline-0 text-[1.2em] w-80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <input
              type="password"
              placeholder="Password*"
              className="border-2 border-[#00000018] rounded-lg px-5 py-3 focus:border-cta-blue focus:ring-0 focus:outline-0 text-[1.2em] w-80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}

            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}

            <p className="text-cta-blue font-semibold text-sm cursor-pointer hover:text-blue-400">
              Forgot Password?
            </p>

            <button
              type="submit"
              className="mt-3 bg-cta-blue hover:bg-blue-600 text-white font-semibold rounded-lg px-5 py-3 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="mt-3 font-light text-sm text-center">
            Don't have an account yet? &nbsp;
            <Link to="/register" className="text-cta-blue cursor-pointer">
              Sign up
            </Link>
          </p>

          <div className="mt-5 flex items-center gap-2">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="text-gray-500 text-sm">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mt-5 flex items-center gap-3 text-left bg-transparent border-2 border-[#00000018] text-font-black font-semibold rounded-lg px-5 py-3 cursor-pointer"
          >
            <FcGoogle className="text-2xl" /> Continue with Google
          </button>
        </div>
      </div>

      {redirecting && (
        <div className="absolute inset-0 bg-[#DEF6FF] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-cta-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-lg font-semibold text-font-black">
              Redirecting...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
