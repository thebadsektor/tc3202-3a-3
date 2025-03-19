import React, { useState } from "react";
import "../App.css";

export const Tooltip = ({ text, position = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    right: "left-full ml-2",
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && (
        <div
          className={`absolute ${positions[position]} z-20 px-2 py-1 text-sm bg-gray-900 text-white rounded whitespace-nowrap`}
        >
          {text}
        </div>
      )}
    </div>
  );
};
