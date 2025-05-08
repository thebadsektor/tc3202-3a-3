import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import wattifyLogo from "../assets/wattify.png";
import { FcGoogle } from "react-icons/fc";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from "firebase/auth";
import { ref, set, get, getDatabase } from "firebase/database";
import { auth } from "../firebase"; // Import Firebase auth

export default function LoginFormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
    googleSigninEmail: "",
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
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for production

        localStorage.setItem("uid", user.uid);
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

        navigate("/profile", { replace: true });
      } else {
        setErrors({
          ...errors,
          googleSigninEmail: data.error || "Google Sign-In failed. Try again.",
        });
        setTimeout(() => setErrors({ ...errors, googleSigninEmail: "" }), 3000);
      }
    } catch (error) {
      setErrors({
        ...errors,
        googleSigninEmail: "Google Sign-In failed. Try again.",
      });
      setTimeout(() => setErrors({ ...errors, googleSigninEmail: "" }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = { ...errors, email: "", password: "", general: "" };
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
      setTimeout(() => {
        setErrors({ ...errors, email: "", password: "", general: "" });
      }, 3000);
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
        const expirationTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours for production

        localStorage.setItem("idToken", idToken); // Store ID token
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("authExpiration", expirationTime);

        // save the last page visited
        localStorage.setItem("lastVisitedPage", "/dashboard");

        setRedirecting(true);
        setTimeout(() => navigate("/profile"), 2000);
      } else {
        setErrors({
          ...errors,
          general: data.error || "Login failed",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ ...errors, general: "Invalid email or password" });
    }

    setTimeout(() => {
      setErrors({ ...errors, email: "", password: "", general: "" });
    }, 3000);
    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-none bg-black/60 p-4 md:rounded-2xl md:p-8 dark:bg-black shadow-[0px_0px_15px_5px_rgba(0,183,235,0.1)]">
        <div className="w-full flex justify-center">
          <img src={wattifyLogo} alt="Wattify" className="w-20" />
        </div>
        <h2 className="text-3xl text-center font-bold text-white dark:text-neutral-200 mt-5">
          Welcome Back
        </h2>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </LabelInputContainer>

          {errors.general && (
            <p className="text-red-500 text-xs mb-2">{errors.general}</p>
          )}

          <p className="text-blue-400">
            <Link to="/forgot-password-form" className="text-cta-bluegreen">
              Forgot password?
            </Link>
          </p>

          <button
            className="cursor-pointer group/btn mt-5 relative block h-10 w-full rounded-md bg-[#0e1a1c] font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Processing...
              </span>
            ) : (
              <>
                Login
                <BottomGradient />
              </>
            )}
          </button>

          <p className="text-white mt-4 text-center cursor-pointer">
            Don't have an account yet?{" "}
            <Link to="/signup-form" className="text-cta-bluegreen">
              Sign up Here
            </Link>
          </p>

          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          {errors.googleSigninEmail && (
            <p className="text-red-500 text-xs mb-2 text-center">
              {errors.googleSigninEmail}
            </p>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="cursor-pointer group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-[#0e1a1c] px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <FcGoogle className="text-2xl text-gray-400" />
              <span className="text-sm text-white dark:text-neutral-300">
                Continue with Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>

      {redirecting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-lg font-semibold text-white">
              Redirecting...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
