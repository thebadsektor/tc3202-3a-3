import { useNavigate } from "react-router-dom";
import "../App.css";

function UserDashboard() {
  return (
    <div className="bg-lightblue">
      <div className="container h-[92vh] flex items-center justify-center">
        <div className="flex flex-col gap-3 login-card bg-white h-auto py-10 px-15 rounded-2xl text-center shadow-md">
          <h1 className="text-2xl font-semibold text-font-black">
            User Dashboard
          </h1>
          <p className="text-gray-600">Welcome to your dashboard!</p>
          <div className="mt-5 flex flex-col gap-3">
            <button className="bg-cta-blue hover:bg-blue-600 text-white font-semibold rounded-lg px-5 py-3 cursor-pointer">
              Explore Features
            </button>
            <button className="border-2 border-[#00000018] text-font-black font-semibold rounded-lg px-5 py-3 cursor-pointer">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
