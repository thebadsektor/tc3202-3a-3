import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaMinus,
  FaArrowLeft,
  FaSave,
} from "react-icons/fa";
import { useDisclosure } from "@mantine/hooks";
import { Modal, NumberInput, Chip, NativeSelect } from "@mantine/core";
import { getDatabase, ref, push, update, onValue } from "firebase/database";

const ApplianceItems = ({
  setId,
  setName,
  onBack,
  onSave,
  existingData = [],
}) => {
  // State for appliance items within this set
  const [applianceItems, setApplianceItems] = useState([
    { id: 1, name: "", isEditing: false, completed: false },
  ]);

  // State for appliance usage data
  const [applianceData, setApplianceData] = useState({});

  // State for currently selected appliance
  const [selectedAppliance, setSelectedAppliance] = useState(null);

  // State for days selection
  const daysOfWeek = ["SU", "M", "T", "W", "TH", "F", "S"];
  const [selectedDays, setSelectedDays] = useState([]);

  // State for weeks selection
  const [weeks, setWeeks] = useState("1 Week");

  // State for loading when fetching wattage
  const [isLoading, setIsLoading] = useState(false);

  // Modal for usage details
  const [opened, { open, close }] = useDisclosure(false);

  // Load existing data when component mounts or when existingData changes
  useEffect(() => {
    if (existingData && existingData.length > 0) {
      // Create appliance items from existing data
      const items = existingData.map((appliance, index) => ({
        id: index + 1,
        name: appliance.name,
        isEditing: false,
        completed: true,
      }));

      setApplianceItems(items);

      // Create appliance data object from existing data
      const dataObject = {};
      existingData.forEach((appliance) => {
        dataObject[appliance.name] = {
          hours: appliance.hours,
          watt: appliance.watt,
          days: appliance.days,
          weeks: appliance.weeks,
          quant: appliance.quant,
        };
      });

      setApplianceData(dataObject);
    }
  }, [existingData]);

  // Add new appliance item
  const addApplianceItem = () => {
    setApplianceItems([
      ...applianceItems,
      { id: Date.now(), name: "", isEditing: true, completed: false },
    ]);
  };

  // Update appliance name
  const updateAppliance = (id, value) => {
    setApplianceItems(
      applianceItems.map((item) =>
        item.id === id ? { ...item, name: value } : item
      )
    );
  };

  // Delete appliance item
  const deleteApplianceItem = (id) => {
    if (applianceItems.length === 1) {
      alert("You must have at least one appliance.");
      return;
    }

    // Find the appliance to be deleted
    const applianceToDelete = applianceItems.find((item) => item.id === id);
    if (!applianceToDelete) return;

    // Ask for confirmation
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${
        applianceToDelete.name || "this appliance"
      }"?`
    );

    if (confirmDelete) {
      // Remove from appliance items
      setApplianceItems(applianceItems.filter((item) => item.id !== id));

      // Remove from appliance data
      if (applianceToDelete.name) {
        setApplianceData((prevData) => {
          const newData = { ...prevData };
          delete newData[applianceToDelete.name];
          return newData;
        });
      }
    }
  };

  // Handle opening the usage modal
  const handleEditUsage = (appliance) => {
    if (!appliance.name.trim()) {
      alert("Please enter an appliance name first");
      return;
    }

    // Set the selected appliance
    setSelectedAppliance(appliance);

    // Load saved data or set defaults
    const savedData = applianceData[appliance.name] || {
      hours: "",
      watt: "",
      days: [],
      weeks: "1 Week",
      quant: 1,
    };

    // Set selected days from the appliance data
    setSelectedDays(savedData.days || []);
    setWeeks(savedData.weeks || "1 Week");

    // Make sure the data is loaded in the state
    setApplianceData((prev) => ({
      ...prev,
      [appliance.name]: savedData,
    }));

    // Open the modal
    open();
  };

  // Save appliance usage data
  const handleSaveUsage = () => {
    if (!selectedAppliance || !selectedAppliance.name.trim()) {
      alert("No appliance selected.");
      return;
    }

    const currentAppliance = applianceData[selectedAppliance.name] || {};

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

    // Save the appliance data
    setApplianceData((prev) => ({
      ...prev,
      [selectedAppliance.name]: {
        ...currentAppliance,
        days: selectedDays,
        weeks: weeks.trim(),
      },
    }));

    // Mark the appliance as completed
    setApplianceItems(
      applianceItems.map((item) =>
        item.id === selectedAppliance.id ? { ...item, completed: true } : item
      )
    );

    setSelectedAppliance(null);
    close();
  };

  const getWattage = async () => {
    if (!selectedAppliance || !selectedAppliance.name.trim()) {
      alert("Please enter an appliance name first");
      return;
    }

    // Set loading to true at the start
    setIsLoading(true);

    try {
      // Make the API request to your Django backend
      const response = await fetch(
        `http://127.0.0.1:8000/wattdabork/get-wattage/?appliance=${encodeURIComponent(
          selectedAppliance.name
        )}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Extract the wattage value from the response
      let wattageValue;
      if (typeof data === "object" && data.wattage_info) {
        // Try to extract just the number
        const matches = data.wattage_info.match(/\d+/);
        wattageValue = matches ? parseInt(matches[0]) : null;
      } else if (typeof data === "string") {
        const matches = data.match(/\d+/);
        wattageValue = matches ? parseInt(matches[0]) : null;
      } else if (typeof data === "number") {
        wattageValue = data;
      }

      if (wattageValue) {
        // Update the appliance data with the fetched wattage
        setApplianceData((prev) => ({
          ...prev,
          [selectedAppliance.name]: {
            ...(prev[selectedAppliance.name] || {}),
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
      // Set loading back to false regardless of success or failure
      setIsLoading(false);
    }
  };

  // In ApplianceItems.jsx, modify the handleSaveAll function:
  const handleSaveAll = async () => {
    // Check if any appliance is incomplete
    const hasIncompleteAppliances = applianceItems.some(
      (item) => !item.completed
    );

    if (hasIncompleteAppliances) {
      alert(
        "Please complete all appliances before saving. Look for fields marked with a red X."
      );
      return;
    }

    // Prepare data for parent component
    const setData = {
      id: setId,
      name: setName,
      appliances: applianceItems.map((item) => ({
        name: item.name,
        ...applianceData[item.name],
      })),
    };

    // Validation if user is logged in
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!userToken || !user) {
      alert("User not logged in");
      return;
    }

    // Initialize realtime database
    const db = getDatabase();

    try {
      // Instead of push, find the existing set and update it
      const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

      // First, get all sets
      onValue(
        applianceSetsRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data) {
            // Find the key for the set we want to update
            const keys = Object.keys(data);
            const setKey = keys.find((key) => data[key].name === setName);

            if (setKey) {
              // If set exists, update it
              const setRef = ref(
                db,
                "users/" + user + "/applianceSets/" + setKey
              );
              update(setRef, {
                ...setData,
                timestamp: Date.now(),
              }).then(() => {
                // Call the onSave callback with the data
                onSave(setData);
                // Return to parent view
                onBack();
              });
            } else {
              // If set doesn't exist (which shouldn't happen), create it
              push(applianceSetsRef, {
                ...setData,
                timestamp: Date.now(),
              }).then(() => {
                onSave(setData);
                onBack();
              });
            }
          }
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("Error saving appliance set:", error);
      alert("Failed to save appliance set.");
    }
  };

  return (
    <div className="w-full mt-10">
      <div className="max-w-lg mx-auto p-5 text-white bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-4 text-white hover:text-blue-400"
          >
            <FaArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-bold flex-1">{setName}</h2>
          <button
            onClick={handleSaveAll}
            className="bg-green-500 hover:bg-green-600 text-black py-2 px-4 rounded flex items-center"
          >
            <FaSave className="mr-2" /> Save Set
          </button>
        </div>

        <p className="mb-5 text-white/60">
          Add appliances to this set and specify their power usage details.
        </p>

        <div className="flex justify-between mb-2">
          <p className="font-semibold">Appliances</p>
          <p className="font-semibold">Edit usage</p>
        </div>

        {/* Appliance Items */}
        {applianceItems.map((appliance) => (
          <div key={appliance.id} className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={appliance.name}
                onChange={(e) => updateAppliance(appliance.id, e.target.value)}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                placeholder="Appliance name"
              />

              {/* Completed status indicator */}
              {appliance.completed ? (
                <FaCheck className="text-green-400" size={18} />
              ) : (
                <FaTimes className="text-red-400" size={18} />
              )}

              {/* Edit usage button */}
              <FaEdit
                className={`cursor-pointer ${
                  !appliance.name.trim()
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-blue-400"
                }`}
                size={18}
                onClick={() => {
                  if (appliance.name.trim()) {
                    handleEditUsage(appliance);
                  } else {
                    alert(
                      "Please enter an appliance name before editing usage."
                    );
                  }
                }}
              />

              {/* Delete button */}
              <FaTrash
                className={`cursor-pointer ${
                  applianceItems.length === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-red-500"
                }`}
                size={18}
                onClick={() => {
                  if (applianceItems.length > 1) {
                    deleteApplianceItem(appliance.id);
                  }
                }}
              />
            </div>
          </div>
        ))}

        {/* Add New Appliance Button */}
        <button
          onClick={addApplianceItem}
          className="flex items-center justify-center w-auto py-1 px-5 mt-3 bg-blue-500 hover:bg-blue-600 rounded transition"
        >
          <FaPlus className="mr-2" /> Add Appliance
        </button>
      </div>

      {/* Usage Modal */}
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
            <span className="text-blue-400">
              {selectedAppliance ? selectedAppliance.name : "Appliance"}
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
                selectedAppliance
                  ? applianceData[selectedAppliance.name]?.quant || ""
                  : ""
              }
              onChange={(value) => {
                if (!selectedAppliance) return;
                setApplianceData((prev) => ({
                  ...prev,
                  [selectedAppliance.name]: {
                    ...prev[selectedAppliance.name],
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
                selectedAppliance
                  ? applianceData[selectedAppliance.name]?.watt || ""
                  : ""
              }
              onChange={(value) => {
                if (!selectedAppliance) return;
                setApplianceData((prev) => ({
                  ...prev,
                  [selectedAppliance.name]: {
                    ...prev[selectedAppliance.name],
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
              <span className="text-blue-400 font-semibold">WattBot</span> will
              automatically analyze your appliance and get the average wattage
              for your appliance
            </p>
            <button
              onClick={getWattage}
              className="bg-blue-500 px-3 py-1 rounded cursor-pointer !text-base flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
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
              selectedAppliance
                ? applianceData[selectedAppliance.name]?.hours || ""
                : ""
            }
            onChange={(value) => {
              if (!selectedAppliance) return;
              setApplianceData((prev) => ({
                ...prev,
                [selectedAppliance.name]: {
                  ...prev[selectedAppliance.name],
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
              selectedAppliance
                ? applianceData[selectedAppliance.name]?.weeks || weeks
                : weeks
            }
            onChange={(event) => {
              const value = event.currentTarget.value;
              setWeeks(value);
              if (!selectedAppliance) return;
              setApplianceData((prev) => ({
                ...prev,
                [selectedAppliance.name]: {
                  ...prev[selectedAppliance.name],
                  weeks: value,
                },
              }));
            }}
            data={["1 Week", "2 Weeks", "3 Weeks", "4 Weeks"]}
          />

          <button
            className="w-full py-2 bg-green-500 hover:bg-green-600 rounded transition mt-6 cursor-pointer"
            onClick={handleSaveUsage}
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ApplianceItems;
