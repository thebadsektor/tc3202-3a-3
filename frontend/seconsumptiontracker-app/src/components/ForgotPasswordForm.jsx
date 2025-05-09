import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import axios from "axios";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Email validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Password validation
  const validatePassword = (password) => /^(?=.*\d).{8,}$/.test(password);

  // OTP input handler with validation
  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Only allow numeric input and maximum 6 digits
    if (value === "" || (/^\d+$/.test(value) && value.length <= 6)) {
      setOtp(value);
    }
  };

  const handleSendOtp = async () => {
    let validationErrors = { ...errors, email: "" };
    let isValid = true;

    if (!email.trim()) {
      validationErrors.email = "Email is required.";
      isValid = false;
    } else if (!validateEmail(email)) {
      validationErrors.email = "Enter a valid email.";
      isValid = false;
    }

    setErrors(validationErrors);

    if (!isValid) {
      setTimeout(() => setErrors({ ...errors, email: "" }), 3000);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/send-otp-reset-password/",
        {
          email: email,
        }
      );

      if (response.data.success) {
        setOtpSent(true);
        setTimer(60); // 1-minute cooldown
        setSuccessMessage("OTP sent to your email");

        // Start cooldown timer
        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev === 1) clearInterval(countdown);
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrors({
          ...errors,
          email: response.data.error || "Failed to send OTP",
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        email:
          error.response?.data?.error || "Failed to send OTP. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    let validationErrors = {
      ...errors,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!otp.trim()) {
      validationErrors.otp = "OTP is required.";
      isValid = false;
    }

    if (!newPassword.trim()) {
      validationErrors.newPassword = "New password is required.";
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      validationErrors.newPassword = "At least 8 chars & 1 digit required.";
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      validationErrors.confirmPassword = "Confirm password is required.";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(validationErrors);

    if (!isValid) {
      setTimeout(
        () =>
          setErrors({
            ...errors,
            otp: "",
            newPassword: "",
            confirmPassword: "",
          }),
        3000
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/verify-otp-and-reset-password/",
        {
          email: email,
          otp: otp,
          newPassword: newPassword,
        }
      );

      if (response.data.success) {
        setSuccessMessage("Password reset successfully!");
        // Optionally redirect to login page after a delay
        setTimeout(() => {
          window.location.href = "/login-form";
        }, 2000);
      } else {
        setErrors({
          ...errors,
          otp: response.data.error || "Failed to reset password",
        });
      }
    } catch (error) {
      setErrors({
        ...errors,
        otp:
          error.response?.data?.error ||
          "Failed to reset password. Try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-md rounded-lg bg-black/60 p-4 md:rounded-2xl md:p-8 dark:bg-black shadow-[0px_0px_15px_5px_rgba(0,183,235,0.1)]">
        <h2 className="text-3xl text-center font-bold text-white dark:text-neutral-200 mt-5">
          Forgot Password
        </h2>
        <p className="mt-5 max-w-sm text-sm text-white/80 dark:text-neutral-300">
          {otpSent
            ? "Enter OTP sent to your email"
            : "Enter your email to receive an OTP"}
        </p>

        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 p-2 rounded mt-4 text-center">
            {successMessage}
          </div>
        )}

        <form className="my-8">
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="example@gmail.com"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </LabelInputContainer>

          {otpSent && (
            <>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="6-digit OTP"
                  type="text"
                  value={otp}
                  maxLength={6}
                  onChange={handleOtpChange}
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                )}
              </LabelInputContainer>

              <LabelInputContainer className="mb-4">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  placeholder="New Password*"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </LabelInputContainer>

              <LabelInputContainer className="mb-4">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  placeholder="Confirm Password*"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </LabelInputContainer>
            </>
          )}

          {!otpSent ? (
            <button
              type="button"
              className="cursor-pointer group/btn mt-5 relative block h-10 w-full rounded-md bg-[#0e1a1c] font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              onClick={handleSendOtp}
              disabled={timer > 0 || loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Sending...
                </span>
              ) : timer > 0 ? (
                `Resend OTP in ${timer}s`
              ) : (
                <>
                  Send OTP
                  <BottomGradient />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="cursor-pointer group/btn mt-5 relative block h-10 w-full rounded-md bg-gray-900 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              onClick={handleResetPassword}
              disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Processing...
                </span>
              ) : (
                <>
                  Reset Password &rarr;
                  <BottomGradient />
                </>
              )}
            </button>
          )}

          <p className="text-white mt-4 text-center">
            <Link to="/login-form" className="text-cta-bluegreen">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// UI Components
const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};
