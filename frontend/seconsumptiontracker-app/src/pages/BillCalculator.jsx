import { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaMinus,
} from "react-icons/fa";
import { IoMdHome } from "react-icons/io";
import { useDisclosure } from "@mantine/hooks";
import { Modal, NativeSelect, NumberInput, Chip, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
// Import Firebase functionality from your firebase.js file
import { database } from "../firebase"; // Adjust the path as needed
import { ref, get, set, remove, update, onValue } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Spinner } from "@heroui/spinner";

export default function DynamicTextFields() {
  const [fields, setFields] = useState([
    { id: 1, text: "", isEditing: false, completed: false },
  ]);
  const navigate = useNavigate();

  const [applianceData, setApplianceData] = useState({});
  const [value, setValue] = useState("");
  const [weeks, setWeeks] = useState("1 Week");
  const [error, setError] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const [selectedDays, setSelectedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [currentSetId, setCurrentSetId] = useState(null);
  const [selectedType, setSelectedType] = useState("residential");
  const [electricityRate, setElectricityRate] = useState(12.2901);
  const [applianceSets, setApplianceSets] = useState({});
  const [importModalOpened, setImportModalOpened] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState(null);

  const [selectedSetId, setSelectedSetId] = useState("");

  // Fetch user data from Firebase when component mounts
  useEffect(() => {
    const auth = getAuth();

    const fetchUserData = async (user) => {
      try {
        setDataLoading(true);

        if (userDetails) {
          fetchApplianceSets();
        }

        if (!user) {
          console.log("No authenticated user found");
          setAuthError("No authenticated user found");
          setDataLoading(false);
          return;
        }

        // Get user email from localStorage or from auth
        const userEmail = localStorage.getItem("userEmail") || user.email;
        if (!userEmail) {
          console.log("No user email found");
          setAuthError("No user email found");
          setDataLoading(false);
          return;
        }

        try {
          const userRef = ref(database, `users/${user.uid}`);
          const userSnapshot = await get(userRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            setUserDetails(userData);
            await processUserData(user.uid, userData);
            return;
          } else {
            console.log("User not found by direct UID, will try email lookup");
          }
        } catch (directFetchError) {
          console.error("Error in direct UID fetch:", directFetchError);
        }

        // Find the user based on email (fallback)
        const usersRef = ref(database, "users");
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
          console.log("No users found in database");
          setAuthError("No users found in database");
          setDataLoading(false);
          return;
        }

        // Find the user node where email matches
        let userId = null;
        let userData = null;

        usersSnapshot.forEach((userSnapshot) => {
          const user = userSnapshot.val();
          if (user.email === userEmail) {
            userId = userSnapshot.key;
            userData = user;
            return true; // Break the forEach loop
          }
        });

        if (!userId) {
          console.log("User not found for email:", userEmail);
          setAuthError(`User not found for email: ${userEmail}`);
          setDataLoading(false);
          return;
        }

        setUserDetails(userData);

        await processUserData(userId, userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAuthError(`Error fetching user data: ${error.message}`);
        setDataLoading(false);
      }
    };

    const processUserData = async (userId, userData) => {
      try {
        // Get the user's appliance sets for the dropdown, but don't load any by default
        const applianceSetsRef = ref(database, `users/${userId}/applianceSets`);
        const applianceSetsSnapshot = await get(applianceSetsRef);

        if (applianceSetsSnapshot.exists()) {
          // Store the sets for the import dropdown but don't load any
          const sets = {};
          applianceSetsSnapshot.forEach((setSnapshot) => {
            const setData = setSnapshot.val();
            sets[setSnapshot.key] = {
              name: setData.name || `Set ${setSnapshot.key}`,
              timestamp: setData.timestamp || 0,
            };
          });

          setApplianceSets(sets);
        }

        // Always start with a single empty field
        setFields([{ id: 1, text: "", isEditing: false, completed: false }]);
      } catch (error) {
        console.error("Error processing user data:", error);
        setAuthError(`Error processing user data: ${error.message}`);
      } finally {
        setDataLoading(false);
      }
    };

    // Check if user is already authenticated
    if (auth.currentUser) {
      fetchUserData(auth.currentUser);
    } else {
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchUserData(user);
        } else {
          setDataLoading(false);
        }
      });

      // Clean up listener
      return () => unsubscribe();
    }
  }, []);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    if (type === "residential") {
      setElectricityRate(13.0127);
    } else {
      setElectricityRate(14.1945);
    }
  };

  const fetchApplianceSets = async () => {
    try {
      if (!userDetails) {
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      const applianceSetsRef = ref(database, `users/${user.uid}/applianceSets`);
      const applianceSetsSnapshot = await get(applianceSetsRef);

      if (!applianceSetsSnapshot.exists()) {
        console.log("No appliance sets found for user");
        setApplianceSets({}); // Set to empty object to handle no sets
        return;
      }

      // Transform the data to include set names and IDs
      const sets = {};
      applianceSetsSnapshot.forEach((setSnapshot) => {
        const setData = setSnapshot.val();
        sets[setSnapshot.key] = {
          name: setData.name || `Set ${setSnapshot.key}`,
          timestamp: setData.timestamp || 0,
        };
      });

      setApplianceSets(sets);
    } catch (error) {
      console.error("Error fetching appliance sets:", error);
    }
  };

  // Add this function to import the selected set
  const importApplianceSet = async () => {
    if (!selectedSetId) {
      alert("Please select an appliance set to import");
      return;
    }

    try {
      setDataLoading(true);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log("No authenticated user found");
        setDataLoading(false);
        return;
      }

      // Get appliances from the selected set
      const appliancesRef = ref(
        database,
        `users/${user.uid}/applianceSets/${selectedSetId}/appliances`
      );
      const appliancesSnapshot = await get(appliancesRef);

      if (!appliancesSnapshot.exists()) {
        console.log("No appliances found in set");
        alert("No appliances found in this set");
        setDataLoading(false);
        return;
      }

      // Process appliances data
      const appliancesData = appliancesSnapshot.val();

      // Transform Firebase data to our local state format
      const newFields = [];
      const newApplianceData = {};

      Object.keys(appliancesData).forEach((appId) => {
        const appliance = appliancesData[appId];

        // Skip entries that don't have required data
        if (!appliance.name) return;

        const fieldId = parseInt(appId) || Date.now() + parseInt(appId);

        newFields.push({
          id: fieldId,
          text: appliance.name,
          isEditing: false,
          completed: true,
        });

        newApplianceData[appliance.name] = {
          watt: appliance.watt || "",
          hours: appliance.hours || "",
          quant: appliance.quant || 1,
          days: appliance.days || [],
          weeks: appliance.weeks || "1 Week",
        };
      });

      // If we found appliances, update our state
      if (newFields.length > 0) {
        setFields(newFields);
        setApplianceData(newApplianceData);
        setCurrentSetId(selectedSetId);
      } else {
        alert("No valid appliances found in this set");
      }

      // Close the modal
      setImportModalOpened(false);
    } catch (error) {
      console.error("Error importing appliance set:", error);
      alert(`Error importing appliance set: ${error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const openImportModal = async () => {
    await fetchApplianceSets();

    const setIds = Object.keys(applianceSets);
    if (setIds.length === 1) {
      setSelectedSetId(setIds[0]);
    } else if (setIds.length > 0 && !selectedSetId) {
      setSelectedSetId(setIds[0]);
    }

    setImportModalOpened(true);
  };

  const addField = () => {
    setFields([
      ...fields,
      { id: Date.now(), text: "", isEditing: true, completed: false },
    ]);
  };

  const saveToFirebase = async () => {
    try {
      if (!userDetails || !currentSetId) {
        console.log("Missing user details or set ID, cannot save");
        return;
      }

      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.log("No user email found in localStorage");
        return;
      }

      const usersRef = ref(database, "users");
      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
        console.log("No users found in database");
        return;
      }

      let userId = null;

      usersSnapshot.forEach((userSnapshot) => {
        const user = userSnapshot.val();
        if (user.email === userEmail) {
          userId = userSnapshot.key;
          return true;
        }
      });

      if (!userId) {
        console.log("User not found for email:", userEmail);
        return;
      }

      const appliancesToSave = {};

      fields.forEach((field, index) => {
        if (field.text && field.completed) {
          const appData = applianceData[field.text];
          if (appData) {
            appliancesToSave[index] = {
              name: field.text,
              watt: appData.watt,
              hours: appData.hours,
              quant: appData.quant,
              days: appData.days || [],
              weeks: appData.weeks || "1 Week",
            };
          }
        }
      });

      const appliancesRef = ref(
        database,
        `users/${userId}/applianceSets/${currentSetId}/appliances`
      );
      await set(appliancesRef, appliancesToSave);

      console.log("Saved appliances to Firebase:", appliancesToSave);
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  const handleDeleteConfirmation = (id) => {
    if (fields.length === 1) {
      alert("You must have at least one appliance.");
      return;
    }

    const field = fields.find((f) => f.id === id);
    if (!field) return;

    setFieldToDelete(field);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!fieldToDelete) return;

    // Perform deletion
    setFields(fields.filter((f) => f.id !== fieldToDelete.id));

    if (fieldToDelete.text) {
      setApplianceData((prevData) => {
        const newData = { ...prevData };
        delete newData[fieldToDelete.text];
        return newData;
      });
    }

    saveToFirebase();

    // Close modal and reset
    setDeleteModal(false);
    setFieldToDelete(null);
  };

  const calculate = () => {
    if (fields.some((field) => !field.completed)) return;

    const applianceResults = Object.entries(applianceData).map(
      ([name, data]) => {
        const { watt, hours, days, weeks, quant } = data;
        const kWh = watt / 1000;

        const weeksNumber = parseInt(weeks.split(" ")[0], 10);

        const quantity = parseInt(quant, 10) || 1;
        const costPerHour = kWh * electricityRate * quantity;
        const costPerDay = costPerHour * hours;
        const costPerWeek = costPerDay * days.length;
        const costPerMonth = costPerWeek * weeksNumber;

        return {
          name,
          ...data,
          costPerHour,
          costPerDay,
          costPerWeek,
          costPerMonth,
          quantity,
        };
      }
    );

    const totalCost = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerMonth,
      0
    );

    const totalCostPerDay = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerDay,
      0
    );

    const totalCostPerWeek = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerWeek,
      0
    );

    const totalCostPerHour = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerHour,
      0
    );

    navigate("/bill-output", {
      state: {
        appliances: applianceResults,
        totalCost,
        monthlyBill: value,
        totalCostPerHour,
        totalCostPerDay,
        totalCostPerWeek,
      },
    });
  };

  const handleSave = () => {
    if (!selectedField || !selectedField.text.trim()) {
      alert("No appliance selected.");
      return;
    }

    const currentAppliance = applianceData[selectedField.text] || {};

    if (
      !currentAppliance.hours ||
      !currentAppliance.quant ||
      !currentAppliance.watt ||
      selectedDays.length === 0 ||
      !weeks.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    setApplianceData((prev) => ({
      ...prev,
      [selectedField.text]: {
        ...currentAppliance,
        days: selectedDays,
        weeks: weeks.trim(),
      },
    }));

    setFields(
      fields.map((f) =>
        f.id === selectedField.id ? { ...f, completed: true } : f
      )
    );

    setSelectedField(null);
    close();

    setTimeout(() => {
      saveToFirebase();
    }, 100);
  };

  const [opened, { open, close }] = useDisclosure(false);

  const getWattage = async () => {
    if (!selectedField || !selectedField.text.trim()) {
      alert("Please enter an appliance name first");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/wattdabork/get-wattage/?appliance=${encodeURIComponent(
          selectedField.text
        )}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      let wattageValue;
      if (typeof data === "object" && data.wattage_info) {
        const matches = data.wattage_info.match(/\d+/);
        wattageValue = matches ? parseInt(matches[0]) : null;
      } else if (typeof data === "string") {
        const matches = data.match(/\d+/);
        wattageValue = matches ? parseInt(matches[0]) : null;
      } else if (typeof data === "number") {
        wattageValue = data;
      }

      if (wattageValue) {
        setApplianceData((prev) => ({
          ...prev,
          [selectedField.text]: {
            ...(prev[selectedField.text] || {}),
            watt: wattageValue,
          },
        }));
      } else {
        alert("Could not determine wattage from response");
      }
    } catch (error) {
      console.error("Error fetching wattage:", error);
      alert(`Failed to get wattage: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="relative w-8 h-8">
          <div className="w-full h-full rounded-full border-4 border-gray-100 opacity-25"></div>
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-[#0BFEFA] animate-spin"
            style={{ borderTopColor: "#0BFEFA" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-h-[90vh] h-auto flex items-start justify-center mt-[15vh] px-4 sm:px-6">
        <div className="w-full max-w-lg mx-auto p-3 sm:p-5 text-white rounded-lg shadow-xl">
          <span className="text-white/40 text-xs sm:text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Energy consumption calculator
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            Energy Consumption Calculator
          </h2>

          <p className="mb-3 sm:mb-5 text-sm sm:text-base text-white/60">
            Know how much your appliances and gadgets consume so you can stay in
            control and manage your monthly budget better.
          </p>

          <p className="font-bold mb-3 sm:mb-4 text-sm sm:text-base">
            Start by filling out this form
          </p>

          <div className="bg-blue-100 py-3 sm:py-5 px-4 sm:px-6 rounded-2xl text-black mb-4 sm:mb-5">
            <h1 className="text-lg sm:text-xl text-center font-bold">
              Select environment
            </h1>
            <p className="text-center text-sm sm:text-base">
              This will determine the rate per kWh to be applied.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 mb-6 sm:mb-10">
            <div className="flex justify-center gap-2 sm:gap-4 w-full max-w-md">
              <button
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg border-1 text-sm sm:text-base cursor-pointer ${
                  selectedType === "residential"
                    ? "border-cta-bluegreen bg-cta-bluegreen text-black"
                    : "border-blue-200 text-white hover:bg-cta-bluegreen/10"
                } font-medium transition-colors`}
                onClick={() => handleTypeSelection("residential")}
              >
                Residential
              </button>

              <button
                className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 rounded-lg border-1 text-sm sm:text-base cursor-pointer ${
                  selectedType === "business"
                    ? "border-cta-bluegreen bg-cta-bluegreen text-black"
                    : "border-gray-200 text-white hover:bg-cta-bluegreen/10"
                } font-medium transition-colors`}
                onClick={() => handleTypeSelection("business")}
              >
                Small Business
              </button>
            </div>
          </div>
          <div className="flex justify-between text-sm sm:text-base mb-1">
            <p>Appliances</p>
            <p>Edit usage</p>
          </div>

          {/* fields */}
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1 mb-2 sm:mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  value={field.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setFields((prev) =>
                      prev.map((f) =>
                        f.id === field.id
                          ? { ...f, text: newText, error: "" }
                          : f
                      )
                    );
                  }}
                  className="flex-1 p-1.5 sm:p-2 text-sm sm:text-base bg-[#383c3d] border border-gray-600 rounded focus:outline-none"
                  placeholder="Ex: TCL Smart TV 55'"
                />

                {field.completed ? (
                  <FaCheck className="text-green-400 flex-shrink-0" size={16} />
                ) : (
                  <FaTimes className="text-red-400 flex-shrink-0" size={16} />
                )}

                <FaEdit
                  className={`cursor-pointer flex-shrink-0 ${
                    !field.text.trim()
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-blue-400"
                  }`}
                  size={16}
                  onClick={() => {
                    if (!field.text.trim()) {
                      alert("Please enter an appliance name before editing.");
                      return;
                    }

                    setSelectedField(field);

                    const savedData = applianceData[field.text] || {
                      hours: "",
                      watt: "",
                      days: [],
                      weeks: "1 Week",
                      quant: 1,
                    };

                    setSelectedDays(savedData.days || []);
                    setWeeks(savedData.weeks || "1 Week");

                    setApplianceData((prev) => ({
                      ...prev,
                      [field.text]: savedData,
                    }));

                    open();
                  }}
                />

                <FaTrash
                  className={`cursor-pointer flex-shrink-0 ${
                    fields.length === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-red-500"
                  }`}
                  size={16}
                  onClick={() => {
                    if (fields.length > 1) {
                      handleDeleteConfirmation(field.id);
                    }
                  }}
                />
              </div>

              {field.error && (
                <p className="text-red-500 text-xs sm:text-sm">{field.error}</p>
              )}
            </div>
          ))}

          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <button
              onClick={addField}
              className="flex items-center justify-center py-1.5 sm:py-2 px-4 sm:px-5 mt-2 bg-cta-bluegreen hover:bg-cta-bluegreen/80 cursor-pointer text-black rounded transition text-sm sm:text-base"
            >
              <FaPlus className="mr-2" /> Add Appliance
            </button>

            <button
              onClick={openImportModal}
              className="mt-2 py-1.5 sm:py-2 px-4 sm:px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black cursor-pointer rounded transition text-sm sm:text-base"
            >
              Import
            </button>
          </div>

          <button
            onClick={calculate}
            className={`w-full mt-8 sm:mt-12 py-2 rounded transition text-black text-sm sm:text-base ${
              fields.some((field) => !field.completed)
                ? "bg-[#008631] cursor-not-allowed"
                : "bg-[#39e75f] hover:bg-[#39e75f]/80 cursor-pointer"
            }`}
          >
            Calculate
          </button>
        </div>
      </div>

      <Modal
        opened={opened}
        onClose={close}
        styles={{
          header: { backgroundColor: "#212121", padding: "16px" },
          content: { backgroundColor: "#212121" },
        }}
      >
        <div className="text-white p-1 sm:p-2">
          <h1 className="text-xl sm:text-2xl font-semibold break-words">
            Usage for{" "}
            <span className="text-cta-bluegreen">
              {selectedField ? selectedField.text : "Appliance"}
            </span>
          </h1>
          <br />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
            <NumberInput
              label="No. of Appliances"
              withAsterisk
              description="Enter how many of this appliance you have"
              placeholder="Enter quantity"
              min={1}
              className="mb-3"
              value={
                selectedField
                  ? applianceData[selectedField.text]?.quant || ""
                  : ""
              }
              onChange={(value) => {
                if (!selectedField) return;
                setApplianceData((prev) => ({
                  ...prev,
                  [selectedField.text]: {
                    ...prev[selectedField.text],
                    quant: value,
                  },
                }));
              }}
              styles={{
                input: {
                  backgroundColor: "#383c3d",
                  borderColor: "#383c3d",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  "&:focus": {
                    borderColor: "#fff",
                  },
                },
                description: {
                  fontSize: "12px",
                },
                label: {
                  fontSize: "14px",
                },
              }}
            />
            <NumberInput
              label="Wattage"
              withAsterisk
              description="Enter the wattage of the selected appliance"
              placeholder="Enter wattage"
              min={1}
              className="mb-3"
              value={
                selectedField
                  ? applianceData[selectedField.text]?.watt || ""
                  : ""
              }
              onChange={(value) => {
                if (!selectedField) return;
                setApplianceData((prev) => ({
                  ...prev,
                  [selectedField.text]: {
                    ...prev[selectedField.text],
                    watt: value,
                  },
                }));
              }}
              styles={{
                input: {
                  backgroundColor: "#383c3d",
                  borderColor: "#383c3d",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  "&:focus": {
                    borderColor: "#fff",
                  },
                },
                description: {
                  fontSize: "12px",
                },
                label: {
                  fontSize: "14px",
                },
              }}
            />
          </div>
          <div className="bg-[#383c3d] p-3 sm:p-5 rounded mt-3">
            <h4 className="text-sm sm:text-base font-semibold mb-1">
              Don't know your appliance wattage?{" "}
            </h4>
            <p className="text-xs sm:text-[14px] text-white/60 mb-2">
              <span className="text-cta-bluegreen font-semibold">WattBot</span>{" "}
              will automatically analyze your appliance and get the average
              wattage for your appliance
            </p>
            <button
              onClick={getWattage}
              className="bg-cta-bluegreen text-black px-3 py-1 rounded cursor-pointer !text-sm sm:!text-base flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                  Analyzing...
                </>
              ) : (
                "Get Wattage"
              )}
            </button>
          </div>

          <NumberInput
            label="Hours"
            withAsterisk
            description="Enter the number of hours used"
            placeholder="Enter hours"
            min={1}
            max={24}
            className="mb-3 mt-3"
            value={
              selectedField
                ? applianceData[selectedField.text]?.hours || ""
                : ""
            }
            onChange={(value) => {
              if (!selectedField) return;
              setApplianceData((prev) => ({
                ...prev,
                [selectedField.text]: {
                  ...prev[selectedField.text],
                  hours: value,
                },
              }));
            }}
            styles={{
              input: {
                backgroundColor: "#383c3d",
                borderColor: "#383c3d",
                color: "#FFFFFF",
                fontSize: "14px",
                "&:focus": {
                  borderColor: "#fff",
                },
              },
              description: {
                fontSize: "12px",
              },
              label: {
                fontSize: "14px",
              },
            }}
          />

          <p className="mb-2 sm:mb-3 mt-4 sm:mt-5 text-sm sm:text-base">
            Days used per week<span className="text-red-400">*</span>
          </p>
          <Chip.Group multiple value={selectedDays} onChange={setSelectedDays}>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3">
              {daysOfWeek.map((day) => (
                <Chip
                  key={day}
                  value={day}
                  size="md"
                  radius="xl"
                  styles={{
                    label: {
                      fontSize: "12px",
                      padding: "12 8px",
                    },
                  }}
                >
                  {day}
                </Chip>
              ))}
            </div>
          </Chip.Group>

          <p className="mb-2 sm:mb-3 mt-4 sm:mt-6 text-sm sm:text-base">
            Weeks used per month <span className="text-red-400">*</span>
          </p>
          <NativeSelect
            value={
              selectedField
                ? applianceData[selectedField.text]?.weeks || weeks
                : weeks
            }
            onChange={(event) => {
              const value = event.currentTarget.value;
              setWeeks(value);
              if (!selectedField) return;
              setApplianceData((prev) => ({
                ...prev,
                [selectedField.text]: {
                  ...prev[selectedField.text],
                  weeks: value,
                },
              }));
            }}
            data={["1 Week", "2 Weeks", "3 Weeks", "4 Weeks"]}
            styles={{
              input: {
                backgroundColor: "#383c3d",
                borderColor: "#383c3d",
                color: "#FFFFFF",
                fontSize: "14px",
                "&:focus": {
                  borderColor: "#fff",
                },
              },
            }}
          />
          <button
            className="w-full py-1.5 sm:py-2 bg-[#39e75f] hover:bg-[#39e75f]/80 text-black rounded transition mt-8 sm:mt-10 cursor-pointer text-sm sm:text-base"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </Modal>

      <Modal
        opened={importModalOpened}
        onClose={() => setImportModalOpened(false)}
        title="Import Appliance Set"
        styles={{
          header: {
            backgroundColor: "#212121",
            padding: "16px",
            color: "white",
          },
          content: { backgroundColor: "#212121" },
        }}
        size="xs"
      >
        <div className="text-white p-1 sm:p-2">
          <h1 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Select Appliance Set to Import
          </h1>

          <NativeSelect
            data={
              Object.keys(applianceSets).length > 0
                ? Object.entries(applianceSets).map(([id, set]) => ({
                    value: id,
                    label: set.name || `Set ${id}`,
                  }))
                : [{ value: "", label: "No sets available" }]
            }
            value={selectedSetId || Object.keys(applianceSets)[0] || ""}
            onChange={(event) => setSelectedSetId(event.currentTarget.value)}
            placeholder="Select an appliance set"
            className="mb-4"
            styles={{
              input: {
                backgroundColor: "#383c3d",
                borderColor: "#383c3d",
                color: "#FFFFFF",
                fontSize: "14px",
                "&:focus": {
                  borderColor: "#fff",
                },
              },
            }}
          />

          <button
            className="w-full py-1.5 sm:py-2 bg-[#39e75f] hover:bg-[#39e75f]/80 text-black rounded transition mt-2 sm:mt-4 cursor-pointer text-sm sm:text-base"
            onClick={importApplianceSet}
          >
            Import
          </button>
        </div>
      </Modal>

      <Modal
        opened={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Deletion"
        styles={{
          header: {
            backgroundColor: "#13171C",
            padding: "16px",
            color: "white",
          },
          content: { backgroundColor: "#13171C" },
        }}
        centered
        size="xs"
      >
        <div className="text-white p-2">
          <p className="mb-3 sm:mb-4 pr-2 text-sm sm:text-base">
            Are you sure you want to delete "
            <span className="text-cta-bluegreen break-words">
              {fieldToDelete?.text || "this appliance"}"?
            </span>
          </p>
          <div className="flex justify-end space-x-3 sm:space-x-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModal(false)}
              color="gray"
              className="text-white border-gray-500 hover:bg-gray-700 text-xs sm:text-sm py-1 h-auto"
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm py-1 h-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
