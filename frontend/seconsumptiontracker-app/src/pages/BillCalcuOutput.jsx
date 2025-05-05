import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ref, getDatabase, push, onValue } from "firebase/database";
import { toast } from "sonner";
import { Toaster } from "../components/ui/sonner";

function BillCalcuOutput() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedAppliance, setExpandedAppliance] = useState(null);

  // used for the saved button state
  const [isSaved, setIsSaved] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState({});
  const [currentCalculationId, setCurrentCalculationId] = useState(null);

  // Modal states
  const [saveModal, setSaveModal] = useState(false);
  const [calculationName, setCalculationName] = useState("");

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
          }`
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

  // Open the save modal
  const openSaveModal = () => {
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!userToken || !user) {
      toastOnSave(false);
      return;
    }

    // Prevent saving if already saved
    if (isSaved) {
      toastOnSave(true);
      return;
    }

    // Format current date
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = today.toLocaleDateString("en-US", options);

    // Generate default calculation name with date
    let defaultName;
    if (appliances.length > 0) {
      const remainingCount = appliances.length - 1;
      defaultName = `${formattedDate} | ${appliances[0].name}${
        remainingCount > 0
          ? ` + ${remainingCount} ${
              remainingCount === 1 ? "Appliance" : "Appliances"
            }`
          : ""
      }`;
    } else {
      defaultName = `${formattedDate} | Energy Calculation`;
    }

    setCalculationName(defaultName);
    setSaveModal(true);
  };

  // function to save the result in to the database
  const handleSaveResult = async () => {
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!userToken || !user) {
      toastOnSave(false);
      return;
    }

    // Close the modal
    setSaveModal(false);

    // Use default name if empty
    const today = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = today.toLocaleDateString("en-US", options);
    const name =
      calculationName.trim() || `${formattedDate} | Energy Calculation`;

    const db = getDatabase();
    const calculationRef = ref(db, "users/" + user + "/calculations");

    try {
      await push(calculationRef, {
        name, // Add calculation name
        appliances,
        totalCost,
        totalCostPerDay,
        totalCostPerHour,
        totalCostPerWeek,
        monthlyBill,
        timestamp: Date.now(),
      });
      setIsSaved(true);
      toastOnSave(true);
    } catch (error) {
      console.error("Error saving calculation:", error);
      toastOnSave(false);
    }
  };

  const toastOnSave = (isValid) => {
    if (isValid) {
      toast("Data saved successfully! ✅", {
        description: "All saved data is available on your profile history.",
        duration: 3000,
      });
    } else {
      toast("User not logged in! ❌", {
        description: "Login or Sign up for free to access this feature.",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <div className="h-auto mt-[15vh] flex items-center justify-center flex-col pb-20">
        <div className="max-w-3xl w-full p-5">
          <div className="w-full">
            <h1 className="text-left text-cta-bluegreen text-3xl font-semibold mb-3">
              Appliance Energy Calculator
            </h1>
            <p className="text-white/80 mb-5">Estimated cost to operate:</p>
            <div className="mb-5">
              {appliances.length > 0 ? (
                <div className="text-white/80">
                  {appliances.map((appliance, index) => (
                    <div
                      key={index}
                      className="mb-4 bg-gray-800 p-4 rounded-lg"
                    >
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
                          className="bg-cta-bluegreen text-black px-3 py-1 rounded hover:bg-cta-bluegreen/70 transition cursor-pointer"
                        >
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
                              Total cost per Hour:{" "}
                              <b> ₱{appliance.costPerHour.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Day:{" "}
                              <b> ₱{appliance.costPerDay.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Week:{" "}
                              <b> ₱{appliance.costPerWeek.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Month:{" "}
                              <b>
                                {" "}
                                ₱
                                {(
                                  appliance.costPerWeek *
                                  extractWeeks(appliance.weeks)
                                ).toFixed(2)}{" "}
                              </b>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per hour</p>
              <p className="text-xl font-bold text-blue-900">
                ₱{totalCostPerHour.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per day</p>
              <p className="text-xl font-bold text-blue-900">
                ₱{totalCostPerDay.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per week</p>
              <p className="text-xl font-bold text-blue-900">
                ₱{totalCostPerWeek.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">Total cost per month</p>
              <p className="text-xl font-bold text-blue-900">
                ₱{totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center pt-5 gap-5">
            <button
              onClick={openSaveModal}
              disabled={isSaved}
              className={`w-50 text-white py-3 px-4 mt-5 leading-tight cursor-pointer font-semibold rounded transition ${
                isSaved
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSaved ? "Saved" : "Save Result"}
            </button>
            <button
              onClick={() => navigate("/consumption-calculator")}
              className="w-50 text-white py-3 px-4 mt-5 leading-tight cursor-pointer font-semibold bg-transparent border-1 hover:bg-gray-800 rounded transition"
            >
              Compute Another
            </button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">
                Save Calculation
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="calculationName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Calculation Name
                </label>
                <input
                  type="text"
                  id="calculationName"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cta-bluegreen"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  placeholder="Enter a name for this calculation"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSaveModal(false)}
                  className="px-4 py-1 text-sm font-medium text-white bg-transparent border border-gray-500 rounded-md hover:bg-gray-700 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResult}
                  className="px-4 py-1 text-sm font-medium text-black bg-cta-bluegreen rounded-md hover:bg-cta-bluegreen/70 focus:outline-none"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </>
  );
}

export default BillCalcuOutput;
