import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "../pages/Dashboard";
import Appliance from "../pages/Appliance";
import History from "../pages/History";
import "../App.css";

const Layout = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <Dashboard />;
      case "appliance":
        return <Appliance />;
      case "history":
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      <div className="ml-16 md:ml-64 flex-1 pl-6 pr-2 md:pr-6  pt-20">
        {renderContent()}
      </div>
    </div>
  );
};

export default Layout;
