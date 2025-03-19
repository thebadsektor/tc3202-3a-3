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

import "../App.css";

function Navigation() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null); // Reference for the avatar

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ensure dropdown closes only when clicking outside both avatar and dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsAvatarOpen(false);
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
        setShowNavbar(false); // Hide on scroll down
      } else {
        setShowNavbar(true); // Show on scroll up
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
      setUserEmail(email || ""); // Update the state immediately
    };

    updateUserEmail(); // Call once when component mounts

    window.addEventListener("storage", updateUserEmail); // Listen for storage changes

    return () => {
      window.removeEventListener("storage", updateUserEmail);
    };
  }, []);

  useEffect(() => {
    const checkAuthExpiration = () => {
      const expirationTime = localStorage.getItem("authExpiration");

      // Only check if expirationTime exists and is a valid number
      if (expirationTime && !isNaN(parseInt(expirationTime))) {
        const timeLeft = parseInt(expirationTime) - Date.now();

        // Check if token is already expired
        if (timeLeft <= 0) {
          handleLogout();
        }
        // Check if token is about to expire (within 30 seconds)
        else if (timeLeft <= 30 * 1000) {
          // 30 seconds in milliseconds
          // Show alert with Yes/No option
          const userConfirmed = window.confirm(
            "Your session is about to expire. Do you want to log out now?"
          );
          if (userConfirmed) {
            handleLogout();
          }
          // If user clicks No, do nothing and let it expire naturally
        }
      }
      // If expirationTime doesn't exist, do nothing
    };

    checkAuthExpiration(); // Run on component mount

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

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("idToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profilePic");
    localStorage.removeItem("authExpiration");
    localStorage.removeItem("lastVisitedPage");

    navigate("/"); // Redirect to home page
  };

  return (
    <>
      <div
        className={`w-full bg-[#1b2027] fixed top-0 z-50 transition-all duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav className="container w-full h-[8vh] border-blue-200 flex items-center justify-between">
          {/* Logo */}
          <div className="relative group cursor-pointer">
            {/* Logo */}
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

          <ul className="items-center justify-center hidden md:flex text-white">
            <li>
              <Link
                to="/"
                onClick={(e) => {
                  if (window.location.pathname === "/") {
                    e.preventDefault();
                    window.location.href = window.location.href; // Reloads the page
                  }
                }}
                className=" py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className=" py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                About
              </Link>
            </li>

            {/* Features with Dropdown */}
            <li className="relative group">
              <Link
                to="#"
                className="flex items-center gap-2 py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                Features
                <IoIosArrowDropdown />
              </Link>

              {/* Dropdown Menu */}
              <ul className="absolute left-0 w-max mt-2 p-3 z-15 text-white bg-gray-600 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 divide-y divide-gray-400 translate-y-2 group-hover:translate-y-0">
                <li>
                  <Link
                    to="/bill-calculator"
                    className="block px-6 py-3 hover:bg-gray-800 text-base transition-all hover:rounded-lg"
                  >
                    Bill Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="block px-6 py-3 hover:bg-gray-800 text-base transition-all hover:rounded-lg"
                  >
                    Energy Consumption Calculator
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="block px-6 py-3 hover:bg-gray-800 text-base transition-all hover:rounded-lg"
                  >
                    Save Energy (Optimization Suggestions)
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <Link
                to=""
                className=" py-3 px-6 text-base hover:rounded-lg hover:bg-gray-700 transition-all duration-200 mr-5"
              >
                Contact
              </Link>
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
                      className="absolute right-0 mt-2 w-auto bg-gray-800 shadow-lg  rounded-lg p-2 z-50"
                    >
                      <h3 className="text-white font-semibold px-4 py-2 border-bold">
                        {`Hi,\u00A0${
                          localStorage.getItem("userEmail") ||
                          "User".split("@")[0]
                        }!`}
                      </h3>
                      <hr />
                      <Link to="profile">
                        <button className="w-full text-gray-300 hover:bg-gray-600 text-left px-4 py-2 cursor-pointer mt-5">
                          Profile
                        </button>
                      </Link>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 cursor-pointer"
                        onClick={() => alert("Go to History")}
                      >
                        History
                      </button>
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
                  className="text-gray-100 py-3 px-6 base bg-cta-blue rounded-lg font-semibold hover:bg-blue-400 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
          <div className="md:hidden">
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
        </nav>
        {/* Mobile Menu */}
        <div
          className={`fixed top-[8vh] right-0 w-full h-auto bg-[#13171C] text-white flex flex-col items-center justify-start py-40 gap-6 transition-transform duration-300 z-40 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Link
            to="/"
            className=" text-2xl hover:underline transition duration-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to=""
            className=" text-2xl hover:underline transition duration-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to=""
            className="text-2xl hover:underline transition duration-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </Link>
          <Link
            to=""
            className=" text-2xl hover:underline transition duration-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="#"
            className="text-white bg-blue-500 px-6 py-3 text-2xl rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default Navigation;
