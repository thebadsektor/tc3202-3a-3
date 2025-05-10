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
      <div className="h-auto mt-12 sm:mt-[15vh] flex items-center justify-center flex-col pb-12 sm:pb-20">
        <div className="max-w-3xl w-full px-4 sm:p-5">
          <div className="w-full">
            <h1 className="text-left text-cta-bluegreen text-2xl sm:text-3xl font-semibold mb-2 sm:mb-3">
              Appliance Energy Calculator
            </h1>
            <p className="text-white/80 mb-4 sm:mb-5">
              Estimated cost to operate:
            </p>
            <div className="mb-4 sm:mb-5">
              {appliances.length > 0 ? (
                <div className="text-white/80">
                  {appliances.map((appliance, index) => (
                    <div
                      key={index}
                      className="mb-3 sm:mb-4 bg-[#212121] p-3 sm:p-4 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div className="font-medium mb-2 sm:mb-0">
                          <span className="text-white break-words">
                            {appliance.name}
                          </span>{" "}
                          ({appliance.quantity || 1} unit
                          {appliance.quantity > 1 ? "s" : ""})
                        </div>
                        <button
                          onClick={() => toggleAppliance(index)}
                          className="bg-cta-bluegreen text-black px-3 py-1 rounded hover:bg-cta-bluegreen/70 transition cursor-pointer text-sm sm:text-base w-full sm:w-auto mt-1 sm:mt-0">
                          {expandedAppliance === index
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>

                      {expandedAppliance === index && (
                        <div className="mt-3 sm:mt-4 pl-3 sm:pl-4 border-l-2 border-cta-bluegreen">
                          <div className="mb-2 text-sm sm:text-base flex flex-wrap">
                            <span className="text-gray-400 mr-1">
                              Specifications:
                            </span>
                            <div className="flex flex-wrap">
                              <span className="mr-2">{appliance.watt}W</span>
                              <span className="mr-2">|</span>
                              <span className="mr-2">
                                {appliance.hours}h/day
                              </span>
                              <span className="mr-2">|</span>
                              <span className="mr-2">
                                {appliance.days.length} day
                                {appliance.days.length > 1 ? "s" : ""}/week
                              </span>
                              <span className="mr-2">|</span>
                              <span>{appliance.weeks}/Month</span>
                            </div>
                          </div>
                          <ul className="list-disc pl-5 sm:pl-8 text-white/70 text-sm sm:text-base">
                            <li className="mb-1">
                              Total cost per Hour:{" "}
                              <b> ₱{appliance.costPerHour.toFixed(2)}</b>
                            </li>
                            <li className="mb-1">
                              Total cost per Day:{" "}
                              <b> ₱{appliance.costPerDay.toFixed(2)}</b>
                            </li>
                            <li className="mb-1">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mt-6 sm:mt-10">
            <div className="bg-[#a4e5f3] p-4 sm:p-6 rounded-lg text-center">
              <p className="text-black/80 text-sm sm:text-base">
                Total cost per hour
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                ₱{totalCostPerHour.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#a4e5f3] p-4 sm:p-6 rounded-lg text-center">
              <p className="text-black/80 text-sm sm:text-base">
                Total cost per day
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                ₱{totalCostPerDay.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#a4e5f3] p-4 sm:p-6 rounded-lg text-center">
              <p className="text-black/80 text-sm sm:text-base">
                Total cost per week
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                ₱{totalCostPerWeek.toFixed(2)}
              </p>
            </div>
            <div className="bg-[#a4e5f3] p-4 sm:p-6 rounded-lg text-center">
              <p className="text-black/80 text-sm sm:text-base">
                Total cost per month
              </p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                ₱{totalCost.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center pt-4 sm:pt-5 gap-3 sm:gap-5">
            <button
              onClick={openSaveModal}
              disabled={isSaved}
              className={`w-full sm:w-auto text-black py-2 sm:py-3 px-4 mt-2 sm:mt-5 leading-tight font-semibold rounded transition ${
                isSaved
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#39e75f] hover:bg-[#39e75f]/80 text-black cursor-pointer "
              }`}>
              {isSaved ? "Saved" : "Save Result"}
            </button>
            <button
              onClick={() => navigate("/consumption-calculator")}
              className="w-full sm:w-auto text-white py-2 sm:py-3 px-4 mt-2 sm:mt-5 leading-tight cursor-pointer font-semibold bg-transparent border-1 hover:bg-gray-800 rounded transition">
              Compute Another
            </button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {saveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#212121] rounded-lg w-full max-w-md">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
              <h3 className="text-base sm:text-lg font-medium text-white">
                Save Calculation
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <label
                  htmlFor="calculationName"
                  className="block text-sm font-medium text-gray-300 mb-2">
                  Calculation Name
                </label>
                <input
                  type="text"
                  id="calculationName"
                  className="w-full px-3 py-2 bg-[#383c3d] border border-gray-600 rounded-md text-white focus:outline-none"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  placeholder="Enter a name for this calculation"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3 sm:space-x-4">
                <button
                  onClick={() => setSaveModal(false)}
                  className="px-3 sm:px-4 py-1 text-sm font-medium text-white bg-transparent border border-gray-500 rounded-md hover:bg-gray-700 focus:outline-none">
                  Cancel
                </button>
                <button
                  onClick={handleSaveResult}
                  className="px-3 sm:px-4 py-1 text-sm font-medium text-black bg-cta-bluegreen rounded-md hover:bg-cta-bluegreen/70 focus:outline-none">
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
