import React from "react";
import Layout from "../components/Layout";
import "../App.css";

function ProfilePage() {
  return (
    <>
      <div className="bg-[#13171C] min-h-screen">
        {/* Your existing top navbar would go here */}
        <div className="h-16 bg-slate-900 text-white fixed top-0 left-0 right-0 z-20 flex items-center px-4">
          <h1 className="text-xl font-bold">WATTIFY</h1>
        </div>

        <Layout />
      </div>
    </>
  );
}

export default ProfilePage;
