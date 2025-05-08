import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { FcGoogle } from "react-icons/fc";
import wattifyLogo from "../assets/wattify.png";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import { auth, database } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get, getDatabase } from "firebase/database";

export default function SignupFormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    googleSigninEmail: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Password validation
  const validatePassword = (password) => /^(?=.*\d).{8,}$/.test(password);

  // Function to check email verification
  const checkEmailVerification = async (user) => {
    const interval = setInterval(async () => {
      await user.reload(); // Refresh user data
      if (user.emailVerified) {
        clearInterval(interval); // Stop checking

        // Save user data to Firebase Realtime Database after email is verified
        await set(ref(database, "users/" + user.uid), {
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          emailVerified: true,
        });

        setSuccessMessage("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login-form"), 2000);
      }
    }, 3000); // Check every 3 seconds
  };

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

        navigate("/dashboard", { replace: true });
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
    setLoading(true);

    let validationErrors = { ...errors, email: "", password: "" };
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
    } else if (!validatePassword(password)) {
      validationErrors.password = "At least 8 chars & 1 digit required.";
      isValid = false;
    }

    setErrors(validationErrors);

    if (!isValid) {
      setTimeout(() => setErrors({ ...errors, email: "", password: "" }), 3000);
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      setSuccessMessage(
        "A verification email has been sent. Please verify your email."
      );

      // Check email verification
      checkEmailVerification(user);

      setEmail("");
      setPassword("");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrors({
          ...errors,
          email: "This email is already registered.",
        });
      } else {
        setErrors({
          ...errors,
          email: "An error occurred. Please try again.",
        });
      }
      setTimeout(() => setErrors({ ...errors, email: "", password: "" }), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="mx-auto w-full max-w-md rounded-none bg-black/60 p-4 md:rounded-2xl md:p-8 dark:bg-black shadow-[0px_0px_15px_5px_rgba(0,183,235,0.1)]">
        <div className="w-full flex justify-center">
          <img src={wattifyLogo} alt="Wattify" className="w-20" />
        </div>
        <h2 className="text-3xl text-center font-bold text-white dark:text-neutral-200 mt-5">
          Create an account
        </h2>
        <p className="mt-5 max-w-sm text-sm text-white/80 dark:text-neutral-300">
          Sign up to wattify to access all features.
        </p>

        {successMessage && (
          <p className="mt-2 text-green-400 text-sm text-center">
            {successMessage}
          </p>
        )}

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              type="email"
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
                Register
                <BottomGradient />
              </>
            )}
          </button>

          <p className="text-white mt-4 text-center cursor-pointer">
            Already have an account?{" "}
            <Link to="/login-form" className="text-cta-bluegreen">
              Login Here
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
