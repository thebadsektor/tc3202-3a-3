import { useState, useEffect } from "react";
import { Modal, Select } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get, set } from "firebase/database";

export default function RecommendationPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [calculations, setCalculations] = useState([]);
  const [selectedCalculations, setSelectedCalculations] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCalculationsData, setSelectedCalculationsData] = useState({});
  const [tempSelectedCalculations, setTempSelectedCalculations] = useState([]);
  const [expandedSets, setExpandedSets] = useState({});

  // Recommendation state
  const [recommendation, setRecommendation] = useState("");
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState("");

  // to handle the prediction result
  const [isSaved, setIsSaved] = useState(false);

  // Function to extract number of weeks from string like "4 Weeks/Month"
  const extractWeeks = (weeksString) => {
    const match = weeksString?.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 4;
  };

  // build and fetch recommendation
  const handleGetRecommendation = async () => {
    setRecLoading(true);
    setRecError("");
    setRecommendation("");

    // Build appliance_info lines
    const lines = [];
    Object.values(selectedCalculationsData).forEach((calc) => {
      (calc.appliances || []).forEach((appl) => {
        const name = appl.name;
        const watt = appl.watt;
        const hours = appl.hours;
        let daysNum = 7;
        if (Array.isArray(appl.days)) {
          daysNum = appl.days.length;
        } else if (typeof appl.days === "number") {
          daysNum = appl.days;
        } else if (typeof appl.days === "string") {
          const parsed = parseInt(appl.days, 10);
          if (!isNaN(parsed)) daysNum = parsed;
        }
        lines.push(`${name}: ${watt}W, ${hours}h/day, ${daysNum}d/week`);
      });
    });
    const appliance_info = lines.join("\n");

    try {
      const response = await fetch("http://localhost:8000/api/recommend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliance_info }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText}`);
      }
      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (err) {
      console.error(err);
      setRecError(err.message);
    } finally {
      setRecLoading(false);
    }
  };

  // First, set up an auth state listener to ensure we have auth before fetching data
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);

      if (!currentUser) {
        console.log("No user is logged in after auth state change");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Then, fetch calculations once we have confirmed auth state
  useEffect(() => {
    // Only proceed if auth is initialized
    if (!authInitialized) return;

    // If no user, we're done
    if (!user) {
      setLoading(false);
      return;
    }

    // Reference to the database
    const db = getDatabase();
    const calculationsRef = ref(db, `users/${user.uid}/calculations`);

    // Listen for changes in calculations
    const unsubscribe = onValue(
      calculationsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Calculations data:", data);

          const calculationsArray = [];

          Object.entries(data).forEach(([key, value]) => {
            // Generate a display name
            let calculationName = value.name;

            if (
              !calculationName &&
              value.appliances &&
              value.appliances.length > 0
            ) {
              const mainAppliance = value.appliances[0].name;
              const remainingCount = value.appliances.length - 1;

              if (remainingCount > 0) {
                calculationName = `${mainAppliance} + ${remainingCount} ${
                  remainingCount === 1 ? "Appliance" : "Appliances"
                }`;
              } else {
                calculationName = mainAppliance;
              }
            } else if (!calculationName) {
              calculationName = `Calculation (${key})`;
            }

            calculationsArray.push({
              value: key,
              label: calculationName,
              timestamp: value.timestamp,
              fullData: value,
            });
          });

          // Sort by timestamp (newest first)
          calculationsArray.sort((a, b) => b.timestamp - a.timestamp);

          console.log("Processed calculations:", calculationsArray);
          setCalculations(calculationsArray);
        } else {
          console.log("No calculations found in snapshot");
          setCalculations([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching calculations:", error);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [user, authInitialized]);

  const openModal = () => {
    setTempSelectedCalculations([...selectedCalculations]);
    setModalOpened(true);
  };
  const closeModal = () => setModalOpened(false);

  const toggleItemExpand = (calcKey, itemKey) => {
    const combinedKey = `${calcKey}-${itemKey}`;
    setExpandedItems((prev) => ({
      ...prev,
      [combinedKey]: !prev[combinedKey],
    }));
  };

  const toggleCalculationSelection = (calculationKey) => {
    setTempSelectedCalculations((prev) => {
      if (prev.includes(calculationKey)) {
        return prev.filter((key) => key !== calculationKey);
      } else {
        return [...prev, calculationKey];
      }
    });
  };

  const handleConfirmSelection = () => {
    setSelectedCalculations(tempSelectedCalculations);
    // Clear previous data
    const newSelectedCalcsData = {};

    // Process each selected calculation
    tempSelectedCalculations.forEach((calculationKey) => {
      const selectedCalc = calculations.find(
        (calc) => calc.value === calculationKey
      );

      if (selectedCalc) {
        newSelectedCalcsData[calculationKey] = {
          label: selectedCalc.label,
          appliances: selectedCalc.fullData.appliances || [],
          totalCost: selectedCalc.fullData.totalCost,
          totalCostPerHour: selectedCalc.fullData.totalCostPerHour,
          totalCostPerDay: selectedCalc.fullData.totalCostPerDay,
          totalCostPerWeek: selectedCalc.fullData.totalCostPerWeek,
          monthlyBill: selectedCalc.fullData.monthlyBill,
          timestamp: selectedCalc.timestamp,
        };
      }
    });

    // Update state with all the new data
    setSelectedCalculationsData(newSelectedCalcsData);
    closeModal();
  };

  // function to toggle all appliances in a calculation
  const toggleViewAllAppliances = (calcKey) => {
    const isCurrentlyExpanded = expandedSets[calcKey];

    // Get all appliance indices for this calculation
    const applianceCount =
      selectedCalculationsData[calcKey]?.appliances?.length || 0;
    const applianceIndices = Array.from(
      { length: applianceCount },
      (_, i) => i
    );

    // Create a new expandedItems state
    const newExpandedItems = { ...expandedItems };

    // For each appliance in this calculation
    applianceIndices.forEach((applianceIndex) => {
      const combinedKey = `${calcKey}-${applianceIndex}`;
      // If we're expanding, set all to true. If collapsing, set all to false
      newExpandedItems[combinedKey] = !isCurrentlyExpanded;
    });

    // Update expanded items state
    setExpandedItems(newExpandedItems);

    // Toggle the expanded state of this calculation
    setExpandedSets((prev) => ({
      ...prev,
      [calcKey]: !prev[calcKey],
    }));
  };

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleDateString("en-US", options);
  };

  // save the prediction into the realtime databse
  const handleSavePrediction = async () => {
    if (!user || !predictionResult) return;

    const predictionMonth = new Date(month);
    predictionMonth.setMonth(predictionMonth.getMonth() + 1);
    const formattedMonth = predictionMonth.toISOString().slice(0, 7); // e.g., "2025-04"

    const predictionData = {
      month: formattedMonth,
      totalKWh: predictionResult.totalKWh,
      predictedRate: predictionResult.predictedRate,
      estimatedBill: predictionResult.estimatedBill, // contains min, max, average
      timestamp: Date.now(),
    };

    const db = getDatabase();
    const predictionRef = ref(
      db,
      `users/${user.uid}/billPredictions/${formattedMonth}`
    );

    try {
      const snapshot = await get(predictionRef);

      if (snapshot.exists()) {
        const userConfirmed = window.confirm(
          `You already have a saved prediction for ${formattedMonth}. This will overwrite the existing prediction. Do you want to continue?`
        );

        if (!userConfirmed) return;
      }

      await set(predictionRef, predictionData);
      setIsSaved(true);
      alert("Prediction saved successfully!");
    } catch (error) {
      console.error("Error saving prediction:", error);
      alert("Failed to save prediction. Please try again.");
    }
  };

  return (
    <>
      <div className="w-full min-h-[90vh] h-auto flex items-start justify-center mt-[15vh]">
        <div className="w-2xl mx-auto p-5 text-white rounded-lg shadow-2xl">
          <span className="text-white/40 text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Bill Prediction
          </span>
          <h2 className="text-4xl font-bold mb-3">
            Energy Saving Recommendation
          </h2>

          <p className="mb-5 text-white/60">
            Select from your saved calculations, the system analyzes your energy
            usage patterns—such as wattage and usage duration—to generate smart
            recommendations that help you save energy and reduce costs.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={openModal}
              className="mt-2 py-2 px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black cursor-pointer rounded transition"
              disabled={!user || loading}
            >
              Import From History
            </button>
          </div>

          {!user && authInitialized && (
            <div className="mt-4 p-4 bg-red-800/50 rounded">
              <p>
                You need to be logged in to access your calculation history.
              </p>
            </div>
          )}

          {/* Display selected calculations */}
          {selectedCalculations.length > 0 && (
            <div className="mt-15 space-y-4">
              {selectedCalculations.map((calcKey) => {
                const calcData = selectedCalculationsData[calcKey] || {};
                const appliances = calcData.appliances || [];

                return (
                  <div key={calcKey} className="p-4 bg-[#212121] rounded mt-6">
                    <h3 className="text-xl font-semibold mb-3">
                      Selected Calculation:{" "}
                      <span className="text-cta-bluegreen">
                        {calcData.label || calcKey}
                      </span>
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      {calcData.timestamp ? formatDate(calcData.timestamp) : ""}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium">Appliances:</h4>
                        <button
                          onClick={() => toggleViewAllAppliances(calcKey)}
                          className="text-cta-bluegreen hover:text-cta-bluegreen/80 text-sm underline"
                        >
                          {expandedSets[calcKey] ? "Collapse All" : "View All"}
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {appliances.length > 0 ? (
                          appliances.map((appliance, index) => (
                            <li
                              key={index}
                              className="bg-[#383c3d] rounded overflow-hidden"
                            >
                              <div
                                className="flex items-center justify-between p-2 cursor-pointer transition"
                                onClick={() => toggleItemExpand(calcKey, index)}
                              >
                                <span>
                                  {appliance.name} ({appliance.quantity || 1}{" "}
                                  unit
                                  {appliance.quantity > 1 ? "s" : ""})
                                </span>
                                <span className="flex items-center">
                                  {expandedItems[`${calcKey}-${index}`] ? (
                                    <FiChevronDown />
                                  ) : (
                                    <FiChevronRight />
                                  )}
                                </span>
                              </div>

                              {expandedItems[`${calcKey}-${index}`] && (
                                <div className="p-3 bg-[#212121] border-t border-gray-600 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Wattage:
                                    </span>
                                    <span>{appliance.watt} W</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Quantity:
                                    </span>
                                    <span>{appliance.quantity || 1}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Hours per day:
                                    </span>
                                    <span>{appliance.hours}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Days:</span>
                                    <span>
                                      {Array.isArray(appliance.days)
                                        ? appliance.days.join(", ")
                                        : appliance.days?.length || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Weeks:
                                    </span>
                                    <span>{appliance.weeks}</span>
                                  </div>
                                  <div className="mt-4 pl-4 border-l-2 border-cta-bluegreen">
                                    <ul className="list-disc pl-4 text-white/70">
                                      <li>
                                        Cost per Hour:{" "}
                                        <b>
                                          {" "}
                                          ₱{appliance.costPerHour?.toFixed(2)}
                                        </b>
                                      </li>
                                      <li>
                                        Cost per Day:{" "}
                                        <b>
                                          {" "}
                                          ₱{appliance.costPerDay?.toFixed(2)}
                                        </b>
                                      </li>
                                      <li>
                                        Cost per Week:{" "}
                                        <b>
                                          {" "}
                                          ₱{appliance.costPerWeek?.toFixed(2)}
                                        </b>
                                      </li>
                                      <li>
                                        Cost per Month:{" "}
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
                                </div>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400">
                            No appliances found in this calculation.
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Summary for this calculation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                      <div className="bg-[#383c3d] p-4 rounded-lg text-center">
                        <p className="text-gray-400">Total cost per hour</p>
                        <p className="text-lg font-bold text-white">
                          ₱{calcData.totalCostPerHour?.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#383c3d] p-4 rounded-lg text-center">
                        <p className="text-gray-400">Total cost per day</p>
                        <p className="text-lg font-bold text-white">
                          ₱{calcData.totalCostPerDay?.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#383c3d] p-4 rounded-lg text-center">
                        <p className="text-gray-400">Total cost per week</p>
                        <p className="text-lg font-bold text-white">
                          ₱{calcData.totalCostPerWeek?.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#383c3d] p-4 rounded-lg text-center">
                        <p className="text-gray-400">Total cost per month</p>
                        <p className="text-lg font-bold text-white">
                          ₱{calcData.totalCost?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {calcData.monthlyBill && (
                      <div className="mt-4 bg-gray-600 p-4 rounded-lg">
                        <p className="text-white">
                          Monthly Bill:{" "}
                          <span className="font-bold">
                            ₱{calcData.monthlyBill?.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Button to calculate prediction */}
              {/* Recommendation Section */}
              <div className="flex flex-col items-center">
                {!recLoading ? (
                  <button
                    onClick={handleGetRecommendation}
                    disabled={!user}
                    className="w-full py-3 px-5 bg-[#39e75f] hover:bg-[#39e75f]/80 text-black rounded cursor-pointer"
                  >
                    Get Recommendation
                  </button>
                ) : (
                  <div className="flex justify-center items-center my-5">
                    <div className="flex space-x-2 items-center">
                      <span className="text-white mr-2">
                        Loading Recommendation
                      </span>
                      <div className="flex space-x-1">
                        <div
                          className="h-3 w-3 bg-cta-bluegreen rounded-full animate-bounce"
                          style={{
                            animationDelay: "0ms",
                            animationDuration: "1s",
                            animationName: "customBounce",
                          }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-cta-bluegreen rounded-full animate-bounce"
                          style={{
                            animationDelay: "150ms",
                            animationDuration: "1s",
                            animationName: "customBounce",
                          }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-cta-bluegreen rounded-full animate-bounce"
                          style={{
                            animationDelay: "300ms",
                            animationDuration: "1s",
                            animationName: "customBounce",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {recommendation && (
                  <div className="mt-4 p-6 bg-[#212121] text-white rounded whitespace-pre-wrap">
                    {recommendation}
                  </div>
                )}

                {recError && (
                  <div className="mt-4 p-4 bg-red-800 text-white rounded">
                    Error: {recError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes customBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }
      `}</style>
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Select Calculations from History"
        styles={{
          title: { color: "white", fontWeight: "bold" },
          header: { backgroundColor: "#212121" },
          content: { backgroundColor: "#212121", color: "white" },
          close: { color: "white" },
        }}
      >
        <div className="py-4">
          {loading ? (
            <p>Loading calculation history...</p>
          ) : calculations.length > 0 ? (
            <>
              <h3 className="mb-2">Available Calculations</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {calculations.map((calc) => (
                  <div
                    key={calc.value}
                    className="flex items-center p-2 bg-[#383c3d] rounded hover:bg-[#383c3d]/50"
                  >
                    <input
                      type="checkbox"
                      id={`calc-${calc.value}`}
                      checked={tempSelectedCalculations?.includes(calc.value)}
                      onChange={() => toggleCalculationSelection(calc.value)}
                      className="mr-3"
                    />
                    <div className="cursor-pointer flex-1">
                      <label
                        htmlFor={`calc-${calc.value}`}
                        className="block font-medium"
                      >
                        {calc.label}
                      </label>
                      <div className="text-sm text-white/60">
                        {formatDate(calc.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="py-2 px-4 bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="py-2 px-4 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black rounded"
                  disabled={!tempSelectedCalculations.length}
                >
                  Import Selected
                </button>
              </div>
            </>
          ) : (
            <p>
              No calculation history found. Please create some calculations
              first.
            </p>
          )}
        </div>
      </Modal>
      <section className="h-20"></section>
    </>
  );
}
