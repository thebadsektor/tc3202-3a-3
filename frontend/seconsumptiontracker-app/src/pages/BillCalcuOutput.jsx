import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref, getDatabase, push, onValue } from "firebase/database";
function BillCalcuOutput() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedAppliance, setExpandedAppliance] = useState(null);

  // used for the saved button state
  const [isSaved, setIsSaved] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState({});
  const [currentCalculationId, setCurrentCalculationId] = useState(null);

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

  // Function to generate a unique ID for this calculation
  const generateCalculationId = (appliancesList, cost) => {
    // Create a string that represents the key aspects of the calculation
    const appliancesKey = appliancesList
      .map(
        (a) =>
          `${a.name}-${a.watt}-${a.hours}-${a.days.length}-${a.weeks}-${
            a.quantity || 1
          }`,
      )
      .sort()
      .join("|");

    const calculationKey = `${appliancesKey}-${cost.toFixed(2)}`;
    return btoa(calculationKey).substring(0, 20); // Base64 encoding for simplicity
  };

  // Check if this calculation has already been saved
  useEffect(() => {
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!user || !userToken || appliances.length === 0) {
      console.log("Missing user details or appliances, skipping save check");
      return;
    }

    // Generate an ID for the current calculation
    const calcId = generateCalculationId(appliances, totalCost);
    setCurrentCalculationId(calcId);

    const db = getDatabase();
    const calculationsRef = ref(db, "users/" + user + "/calculations");

    // Set up listener for saved calculations
    const unsubscribe = onValue(calculationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const savedCalcs = {};

        // Process each saved calculation
        Object.values(data).forEach((calc) => {
          const id = generateCalculationId(calc.appliances, calc.totalCost);
          savedCalcs[id] = true;
        });

        setSavedCalculations(savedCalcs);

        // Check if current calculation is already saved
        if (savedCalcs[calcId]) {
          setIsSaved(true);
        }
      }
    });

    // Clean up listener when component unmounts
    return () => unsubscribe();
  }, [appliances, totalCost]);

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

    // Prevent saving if already saved
    if (isSaved) {
      alert("This calculation has already been saved");
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
      setIsSaved(true);
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
              disabled={isSaved}
              className={`w-50 text-white py-3 px-4 text-5xl leading-tight cursor-pointer font-semibold rounded transition ${
                isSaved
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}>
              {isSaved ? "Saved" : "Save Result"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default BillCalcuOutput;
