import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDropdown } from "react-icons/io";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "..//components/ui/avatar";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import wattifyLogo from "../assets/wattify-logo.png";
import { getAuth, signOut } from "firebase/auth";

import "../App.css";

function Navigation() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [mobileFeatureOpen, setMobileFeatureOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const mobileAvatarRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // For desktop dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsAvatarOpen(false);
      }

      // For mobile dropdown
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target) &&
        mobileAvatarRef.current &&
        !mobileAvatarRef.current.contains(event.target)
      ) {
        setMobileAvatarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //Navigation sticky effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  //Getting the email when loggedin
  useEffect(() => {
    const updateUserEmail = () => {
      const email = sessionStorage.getItem("userEmail");
      setUserEmail(email || "");
    };

    updateUserEmail();

    window.addEventListener("storage", updateUserEmail);

    return () => {
      window.removeEventListener("storage", updateUserEmail);
    };
  }, []);

  useEffect(() => {
    const checkAuthExpiration = () => {
      const expirationTime = localStorage.getItem("authExpiration");

      if (expirationTime && !isNaN(parseInt(expirationTime))) {
        const timeLeft = parseInt(expirationTime) - Date.now();

        if (timeLeft <= 0) {
          handleLogout();
        } else if (timeLeft <= 30 * 1000) {
          const userConfirmed = window.confirm(
            "Your session is about to expire. Do you want to log out now?"
          );
          if (userConfirmed) {
            handleLogout();
          }
        }
      }
    };

    checkAuthExpiration();

    // Check when the user switches back to the tab
    window.addEventListener("focus", checkAuthExpiration);

    // Check every second (1000ms) for testing
    const interval = setInterval(checkAuthExpiration, 1000);

    return () => {
      window.removeEventListener("focus", checkAuthExpiration);
      clearInterval(interval);
    };
  }, []);

  //Logging out
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();

    try {
      await signOut(auth);

      // Clear localStorage
      localStorage.removeItem("uid");
      localStorage.removeItem("idToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("profilePic");
      localStorage.removeItem("authExpiration");
      localStorage.removeItem("lastVisitedPage");

      // Close mobile menu after logout
      setMobileMenuOpen(false);

      // Navigate only after successful signout
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Separate state for mobile avatar dropdown
  const [mobileAvatarOpen, setMobileAvatarOpen] = useState(false);

  return (
    <>
      <div
        className={`w-full bg-[#252728] fixed top-0 z-50 transition-all duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="container w-full h-[8vh] border-blue-200 flex items-center justify-between">
          {/* Mobile Menu and Logo container */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <div className="md:hidden mr-4">
              {mobileMenuOpen ? (
                <IoMdClose
                  size={30}
                  className="cursor-pointer text-amber-50"
                  onClick={() => setMobileMenuOpen(false)}
                />
              ) : (
                <HiOutlineMenuAlt2
                  size={30}
                  className="cursor-pointer text-amber-50"
                  onClick={() => setMobileMenuOpen(true)}
                />
              )}
            </div>

            {/* Logo - Now staying on left */}
            <Link to="/">
              <div className="relative group cursor-pointer">
                <img
                  src={wattifyLogo}
                  alt="Wattify Logo"
                  className="w-30 mt-[-5px] cursor-pointer"
                />

                {/* Lottie Animation - Enlarged and Shows on Hover */}
                <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 w-32 h-22 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <DotLottieReact
                    src="https://lottie.host/b86e2c09-c1bf-4dda-a80d-a9a23314a9f2/7QhJLM0dgt.lottie"
                    loop
                    autoplay
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Mobile Profile Avatar - Always visible on right side */}
          <div className="md:hidden">
            {localStorage.getItem("idToken") ? (
              <div className="relative">
                <Avatar
                  ref={mobileAvatarRef}
                  onClick={() => setMobileAvatarOpen(!mobileAvatarOpen)}
                  className="cursor-pointer h-10 w-10"
                >
                  <AvatarImage
                    src={
                      localStorage.getItem("profilePic") ||
                      "https://github.com/shadcn.png"
                    }
                    className="text-black text-base hover:rounded-lg hover:bg-gray-100 transition-all duration-200"
                  />
                  <AvatarFallback />
                </Avatar>

                {/* Mobile Dropdown Menu - Fixed Positioning */}
                {mobileAvatarOpen && (
                  <div
                    ref={mobileDropdownRef}
                    className="absolute right-0 mt-2 w-40 bg-[#212121] shadow-lg rounded-lg p-2 z-50"
                  >
                    <Link
                      to="/profile"
                      onClick={() => {
                        setMobileAvatarOpen(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <button className="w-full text-gray-300 hover:bg-gray-600 text-left px-4 py-2 cursor-pointer">
                        Profile
                      </button>
                    </Link>

                    <button
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-600 cursor-pointer"
                      onClick={() => {
                        handleLogout();
                        setMobileAvatarOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login-form"
                className="text-black py-2 px-4 text-sm bg-cta-bluegreen rounded-lg font-semibold hover:bg-blue-400 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Desktop Menu */}
          <ul className="items-center justify-center hidden md:flex text-white">
            {/* Home is always shown */}
            <li>
              <Link
                to="/"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    window.location.href = window.location.href; // Reloads the page
                  }
                }}
                className="py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Home
              </Link>
            </li>

            {/* About is only shown when not logged in */}
            {!localStorage.getItem("idToken") && (
              <li>
                <Link
                  to="/about"
                  className="py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  About
                </Link>
              </li>
            )}

            {/* Features with Dropdown */}
            <li className="relative group">
              <div
                className="flex items-center gap-2 py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Features
                <IoIosArrowDropdown />
              </div>

              {/* Dropdown Menu */}
              <ul className="absolute right-0 w-max mt-2 p-3 z-15 text-gray-200 bg-[#212121] shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 divide-y divide-gray-400 translate-y-2 group-hover:translate-y-0">
                <li className="">
                  <Link
                    to="/bill-prediction"
                    className="block px-6 py-3 hover:bg-gray-700 text-base transition-all hover:rounded-lg"
                  >
                    Bill Prediction
                  </Link>
                </li>
                <li>
                  <Link
                    to="/consumption-calculator"
                    className="block px-6 py-3 hover:bg-gray-700 text-base transition-all hover:rounded-lg"
                  >
                    Energy Consumption Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    to="/energy-recommendation"
                    className="block px-6 py-3 hover:bg-gray-700 text-base transition-all hover:rounded-lg"
                  >
                    Save Energy (Optimization Suggestions)
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              {localStorage.getItem("idToken") ? (
                <div className="relative">
                  {/* Avatar Clickable */}
                  <Avatar
                    ref={avatarRef}
                    onClick={() => setIsAvatarOpen((prev) => !prev)}
                    className="cursor-pointer"
                  >
                    <AvatarImage
                      src={
                        localStorage.getItem("profilePic") ||
                        "https://github.com/shadcn.png"
                      }
                      className="text-black text-base hover:rounded-lg hover:bg-gray-100 transition-all duration-200"
                    />
                    <AvatarFallback />
                  </Avatar>

                  {/* Dropdown Menu */}
                  {isAvatarOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-50 bg-[#212121] shadow-lg rounded-lg p-2 z-50"
                    >
                      <Link to="/profile">
                        <button className="w-full text-gray-300 hover:bg-gray-600 text-left px-4 py-2 cursor-pointer ">
                          Profile
                        </button>
                      </Link>
                      <button
                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleLogout()}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login-form"
                  className="text-black py-3 px-6 base bg-cta-bluegreen rounded-lg font-semibold hover:bg-cta-bluegreen/80 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`fixed top-[8vh] right-0 pl-10 w-full h-auto bg-[#212121] text-white flex flex-col items-start justify-start py-10 gap-6 transition-transform duration-300 z-40 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Home is always shown */}
          <Link
            to="/"
            className="text-2xl hover:underline transition duration-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {/* About only shown when not logged in */}
          {!localStorage.getItem("idToken") && (
            <Link
              to="/about"
              className="text-2xl hover:underline transition duration-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
          )}

          {/* Features with dropdown on mobile - Simplified */}
          <div className="w-full flex flex-col items-start bg-[#212121]">
            <button
              className="flex items-center gap-2 !text-2xl hover:underline transition duration-500"
              onClick={() => setMobileFeatureOpen(!mobileFeatureOpen)}
            >
              Features
              <IoIosArrowDropdown
                className={`transition-transform duration-300 ${
                  mobileFeatureOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Features dropdown content - Simplified */}
            {mobileFeatureOpen && (
              <div className="w-full flex flex-col items-start bg-[#212121] mt-3 pl-5 gap-4 list-disc">
                <Link
                  to="/bill-prediction"
                  className="text-xl hover:underline transition duration-500 border-l-1 pl-2 border-cta-bluegreen"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Bill Prediction
                </Link>
                <Link
                  to="/consumption-calculator"
                  className="text-xl hover:underline transition duration-500 border-l-1 pl-2 border-cta-bluegreen"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Energy Consumption Calculator
                </Link>
                <Link
                  to="/energy-recommendation"
                  className="text-xl hover:underline transition duration-500 border-l-1 pl-2 border-cta-bluegreen"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Save Energy (Optimization Suggestions)
                </Link>
              </div>
            )}
          </div>

          {/* Only show login button if not logged in and in mobile view */}
          {!localStorage.getItem("idToken") && (
            <Link
              to="/login-form"
              className="text-white bg-blue-500 px-6 py-3 text-2xl rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default Navigation;
