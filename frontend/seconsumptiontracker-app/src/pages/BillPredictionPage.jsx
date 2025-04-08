import { useState, useEffect } from "react";
import { MonthPickerInput } from "@mantine/dates";
import { Modal, Select } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get } from "firebase/database";

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
      //Get predicted rate for the month from backend
      //fixed pa 'yung month sa april lang
      const res = await fetch("http://localhost:8000/api/predict/", {
        method: "GET",
      });
  
      const data = await res.json();

      const predictedRate = data.prediction; 
      console.log("Predicted rate for the month:", predictedRate);
  
      // Calculate total consumption in kWh
      let totalKWh = 0;
  
      selectedApplianceSets.forEach((setKey) => {
        const setData = selectedSetsData[setKey];
        const appliances = setData?.appliances || {};
  
        Object.values(appliances).forEach((appliance) => {
          const watts = parseFloat(appliance.watt) || 0;
          const hours = parseFloat(appliance.hours) || 0;
          const quantity = parseInt(appliance.quant) || 1;
          const days = Array.isArray(appliance.days) ? appliance.days.length : 7;
          const weeks = parseFloat(appliance.weeks) || 4;
  
          // Calculate monthly consumption based on days per week and weeks per month
          const dailyKWh = (watts * hours * quantity) / 1000;
          const monthlyKWh = dailyKWh * days * weeks / 7; // Convert days per week to monthly
          totalKWh += monthlyKWh;
        });
      });
  
      //Calculate total predicted bill
      const totalBill = totalKWh * predictedRate;
      console.log("Total kWh:", totalKWh);
      console.log("Predicted rate:", predictedRate);
  
      // display
      alert(`Predicted Electricity Bill Summary:
      - Monthly Consumption: ${totalKWh.toFixed(2)} kWh
      - Predicted Rate: ₱${predictedRate.toFixed(4)} per kWh
      - Total Bill: ₱${totalBill.toFixed(2)}`);
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Error while predicting. Please try again.");
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
            Know how much your appliances and gadgets consume so you can stay in
            control and manage your monthly budget better. Know how much your
            appliances and gadgets consume so you can stay in control and manage
            your monthly budget better.
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
