import { useState, useEffect } from "react";
import { MonthPickerInput } from "@mantine/dates";
import { Modal, Select, Divider } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { FiChevronDown, FiChevronRight, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get, set } from "firebase/database";
import pastRates from "../assets/datas/pastRates.json";

export default function BillPrediction() {
  // Current month with ability to predict 2 months ahead
  const currentDate = new Date();
  const [month, setMonth] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const maxDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    1
  );

  const [modalOpened, setModalOpened] = useState(false);
  const [applianceSets, setApplianceSets] = useState([]);
  const [selectedApplianceSets, setSelectedApplianceSets] = useState([]);
  const [expandedAppliances, setExpandedAppliances] = useState({});
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedSetsData, setSelectedSetsData] = useState({});
  const [tempSelectedSets, setTempSelectedSets] = useState([]);
  const [expandedSets, setExpandedSets] = useState({});

  // to handle the prediction result
  const [predictionResult, setPredictionResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Added for comparison features
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [selectedCalculation, setSelectedCalculation] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [latestRate, setLatestRate] = useState(null);
  const [rateComparison, setRateComparison] = useState(null);

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

  // Find the latest rate from pastRates.json
  useEffect(() => {
    if (pastRates && pastRates.length > 0) {
      // Sort the rates by year and month to find the latest
      const sortedRates = [...pastRates].sort((a, b) => {
        if (a.Year !== b.Year) {
          return b.Year - a.Year;
        }
        return b.Month - a.Month;
      });
      
      setLatestRate(sortedRates[0]);
    }
  }, []);

  // Then, fetch appliance sets once we have confirmed auth state
  useEffect(() => {
    // Only proceed if auth is initialized
    if (!authInitialized) return;

    // If no user, we're done
    if (!user) {
      setLoading(false);
      return;
    }

    console.log("Auth initialized, user found:", user.uid);

    // Reference to the database
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}/applianceSets`);

    // Listen for changes in appliance sets
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Appliance sets data:", data);

          // Transform the data to include both key and appliance set names
          const applianceSetsArray = [];

          Object.entries(data).forEach(([key, value]) => {
            // Look for the applianceSet name property instead of the first appliance name
            let setName = key; // Default to key if no name is found

            // Check if the applianceSet has a name property directly
            if (value && value.name) {
              setName = value.name;
            } else if (value && value.id) {
              // Use the ID as an alternate name if available
              setName = `Appliance Set ${value.id}`;
            } else {
              // Fallback to using a generic name with the key
              setName = `Appliance Set (${key})`;
            }

            applianceSetsArray.push({
              value: key,
              label: setName,
              allAppliances: value.appliances || {},
            });
          });

          console.log("Processed appliance sets:", applianceSetsArray);
          setApplianceSets(applianceSetsArray);
        } else {
          console.log("No appliance sets found in snapshot");
          setApplianceSets([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching appliance sets:", error);
        setLoading(false);
      }
    );

    // Fetch saved calculations
    const calculationsRef = ref(db, `users/${user.uid}/calculations`);
    onValue(calculationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const calculationsArray = Object.entries(data).map(([id, calc]) => ({
          id,
          label: calc.name || `Calculation (${id.substring(0, 8)})`,
          ...calc
        }));
        
        // Sort by timestamp (newest first)
        calculationsArray.sort((a, b) => b.timestamp - a.timestamp);
        setSavedCalculations(calculationsArray);
      } else {
        setSavedCalculations([]);
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, [user, authInitialized]);

  const openModal = () => {
    setTempSelectedSets([...selectedApplianceSets]);
    setModalOpened(true);
  };
  const closeModal = () => setModalOpened(false);

  const toggleApplianceExpand = (setKey, applianceKey) => {
    const combinedKey = `${setKey}-${applianceKey}`;
    setExpandedAppliances((prev) => ({
      ...prev,
      [combinedKey]: !prev[combinedKey],
    }));
  };

  const toggleApplianceSetSelection = (applianceSetKey) => {
    setTempSelectedSets((prev) => {
      if (prev.includes(applianceSetKey)) {
        return prev.filter((key) => key !== applianceSetKey);
      } else {
        return [...prev, applianceSetKey];
      }
    });
  };

  const handleConfirmSelection = () => {
    setSelectedApplianceSets(tempSelectedSets);
    // Clear previous data
    const newSelectedSetsData = {};

    // Process each selected appliance set
    tempSelectedSets.forEach((applianceSetKey) => {
      const selectedSet = applianceSets.find(
        (set) => set.value === applianceSetKey
      );

      if (selectedSet) {
        // Store the set data with the set key
        newSelectedSetsData[applianceSetKey] = {
          label: selectedSet.label,
          appliances: selectedSet.allAppliances || {},
        };

        // If we don't have cached appliance data, fetch it
        if (
          !selectedSet.allAppliances ||
          Object.keys(selectedSet.allAppliances).length === 0
        ) {
          if (user) {
            const db = getDatabase();
            const applianceSetRef = ref(
              db,
              `users/${user.uid}/applianceSets/${applianceSetKey}/appliances`
            );

            get(applianceSetRef)
              .then((snapshot) => {
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  // Update this specific set's appliances
                  setSelectedSetsData((prev) => ({
                    ...prev,
                    [applianceSetKey]: {
                      ...prev[applianceSetKey],
                      appliances: data,
                    },
                  }));
                }
              })
              .catch((error) => {
                console.error("Error fetching appliance data:", error);
              });
          }
        }
      }
    });

    // Update state with all the new data
    setSelectedSetsData(newSelectedSetsData);
    closeModal();
  };

  // function to toggle all appliances in a set
  const toggleViewAllAppliances = (setKey) => {
    const isCurrentlyExpanded = expandedSets[setKey];

    // Get all appliance keys for this set
    const applianceKeys = Object.keys(
      selectedSetsData[setKey]?.appliances || {}
    );

    // Create a new expandedAppliances state
    const newExpandedAppliances = { ...expandedAppliances };

    // For each appliance in this set
    applianceKeys.forEach((applianceKey) => {
      const combinedKey = `${setKey}-${applianceKey}`;
      // If we're expanding, set all to true. If collapsing, set all to false
      newExpandedAppliances[combinedKey] = !isCurrentlyExpanded;
    });

    // Update expanded appliances state
    setExpandedAppliances(newExpandedAppliances);

    // Toggle the expanded state of this set
    setExpandedSets((prev) => ({
      ...prev,
      [setKey]: !prev[setKey],
    }));
  };

  const handleMonthChange = (date) => {
    setMonth(date);
    // Reset prediction when month changes
    setPredictionResult(null);
    setIsSaved(false);
    setComparisonResult(null);
  };

  const handlePrediction = async () => {
    const selectedMonth = month.getMonth() + 1; // 1-12 month format
    const selectedYear = month.getFullYear();

    try {
      const res = await fetch(
        `http://localhost:8000/api/predict/?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();
      const predictedRate = parseFloat(data.prediction);
      console.log("Predicted rate for the month:", predictedRate);

      const margin = 0.3; // Estimated model error
      const minRate = predictedRate - margin;
      const maxRate = predictedRate + margin;

      let totalKWh = 0;

      selectedApplianceSets.forEach((setKey) => {
        const setData = selectedSetsData[setKey];
        const appliances = setData?.appliances || {};

        Object.values(appliances).forEach((appliance) => {
          const watt = parseFloat(appliance.watt) || 0;
          const hours = parseFloat(appliance.hours) || 0;
          const quant = parseFloat(appliance.quant) || 1;
          const days = Array.isArray(appliance.days)
            ? appliance.days.length
            : 7;
          const weeks = parseFloat(appliance.weeks?.split(" ")[0]) || 4;

          const kWhPerHour = watt / 1000;
          const kWhPerDay = kWhPerHour * hours;
          const kWhPerWeek = kWhPerDay * days;
          const kWhPerMonth = kWhPerWeek * weeks;

          totalKWh += kWhPerMonth * quant;
        });
      });

      const estimatedMinBill = totalKWh * minRate;
      const estimatedMaxBill = totalKWh * maxRate;
      const estimatedAvgBill = totalKWh * predictedRate;

      setPredictionResult({
        totalKWh: totalKWh.toFixed(2),
        predictedRate: predictedRate.toFixed(4),
        estimatedBill: {
          average: estimatedAvgBill.toFixed(2),
          min: estimatedMinBill.toFixed(2),
          max: estimatedMaxBill.toFixed(2),
        },
      });
      
      // Compare with latest rate
      if (latestRate) {
        const latestBillRate = parseFloat(latestRate["Total Bill"]);
        const difference = ((predictedRate - latestBillRate) / latestBillRate * 100).toFixed(2);
        const isHigher = predictedRate > latestBillRate;
        
        setRateComparison({
          latest: latestBillRate.toFixed(4),
          difference: Math.abs(difference),
          isHigher
        });
      }
      
      // Clear any previous comparison
      setComparisonResult(null);
      setSelectedCalculation("");
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Error while predicting. Please try again.");
    }
  };

  const handleCompare = () => {
    if (!selectedCalculation || !predictionResult) return;
    
    const calculation = savedCalculations.find(calc => calc.id === selectedCalculation);
    if (!calculation) return;
    
    const predictionTotalBill = parseFloat(predictionResult.estimatedBill.average);
    const calculationTotalBill = parseFloat(calculation.totalCost);
    
    const difference = predictionTotalBill - calculationTotalBill;
    const percentDifference = ((difference / calculationTotalBill) * 100).toFixed(2);
    
    setComparisonResult({
      savedName: calculation.name || "Saved Calculation",
      savedBill: calculationTotalBill.toFixed(2),
      difference: Math.abs(difference).toFixed(2),
      percentDifference: Math.abs(percentDifference),
      isHigher: predictionTotalBill > calculationTotalBill
    });
  };

  // save the prediction into the realtime databse
  const handleSavePrediction = async () => {
    if (!user || !predictionResult) return;

    const formattedMonth = `${month.getFullYear()}-${String(
      month.getMonth() + 1
    ).padStart(2, "0")}`;

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

  // Month name formatter
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <>
      <div className="w-full min-h-[90vh] h-auto flex items-start justify-center mt-[15vh] px-4 sm:px-6">
        <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 text-white rounded-lg shadow-2xl">
          <span className="text-white/40 text-xs sm:text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Bill Prediction
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            Electricity Bill Prediction
          </h2>

          <p className="mb-3 sm:mb-5 text-sm sm:text-base text-white/60">
            The system retrieves the calculated energy consumption data and
            processes it through an (SARIMAX/XGBoost) machine learning model
            trained on historical electricity rate data, providing users with an
            estimated electricity bill.
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              onClick={openModal}
              className="mt-2 py-2 px-4 sm:px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black cursor-pointer rounded transition text-sm sm:text-base"
              disabled={!user || loading}>
              Import
            </button>
            <MonthPickerInput
              placeholder="Select Month"
              value={month}
              onChange={handleMonthChange}
              minDate={
                new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
              }
              maxDate={maxDate}
              classNames={{
                input:
                  "!bg-[#383c3d] !text-white !border-gray-600 !w-auto !py-2 mt-2 !text-sm sm:!text-base",
                label: "text-white",
                dropdown: "!bg-gray-900 !text-white !border-gray-700",
              }}
            />
          </div>

          {!user && authInitialized && (
            <div className="mt-4 p-3 sm:p-4 bg-red-800/50 rounded text-sm sm:text-base">
              <p>You need to be logged in to access your appliance sets.</p>
            </div>
          )}

          {/* Display selected appliance sets */}
          {selectedApplianceSets.length > 0 && (
            <div className="mt-8 sm:mt-15 space-y-3 sm:space-y-4">
              {selectedApplianceSets.map((setKey) => {
                const setData = selectedSetsData[setKey] || {};
                const appliances = setData.appliances || {};

                return (
                  <div key={setKey} className="p-3 sm:p-4 bg-[#212121] rounded">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">
                      Selected Set:{" "}
                      <span className="text-cta-bluegreen">
                        {setData.label || setKey}
                      </span>
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base sm:text-lg font-medium">
                          Appliances:
                        </h4>
                        <button
                          onClick={() => toggleViewAllAppliances(setKey)}
                          className="text-cta-bluegreen hover:text-cta-bluegreen/80 text-xs sm:text-sm underline">
                          {expandedSets[setKey] ? "Collapse All" : "View All"}
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {Object.keys(appliances).length > 0 ? (
                          Object.entries(appliances).map(([key, appliance]) => (
                            <li
                              key={key}
                              className="bg-[#383c3d] rounded overflow-hidden">
                              <div
                                className="flex items-center justify-between p-2 cursor-pointer transition text-sm sm:text-base"
                                onClick={() =>
                                  toggleApplianceExpand(setKey, key)
                                }>
                                <span className="break-words pr-2">
                                  {appliance.name}
                                </span>
                                <span className="flex items-center flex-shrink-0">
                                  {expandedAppliances[`${setKey}-${key}`] ? (
                                    <FiChevronDown />
                                  ) : (
                                    <FiChevronRight />
                                  )}
                                </span>
                              </div>

                              {expandedAppliances[`${setKey}-${key}`] && (
                                <div className="p-2 sm:p-3 bg-[#212121] border-t border-gray-600 space-y-1 sm:space-y-2 text-xs sm:text-sm">
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
                                    <span>{appliance.quant}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Hours per day:
                                    </span>
                                    <span>{appliance.hours}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Days:</span>
                                    <span className="break-words text-right">
                                      {Array.isArray(appliance.days)
                                        ? appliance.days.join(", ")
                                        : appliance.days || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">
                                      Weeks:
                                    </span>
                                    <span>{appliance.weeks}</span>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-400 text-sm">
                            No appliances found in this set.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {/* Button to calculate prediction */}
              <button
                onClick={handlePrediction}
                className="w-full mt-2 py-2 px-5 bg-[#39e75f] hover:bg-[#39e75f]/80 text-black cursor-pointer rounded transition text-sm sm:text-base"
                disabled={!user || loading}>
                Calculate
              </button>
              {predictionResult && (
                <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-[#212121] rounded shadow text-white space-y-2 sm:space-y-3 border border-gray-900">
                  <h3 className="text-lg sm:text-xl font-bold">
                    Predicted Electricity Bill Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Forecast for {formatMonthYear(month)}
                  </p>

                  <div className="flex justify-between border-b border-gray-700 pb-2 mt-6 sm:mt-10 text-sm sm:text-base">
                    <span>Monthly Consumption:</span>
                    <span className="font-semibold">
                      {predictionResult.totalKWh} kWh
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2 text-sm sm:text-base">
                    <span>Predicted Rate:</span>
                    <span className="font-semibold">
                      ₱{predictionResult.predictedRate} / kWh
                    </span>
                  </div>

                  {rateComparison && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-700 pb-2 text-xs sm:text-base">
                      <span>Rate Comparison:</span>
                      <span
                        className={`font-semibold flex items-center ${
                          rateComparison.isHigher
                            ? "text-red-400"
                            : "text-green-400"
                        } mt-1 sm:mt-0`}>
                        {rateComparison.isHigher ? (
                          <FiTrendingUp className="mr-1 flex-shrink-0" />
                        ) : (
                          <FiTrendingDown className="mr-1 flex-shrink-0" />
                        )}
                        {rateComparison.isHigher ? "Higher" : "Lower"} by{" "}
                        {rateComparison.difference}%
                        <span className="ml-1 text-gray-400 text-xs">
                          (₱{rateComparison.latest})
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-b border-gray-700 pb-4 text-sm sm:text-base">
                    <span>Estimated Bill Range:</span>
                    <span className="font-semibold text-green-400">
                      ₱{predictionResult.estimatedBill.min} – ₱
                      {predictionResult.estimatedBill.max}
                    </span>
                  </div>

                  {/* Comparison with saved calculations */}
                  {savedCalculations.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                      <h4 className="font-medium mb-2 text-sm sm:text-base">
                        Compare with a saved calculation:
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select
                          placeholder="Select calculation"
                          data={savedCalculations.map((calc) => ({
                            value: calc.id,
                            label:
                              calc.name ||
                              `Calculation (${calc.id.substring(0, 8)})`,
                          }))}
                          value={selectedCalculation}
                          onChange={setSelectedCalculation}
                          className="flex-1"
                          styles={{
                            input: {
                              backgroundColor: "#383c3d",
                              borderColor: "#383c3d",
                              color: "white",
                              fontSize: "14px",
                            },
                          }}
                        />
                        <button
                          onClick={handleCompare}
                          disabled={!selectedCalculation}
                          className="bg-cta-bluegreen text-black px-3 py-1 rounded hover:bg-cta-bluegreen/80 transition cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed text-sm sm:text-base">
                          Compare
                        </button>
                      </div>

                      {comparisonResult && (
                        <div className="mt-3 p-2 sm:p-3 bg-[#1a1a1a] rounded">
                          <p className="text-xs sm:text-sm text-gray-400 mb-2">
                            Comparing with: {comparisonResult.savedName}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className="text-sm sm:text-base">
                              Saved Calculation: ₱{comparisonResult.savedBill}
                            </span>
                            <span
                              className={`flex items-center text-xs sm:text-sm mt-1 sm:mt-0 ${
                                comparisonResult.isHigher
                                  ? "text-red-400"
                                  : "text-green-400"
                              }`}>
                              {comparisonResult.isHigher ? (
                                <FiTrendingUp className="mr-1 flex-shrink-0" />
                              ) : (
                                <FiTrendingDown className="mr-1 flex-shrink-0" />
                              )}
                              Prediction is{" "}
                              {comparisonResult.isHigher ? "higher" : "lower"}{" "}
                              by ₱{comparisonResult.difference} (
                              {comparisonResult.percentDifference}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    {!isSaved ? (
                      <button
                        onClick={handleSavePrediction}
                        className="mt-4 py-1.5 sm:py-2 px-4 sm:px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black rounded transition cursor-pointer text-sm sm:text-base">
                        Save Prediction
                      </button>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 text-green-400 font-medium text-sm sm:text-base">
                        Prediction saved
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Select Appliance Sets"
        styles={{
          title: { color: "white", fontWeight: "bold" },
          header: { backgroundColor: "#212121" },
          content: { backgroundColor: "#212121", color: "white" },
          close: { color: "white" },
        }}
        size="sm">
        <div className="py-4">
          {loading ? (
            <p>Loading appliance sets...</p>
          ) : applianceSets.length > 0 ? (
            <>
              <h3 className="mb-2 text-sm sm:text-base">
                Available Appliance Sets
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {applianceSets.map((set) => (
                  <div
                    key={set.value}
                    className="flex items-center p-2 bg-[#383c3d] rounded hover:bg-gray-600">
                    <input
                      type="checkbox"
                      id={`set-${set.value}`}
                      checked={tempSelectedSets?.includes(set.value)}
                      onChange={() => toggleApplianceSetSelection(set.value)}
                      className="mr-3"
                    />
                    <label
                      htmlFor={`set-${set.value}`}
                      className="cursor-pointer flex-1 text-sm sm:text-base break-words">
                      {set.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="py-1.5 sm:py-2 px-3 sm:px-4 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm sm:text-base">
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  className="py-1.5 sm:py-2 px-3 sm:px-4 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black rounded text-sm sm:text-base"
                  disabled={!tempSelectedSets.length}>
                  Confirm Selection
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm sm:text-base">
              No appliance sets found. Please create one first.
            </p>
          )}
        </div>
      </Modal>
      <section className="h-20"></section>
    </>
  );
}
