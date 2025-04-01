import { useState, useEffect } from "react";
import { MonthPickerInput } from "@mantine/dates";
import { Modal, Select } from "@mantine/core";
import { IoMdHome } from "react-icons/io";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue, get } from "firebase/database";

export default function BillPrediction() {
  const [month, setMonth] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [applianceSets, setApplianceSets] = useState([]);
  const [selectedApplianceSet, setSelectedApplianceSet] = useState(null);
  const [selectedApplianceData, setSelectedApplianceData] = useState(null);
  const [expandedAppliances, setExpandedAppliances] = useState({});
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [user, setUser] = useState(null);

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

  const openModal = () => setModalOpened(true);
  const closeModal = () => setModalOpened(false);

  const handleImport = (applianceSetKey) => {
    console.log("Selected appliance set key:", applianceSetKey);

    // Find the selected appliance set data
    const selectedSet = applianceSets.find(
      (set) => set.value === applianceSetKey
    );
    setSelectedApplianceSet(applianceSetKey);

    if (selectedSet && selectedSet.allAppliances) {
      console.log("Using cached appliance data");
      setSelectedApplianceData(selectedSet.allAppliances);
    } else {
      // If we don't have the data in state already, fetch it from Firebase
      if (user) {
        console.log("Fetching fresh appliance data");
        const db = getDatabase();
        const applianceSetRef = ref(
          db,
          `users/${user.uid}/applianceSets/${applianceSetKey}/appliances`
        );

        get(applianceSetRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log("Fetched appliance data:", data);
              setSelectedApplianceData(data);
            } else {
              console.log("No appliance data found");
            }
          })
          .catch((error) => {
            console.error("Error fetching appliance data:", error);
          });
      }
    }

    closeModal();
  };

  const toggleApplianceExpand = (applianceKey) => {
    setExpandedAppliances((prev) => ({
      ...prev,
      [applianceKey]: !prev[applianceKey],
    }));
  };

  return (
    <>
      <div className="w-full h-screen flex items-start justify-center mt-[15vh]">
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

          {selectedApplianceSet && selectedApplianceData && (
            <div className="mt-4 p-4 bg-gray-800 rounded">
              <h3 className="text-xl font-semibold mb-3">
                Selected Appliance Set:{" "}
                <span className="text-cta-bluegreen">
                  {applianceSets.find(
                    (set) => set.value === selectedApplianceSet
                  )?.label || selectedApplianceSet}
                </span>
              </h3>

              <div className="space-y-2">
                <h4 className="text-lg font-medium">Appliances:</h4>
                <ul className="space-y-2">
                  {Object.entries(selectedApplianceData).map(
                    ([key, appliance]) => (
                      <li
                        key={key}
                        className="bg-gray-700 rounded overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-600 transition"
                          onClick={() => toggleApplianceExpand(key)}
                        >
                          <span>{appliance.name}</span>
                          <span className="flex items-center">
                            {expandedAppliances[key] ? (
                              <FiChevronDown />
                            ) : (
                              <FiChevronRight />
                            )}
                          </span>
                        </div>

                        {expandedAppliances[key] && (
                          <div className="p-3 bg-gray-800 border-t border-gray-600 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Wattage:</span>
                              <span>{appliance.watt} W</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Quantity:</span>
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
                              <span className="text-gray-400">Weeks:</span>
                              <span>{appliance.weeks}</span>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="Select Appliance Set"
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
              <Select
                label="Available Appliance Sets"
                placeholder="Select an appliance set"
                data={applianceSets}
                onChange={handleImport}
                searchable
              />
            </>
          ) : (
            <p>No appliance sets found. Please create one first.</p>
          )}
        </div>
      </Modal>
    </>
  );
}
