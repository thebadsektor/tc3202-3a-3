import { useState, useEffect } from "react";
import { MonthPickerInput } from "@mantine/dates";
import { Modal, Select } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get, set } from "firebase/database";

export default function BillPrediction() {
  // lock in default april lang muna
  const [month, setMonth] = useState(new Date(2025, 3, 1));

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

  const handlePrediction = async () => {
    const selectedMonth = month.toISOString().slice(0, 7); // e.g., "2025-04"

    try {
      const res = await fetch("http://localhost:8000/api/predict/", {
        method: "GET",
      });

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
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Error while predicting. Please try again.");
    }
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
        <div className="w-2xl mx-auto p-5 text-white rounded-lg shadow-lg">
          <span className="text-white/40 text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Bill Prediction
          </span>
          <h2 className="text-4xl font-bold mb-3">
            Electricity Bill Prediction
          </h2>

          <p className="mb-5 text-white/60">
            The system retrieves the calculated energy consumption data and
            processes it through an (SARIMAX/XGBoost) machine learning model
            trained on historical electricity rate data, providing users with an
            estimated electricity bill.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={openModal}
              className="mt-2 py-2 px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black cursor-pointer rounded transition"
              disabled={!user || loading}
            >
              Import
            </button>
            <MonthPickerInput
              placeholder="Select Month"
              value={month}
              onChange={setMonth}
              disabled
              classNames={{
                input:
                  "!bg-gray-800 !text-white !border-gray-600 !w-auto !py-2 mt-2",
                label: "text-white",
                dropdown: "!bg-gray-900 !text-white !border-gray-700",
              }}
            />
          </div>

          {!user && authInitialized && (
            <div className="mt-4 p-4 bg-red-800/50 rounded">
              <p>You need to be logged in to access your appliance sets.</p>
            </div>
          )}

          {/* Display selected appliance sets */}
          {selectedApplianceSets.length > 0 && (
            <div className="mt-15 space-y-4">
              {selectedApplianceSets.map((setKey) => {
                const setData = selectedSetsData[setKey] || {};
                const appliances = setData.appliances || {};

                return (
                  <div key={setKey} className="p-4 bg-gray-800 rounded">
                    <h3 className="text-xl font-semibold mb-3">
                      Selected Set:{" "}
                      <span className="text-cta-bluegreen">
                        {setData.label || setKey}
                      </span>
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium">Appliances:</h4>
                        <button
                          onClick={() => toggleViewAllAppliances(setKey)}
                          className="text-cta-bluegreen hover:text-cta-bluegreen/80 text-sm underline"
                        >
                          {expandedSets[setKey] ? "Collapse All" : "View All"}
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {Object.keys(appliances).length > 0 ? (
                          Object.entries(appliances).map(([key, appliance]) => (
                            <li
                              key={key}
                              className="bg-gray-700 rounded overflow-hidden"
                            >
                              <div
                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-600 transition"
                                onClick={() =>
                                  toggleApplianceExpand(setKey, key)
                                }
                              >
                                <span>{appliance.name}</span>
                                <span className="flex items-center">
                                  {expandedAppliances[`${setKey}-${key}`] ? (
                                    <FiChevronDown />
                                  ) : (
                                    <FiChevronRight />
                                  )}
                                </span>
                              </div>

                              {expandedAppliances[`${setKey}-${key}`] && (
                                <div className="p-3 bg-gray-800 border-t border-gray-600 space-y-2">
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
                                    <span>
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
                          <li className="text-gray-400">
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
                className="w-full mt-2 py-2 px-5 bg-green-400 hover:bg-green-400/80 text-black cursor-pointer rounded transition"
                disabled={!user || loading}
              >
                Calculate
              </button>
              {predictionResult && (
                <div className="mt-5 p-4 bg-gray-800 rounded shadow text-white space-y-3 border border-gray-700">
                  <h3 className="text-xl font-bold">
                    Predicted Electricity Bill Summary
                  </h3>

                  <div className="flex justify-between border-b border-gray-700 pb-2 mt-10">
                    <span>Monthly Consumption:</span>
                    <span className="font-semibold">
                      {predictionResult.totalKWh} kWh
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    <span>Predicted Rate:</span>
                    <span className="font-semibold">
                      ₱{predictionResult.predictedRate} / kWh
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-700 pb-4">
                    <span>Estimated Bill Range:</span>
                    <span className="font-semibold text-green-400">
                      ₱{predictionResult.estimatedBill.min} – ₱
                      {predictionResult.estimatedBill.max}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    {!isSaved ? (
                      <button
                        onClick={handleSavePrediction}
                        className="mt-4 py-2 px-5 bg-cta-bluegreen  hover:bg-cta-bluegreen/80 text-black rounded transition cursor-pointer"
                      >
                        Save Prediction
                      </button>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 text-green-400 font-medium">
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
          header: { backgroundColor: "#2C2E33" },
          content: { backgroundColor: "#2C2E33", color: "white" },
          close: { color: "white" },
        }}
      >
        <div className="py-4">
          {loading ? (
            <p>Loading appliance sets...</p>
          ) : applianceSets.length > 0 ? (
            <>
              <h3 className="mb-2">Available Appliance Sets</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {applianceSets.map((set) => (
                  <div
                    key={set.value}
                    className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600"
                  >
                    <input
                      type="checkbox"
                      id={`set-${set.value}`}
                      checked={tempSelectedSets?.includes(set.value)}
                      onChange={() => toggleApplianceSetSelection(set.value)}
                      className="mr-3"
                    />
                    <label
                      htmlFor={`set-${set.value}`}
                      className="cursor-pointer flex-1"
                    >
                      {set.label}
                    </label>
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
                  disabled={!tempSelectedSets.length}
                >
                  Confirm Selection
                </button>
              </div>
            </>
          ) : (
            <p>No appliance sets found. Please create one first.</p>
          )}
        </div>
      </Modal>
      <section className="h-20"></section>
    </>
  );
}
