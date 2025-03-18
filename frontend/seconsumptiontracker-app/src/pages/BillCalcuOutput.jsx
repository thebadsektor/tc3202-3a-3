import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ref, getDatabase, push } from "firebase/database";
function BillCalcuOutput() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedAppliance, setExpandedAppliance] = useState(null);

  // Extract values from navigation state (passed from calculate function in CillCalculator.jsx)
  const {
    appliances,
    totalCost,
    monthlyBill,
    totalCostPerHour,
    totalCostPerDay,
    totalCostPerWeek,
  } = location.state || {
    appliances: [],
    totalCost: 0,
    monthlyBill: 0,
    totalCostPerHour: 0,
    totalCostPerDay: 0,
    totalCostPerWeek: 0,
  };

  // Function to extract number of weeks from string like "4 Weeks/Month"
  const extractWeeks = (weeksString) => {
    const match = weeksString.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 4;
  };

  // Function to toggle the expanded state of an appliance
  const toggleAppliance = (index) => {
    if (expandedAppliance === index) {
      setExpandedAppliance(null);
    } else {
      setExpandedAppliance(index);
    }
  };

  // Create a list of appliance names
  const applianceNames = appliances
    .map((appliance) => `${appliance.name} (${appliance.quantity || 1})`)
    .join(", ");

  // function to save the result in to the database
  const handleSaveResult = async () => {
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!userToken || !user) {
      alert("User not logged in");
      return;
    }

    const db = getDatabase();
    const calculationRef = ref(db, "users/" + user + "/calculations");

    try {
      await push(calculationRef, {
        appliances,
        totalCost,
        totalCostPerDay,
        totalCostPerHour,
        totalCostPerWeek,
        monthlyBill,
        timestamp: Date.now(), // Store timestamp for sorting later
      });
      alert("Calculation saved");
    } catch (error) {
      console.error("Error saving calculation:", error);
      alert("Failed to save calculation.");
    }
  };

  return (
    <>
      <div className="h-auto mt-[15vh] flex items-center justify-center flex-col">
        <div className="max-w-3xl w-full p-5">
          <div className="w-full">
            <h1 className="text-left text-blue-400 text-3xl font-semibold mb-3">
              Appliance Energy Calculator
            </h1>
            <p className="text-white/80 mb-5">
              Estimated cost to operate: {applianceNames || "No appliances"}
            </p>
            <div className="mb-5">
              {appliances.length > 0 ? (
                <div className="text-white/80">
                  {appliances.map((appliance, index) => (
                    <div
                      key={index}
                      className="mb-4 bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="font-medium">
                          <span className="text-blue-400">
                            {appliance.name}
                          </span>{" "}
                          ({appliance.quantity || 1} unit
                          {appliance.quantity > 1 ? "s" : ""})
                        </div>
                        <button
                          onClick={() => toggleAppliance(index)}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition">
                          {expandedAppliance === index
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>

                      {expandedAppliance === index && (
                        <div className="mt-4 pl-4 border-l-2 border-blue-400">
                          <div className="mb-2">
                            <span className="text-gray-400">
                              Specifications:
                            </span>{" "}
                            {appliance.watt}W | &nbsp;{appliance.hours}h/day |
                            &nbsp;
                            {appliance.days.length} day
                            {appliance.days.length > 1 ? "s" : ""}/week | &nbsp;
                            {appliance.weeks}/Month
                          </div>
                          <ul className="list-disc pl-8 text-white/70">
                            <li>
                              Total cost per Hour: Php{" "}
                              {appliance.costPerHour.toFixed(2)}
                            </li>
                            <li>
                              Total cost per Day: Php{" "}
                              {appliance.costPerDay.toFixed(2)}
                            </li>
                            <li>
                              Total cost per Week: Php{" "}
                              {appliance.costPerWeek.toFixed(2)}
                            </li>
                            <li>
                              Total cost per Month: Php{" "}
                              {(
                                appliance.costPerWeek *
                                extractWeeks(appliance.weeks)
                              ).toFixed(2)}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 italic">
                  No appliances data available
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per hour</p>
              <p className="text-xl font-bold text-blue-900">
                Php {totalCostPerHour.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per day</p>
              <p className="text-xl font-bold text-blue-900">
                Php {totalCostPerDay.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per week</p>
              <p className="text-xl font-bold text-blue-900">
                Php {totalCostPerWeek.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per month</p>
              <p className="text-xl font-bold text-blue-900">
                Php {totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center pt-5 gap-5">
            <button className="w-50 py-3 px-4 mt-3 text-5xl leading-tight cursor-pointer font-semibold bg-blue-400 hover:bg-blue-600 rounded transition">
              View Details
            </button>
            <button
              onClick={() => navigate("/bill-calculator")}
              className="w-50 text-white py-3 px-4 mt-3 text-5xl leading-tight cursor-pointer font-semibold bg-transparent border-2 hover:bg-gray-800 rounded transition">
              Compute Another
            </button>
          </div>
          {/* save result button */}
          <div className="flex items-center justify-center pt-5">
            <button
              onClick={handleSaveResult}
              className="w-50 text-white py-3 px-4 text-5xl leading-tight cursor-pointer font-semibold bg-green-500 hover:bg-green-600 rounded transition">
              Save Result
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BillCalcuOutput;
