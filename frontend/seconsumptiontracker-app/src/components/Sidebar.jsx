import React, { useState, useEffect } from "react";
import { FiHome, FiGrid, FiClock } from "react-icons/fi";
import { Tooltip } from "./Tooltip";
import "../App.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FiHome },
  { id: "appliance", label: "Appliance", icon: FiGrid },
  { id: "history", label: "History", icon: FiClock },
];

const Sidebar = ({ activeItem, setActiveItem }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");

  // Get user data from localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "";
    const profile = localStorage.getItem("profilePic") || "";

    setUserEmail(email);
    setProfilePic(profile);
  }, []);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) {
      setIsExpanded(false);
    }
  };

  const getInitial = () => {
    if (userEmail && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div
      className={`h-screen bg-slate-800 text-white flex flex-col transition-all duration-300 ${
        isExpanded ? "w-64" : "w-20"
      } fixed left-0 top-16 z-10`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* User profile section */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center mt-3">
          <div className="flex-shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center font-medium">
                {getInitial()}
              </div>
            )}
          </div>

          {isExpanded && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium truncate">{userEmail}</p>
              <p className="text-xs text-slate-400 truncate">User Profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation items */}
      <div className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveItem(item.id)}
                className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                  activeItem === item.id
                    ? "bg-cta-bluegreen text-black"
                    : "hover:bg-slate-700"
                }`}
              >
                <div className="text-xl">
                  <item.icon />
                </div>

                {isExpanded ? (
                  <span className="ml-3">{item.label}</span>
                ) : (
                  <Tooltip text={item.label} position="right" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
