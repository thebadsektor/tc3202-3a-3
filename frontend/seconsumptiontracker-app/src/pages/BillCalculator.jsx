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
  const daysOfWeek = ["SU", "M", "T", "W", "TH", "F", "S"];
  const [selectedDays, setSelectedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [currentSetId, setCurrentSetId] = useState(null);

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

  const handleIncrement = () => {
    setValue((prev) => {
      const newValue = prev === "" ? 500 : prev + 500;
      setError(false);
      return newValue;
    });
  };

  const handleDecrement = () => {
    setValue((prev) => {
      if (prev === "" || prev - 500 < 500) {
        setError(true); // Show error if below 500
        return prev === "" ? 500 : prev; // Prevent going below 500
      }
      return prev - 500;
    });
  };

  const handleChange = (e) => {
    const newValue = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric chars
    if (newValue === "") {
      setValue("");
      setError(false); // Hide error if empty
      return;
    }

    const parsedValue = parseInt(newValue, 10);
    setValue(parsedValue);

    if (parsedValue < 500) {
      setError(true); // Show error if below 500
    } else {
      setError(false); // Hide error if valid
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
    const hasIncompleteFields = fields.some((field) => !field.completed);

    if (hasIncompleteFields) {
      alert(
        "Please complete all appliances before calculating. Look for fields marked with a red X."
      );
      return;
    }

    if (fields.some((field) => !field.completed)) return;

    const electricityRate = 12.1901;

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
      <div className="w-full min-h-[90vh] h-auto flex items-start justify-center mt-[15vh]">
        <div className="max-w-lg mx-auto p-5 text-white rounded-lg shadow-lg">
          <span className="text-white/40 text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Energy consumption calculator
          </span>
          <h2 className="text-4xl font-bold mb-3">
            Energy Consumption Calculator
          </h2>

          <p className="mb-5 text-white/60">
            Know how much your appliances and gadgets consume so you can stay in
            control and manage your monthly budget better.
          </p>

          <p className="font-bold mb-4">Start by filling out this form</p>

          <div className="bg-blue-100 py-5 px-15 rounded-2xl text-black mb-5">
            <h1 className="text-xl text-center font-bold">
              Average Monthly Bill
            </h1>
            <p className="text-center">
              This will determine the rate per kWh to be applied.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-200 text-blue-200 hover:bg-white/20 cursor-pointer"
                onClick={handleDecrement}
              >
                <FaMinus />
              </button>

              <div className="flex items-center w-48 p-2 border rounded-lg bg-white font-bold text-gray-800">
                <span className="text-gray-400 mr-2">Php</span>
                <input
                  type="text"
                  value={value === "" ? "" : value.toLocaleString()}
                  onChange={handleChange}
                  placeholder="500"
                  className="w-full bg-transparent outline-none text-right font-bold placeholder-gray-400"
                />
              </div>

              <button
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-blue-200 text-blue-200 hover:bg-white/20 cursor-pointer"
                onClick={handleIncrement}
              >
                <FaPlus />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm">
                Value cannot be lower than 500
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <p className="">Appliances</p>
            <p>Edit usage</p>
          </div>

          {/* fields */}
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1 mb-3">
              <div className="flex items-center gap-3">
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
                  className="flex-1 !text-xl p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                  placeholder="Appliance name"
                />

                {field.completed ? (
                  <FaCheck
                    className="text-green-400 cursor-pointer"
                    size={18}
                  />
                ) : (
                  <FaTimes className="text-red-400 cursor-pointer" size={18} />
                )}

                <FaEdit
                  className={`cursor-pointer ${
                    !field.text.trim()
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-blue-400"
                  }`}
                  size={18}
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
                  className={`cursor-pointer ${
                    fields.length === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-red-500"
                  }`}
                  size={18}
                  onClick={() => {
                    if (fields.length > 1) {
                      handleDeleteConfirmation(field.id);
                    }
                  }}
                />
              </div>

              {field.error && (
                <p className="text-red-500 text-sm">{field.error}</p>
              )}
            </div>
          ))}

          <div className="flex justify-between">
            <button
              onClick={addField}
              className="flex items-center justify-center w-auto py-2 px-5 mt-2 bg-cta-bluegreen hover:bg-cta-bluegreen/80 cursor-pointer text-black rounded transition"
            >
              <FaPlus className="mr-2" /> Add Appliance
            </button>

            <button
              onClick={openImportModal}
              className="mt-2 py-2 px-5 bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black cursor-pointer rounded transition"
            >
              Import
            </button>
          </div>

          <button
            onClick={calculate}
            className={`w-full mt-12 py-2 rounded transition cursor-pointer ${
              fields.some((field) => !field.completed)
                ? "bg-green-800/50 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
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
          header: { backgroundColor: "#13171C", padding: "16px" },
          content: { backgroundColor: "#13171C" },
        }}
      >
        <div className="text-white">
          <h1 className="text-2xl font-semibold">
            Usage for{" "}
            <span className="text-cta-bluegreen">
              {selectedField ? selectedField.text : "Appliance"}
            </span>
          </h1>
          <br />

          <div className="flex gap-5">
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
            />
          </div>
          <div className="bg-white/20 p-5 rounded mt-3">
            <h4 className="text-base font-semibold mb-1">
              Don't know your appliance wattage?{" "}
            </h4>
            <p className="text-[14px] text-white/60 mb-2">
              <span className="text-cta-bluegreen font-semibold">WattBot</span>{" "}
              will automatically analyze your appliance and get the average
              wattage for your appliance
            </p>
            <button
              onClick={getWattage}
              className="bg-cta-bluegreen text-black px-3 py-1 rounded cursor-pointer !text-base flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
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
          />

          <p className="mb-3 mt-5">
            Days used per week<span className="text-red-400">*</span>
          </p>
          <Chip.Group multiple value={selectedDays} onChange={setSelectedDays}>
            <div className="flex gap-2 flex-wrap mb-3">
              {daysOfWeek.map((day) => (
                <Chip key={day} value={day} size="lg" radius="xl">
                  {day}
                </Chip>
              ))}
            </div>
          </Chip.Group>

          <p className="mb-3 mt-6">
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
          />
          <button
            className="w-full py-2 bg-green-500 hover:bg-green-600 rounded transition mt-15 cursor-pointer"
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
            backgroundColor: "#13171C",
            padding: "16px",
            color: "white",
          },
          content: { backgroundColor: "#13171C" },
        }}
      >
        <div className="text-white">
          <h1 className="text-xl font-semibold mb-4">
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
          />

          <button
            className="w-full py-2 bg-green-500 hover:bg-green-600 rounded transition mt-4 cursor-pointer"
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
      >
        <div className="text-white p-2">
          <p className="mb-4 pr-2">
            Are you sure you want to delete "
            <span className="text-cta-bluegreen">
              {fieldToDelete?.text || "this appliance"}"?
            </span>
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModal(false)}
              color="gray"
              className="text-white border-gray-500 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
