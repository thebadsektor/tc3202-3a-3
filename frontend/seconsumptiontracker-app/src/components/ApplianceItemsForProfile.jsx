import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaSave,
  FaMobile,
  FaLightbulb,
} from "react-icons/fa";
import { useDisclosure } from "@mantine/hooks";
import {
  Modal,
  NumberInput,
  Chip,
  NativeSelect,
  Button,
  Checkbox,
} from "@mantine/core";
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

  const [applianceData, setApplianceData] = useState({});
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const daysOfWeek = ["SU", "M", "T", "W", "TH", "F", "S"];
  const [selectedDays, setSelectedDays] = useState([]);
  const [weeks, setWeeks] = useState("1 Week");
  const [isLoading, setIsLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [gadgetsModalOpened, gadgetsModalHandlers] = useDisclosure(false);
  const [lightingsModalOpened, lightingsModalHandlers] = useDisclosure(false);
  const gadgetOptions = [
    "Smartphone",
    "Tablet/iPad",
    "Laptop",
    "Desktop Computer",
    "Monitor",
    "Game Console",
    "Smart Watch",
    "Bluetooth Speaker",
  ];

  const lightingOptions = [
    "LED Bulb",
    "CFL Bulb",
    "Incandescent Bulb",
    "Fluorescent Tube Light",
    "Desk Lamp",
    "Ceiling Fan with Light",
  ];

  // State for selected gadgets and lightings
  const [selectedGadgets, setSelectedGadgets] = useState([]);
  const [selectedLightings, setSelectedLightings] = useState([]);

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [applianceToDelete, setApplianceToDelete] = useState(null);

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

  // Add selected gadgets to appliance list
  const addSelectedGadgets = () => {
    if (selectedGadgets.length === 0) {
      alert("Please select at least one gadget");
      return;
    }

    // Filter out gadgets that already exist in appliance list
    const existingNames = applianceItems.map((item) => item.name);
    const newGadgets = selectedGadgets.filter(
      (gadget) => !existingNames.includes(gadget)
    );
    const duplicates = selectedGadgets.filter((gadget) =>
      existingNames.includes(gadget)
    );

    // Add only new gadgets
    if (newGadgets.length > 0) {
      const newAppliances = newGadgets.map((gadget) => ({
        id: Date.now() + Math.random(),
        name: gadget,
        isEditing: false,
        completed: false,
      }));

      setApplianceItems([...applianceItems, ...newAppliances]);
    }

    // Show feedback about duplicates if any were found
    if (duplicates.length > 0) {
      alert(
        `The following items were skipped as they already exist: ${duplicates.join(
          ", "
        )}`
      );
    }

    setSelectedGadgets([]);
    gadgetsModalHandlers.close();
  };

  // Add selected lightings to appliance list
  const addSelectedLightings = () => {
    if (selectedLightings.length === 0) {
      alert("Please select at least one lighting option");
      return;
    }

    // Filter out lightings that already exist in appliance list
    const existingNames = applianceItems.map((item) => item.name);
    const newLightings = selectedLightings.filter(
      (lighting) => !existingNames.includes(lighting)
    );
    const duplicates = selectedLightings.filter((lighting) =>
      existingNames.includes(lighting)
    );

    // Add only new lightings
    if (newLightings.length > 0) {
      const newAppliances = newLightings.map((lighting) => ({
        id: Date.now() + Math.random(),
        name: lighting,
        isEditing: false,
        completed: false,
      }));

      setApplianceItems([...applianceItems, ...newAppliances]);
    }

    // Show feedback about duplicates if any were found
    if (duplicates.length > 0) {
      alert(
        `The following items were skipped as they already exist: ${duplicates.join(
          ", "
        )}`
      );
    }

    setSelectedLightings([]);
    lightingsModalHandlers.close();
  };

  // Toggle gadget selection
  const toggleGadgetSelection = (gadget) => {
    setSelectedGadgets((prev) => {
      if (prev.includes(gadget)) {
        return prev.filter((g) => g !== gadget);
      } else {
        return [...prev, gadget];
      }
    });
  };

  // Toggle lighting selection
  const toggleLightingSelection = (lighting) => {
    setSelectedLightings((prev) => {
      if (prev.includes(lighting)) {
        return prev.filter((l) => l !== lighting);
      } else {
        return [...prev, lighting];
      }
    });
  };

  // Delete appliance item
  const handleDeleteConfirmation = (id) => {
    if (applianceItems.length === 1) {
      alert("You must have at least one appliance.");
      return;
    }

    // Find the appliance to be deleted
    const appliance = applianceItems.find((item) => item.id === id);
    if (!appliance) return;

    // Set the appliance to delete and open the modal
    setApplianceToDelete({ id, name: appliance.name });
    openDeleteModal();
  };

  // Confirm delete method
  const confirmDelete = () => {
    if (!applianceToDelete) return;

    // Remove from appliance items
    setApplianceItems(
      applianceItems.filter((item) => item.id !== applianceToDelete.id)
    );

    // Remove from appliance data
    if (applianceToDelete.name) {
      setApplianceData((prevData) => {
        const newData = { ...prevData };
        delete newData[applianceToDelete.name];
        return newData;
      });
    }

    // Close the modal and reset
    closeDeleteModal();
    setApplianceToDelete(null);
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

    const db = getDatabase();

    try {
      const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

      onValue(
        applianceSetsRef,
        (snapshot) => {
          const data = snapshot.val();

          if (data) {
            const keys = Object.keys(data);
            const setKey = keys.find((key) => data[key].name === setName);

            if (setKey) {
              const setRef = ref(
                db,
                "users/" + user + "/applianceSets/" + setKey
              );
              update(setRef, {
                ...setData,
                timestamp: Date.now(),
              }).then(() => {
                onSave(setData);
                onBack();
              });
            } else {
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
    <div className="w-full mt-5 md:mt-10 px-2 sm:px-0">
      <div className="w-full max-w-lg mx-auto p-3 sm:p-5 text-white bg-[#212121] rounded-lg shadow-lg">
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="mr-2 sm:mr-4 text-white hover:text-blue-400">
            <FaArrowLeft size={18} />
          </button>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex-1 truncate">
            {setName}
          </h2>
        </div>

        <p className="mb-4 text-sm sm:text-base text-white/60">
          Add appliances to this set and specify their power usage details.
        </p>

        <div className="flex justify-between mb-2">
          <p className="font-semibold text-sm sm:text-base">Appliances</p>
          <p className="font-semibold text-sm sm:text-base">Edit usage</p>
        </div>

        {applianceItems.map((appliance) => (
          <div key={appliance.id} className="flex flex-col gap-1 mb-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={appliance.name}
                onChange={(e) => updateAppliance(appliance.id, e.target.value)}
                className="flex-1 p-1 sm:p-2 text-sm sm:text-base bg-[#383c3d] border border-gray-600 rounded focus:outline-none"
                placeholder="Appliance name"
              />

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {appliance.completed ? (
                  <FaCheck className="text-green-400" size={16} />
                ) : (
                  <FaTimes className="text-red-400" size={16} />
                )}

                <FaEdit
                  className={`cursor-pointer ${
                    !appliance.name.trim()
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-blue-400"
                  }`}
                  size={16}
                  onClick={() => {
                    if (appliance.name.trim()) {
                      handleEditUsage(appliance);
                    } else {
                      alert(
                        "Please enter an appliance name before editing usage.",
                      );
                    }
                  }}
                />

                <FaTrash
                  className={`cursor-pointer ${
                    applianceItems.length === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-red-500"
                  }`}
                  size={16}
                  onClick={() => {
                    if (applianceItems.length > 1) {
                      handleDeleteConfirmation(appliance.id);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={addApplianceItem}
            className="flex items-center justify-center py-1 sm:py-2 px-2 sm:px-3 text-sm sm:text-base bg-cta-bluegreen !font-semibold text-black hover:bg-cta-bluegreen/80 cursor-pointer rounded transition">
            <FaPlus className="mr-1 sm:mr-2" size={14} /> Add Appliance
          </button>
        </div>

        <div className="mt-4 sm:mt-5 text-white/60">
          <p className="text-sm sm:text-base">
            Use these quick-add buttons to select from pre-defined common
            electronics
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-3">
            <button
              onClick={gadgetsModalHandlers.open}
              className="flex items-center justify-center bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black !font-semibold border-gray-500 px-2 py-1 sm:py-2 text-sm sm:text-base cursor-pointer rounded transition">
              <FaMobile className="mr-1 sm:mr-2 text-black" size={14} />
              Gadgets
            </button>

            <button
              onClick={lightingsModalHandlers.open}
              className="flex items-center justify-center bg-cta-bluegreen hover:bg-cta-bluegreen/80 text-black !font-semibold border-gray-500 px-2 py-1 sm:py-2 text-sm sm:text-base cursor-pointer rounded transition">
              <FaLightbulb className="mr-1 sm:mr-2" size={14} /> Lightings
            </button>
          </div>
          <button
            onClick={handleSaveAll}
            className="bg-[#39e75f] hover:bg-[#39e75f]/80 text-black py-2 px-4 mt-6 sm:mt-10 rounded w-full flex items-center justify-center !font-semibold text-sm sm:text-base cursor-pointer">
            Save Set
          </button>
        </div>
      </div>

      {/* Usage Modal */}
      <Modal
        opened={opened}
        onClose={close}
        styles={{
          header: { backgroundColor: "#13171C", padding: "16px" },
          content: { backgroundColor: "#13171C" },
        }}
        size="md"
        fullScreen={window.innerWidth < 640}>
        <div className="text-white p-1 sm:p-2">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Usage for{" "}
            <span className="text-cta-bluegreen">
              {selectedAppliance ? selectedAppliance.name : "Appliance"}
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
              className="mb-3 w-full"
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
              className="mb-3 w-full"
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

          <div className="bg-white/20 p-3 sm:p-5 rounded mt-3">
            <h4 className="text-sm sm:text-base font-semibold mb-1">
              Don't know your appliance wattage?{" "}
            </h4>
            <p className="text-xs sm:text-sm text-white/60 mb-2">
              <span className="text-cta-bluegreen font-semibold">WattBot</span>{" "}
              will automatically analyze your appliance and get the average
              wattage for your appliance
            </p>
            <button
              onClick={getWattage}
              className="bg-cta-bluegreen text-black px-3 py-1 rounded cursor-pointer text-sm sm:text-base flex items-center justify-center"
              disabled={isLoading}>
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

          <p className="mb-2 mt-4 text-sm sm:text-base">
            Days used per week<span className="text-red-400">*</span>
          </p>
          <Chip.Group multiple value={selectedDays} onChange={setSelectedDays}>
            <div className="flex gap-1 sm:gap-2 flex-wrap mb-3">
              {daysOfWeek.map((day) => (
                <Chip key={day} value={day} size="sm" radius="xl">
                  {day}
                </Chip>
              ))}
            </div>
          </Chip.Group>

          <p className="mb-2 mt-4 text-sm sm:text-base">
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
            className="w-full"
          />

          <button
            className="w-full py-2 bg-green-500 hover:bg-green-600 rounded transition mt-5 sm:mt-6 cursor-pointer text-sm sm:text-base"
            onClick={handleSaveUsage}>
            Save
          </button>
        </div>
      </Modal>
      {/* Gadgets Selection Modal */}
      <Modal
        opened={gadgetsModalOpened}
        onClose={gadgetsModalHandlers.close}
        title="Select Gadgets"
        styles={{
          header: {
            backgroundColor: "#13171C",
            padding: "16px",
            color: "white",
          },
          content: { backgroundColor: "#13171C" },
        }}
        size="md"
        fullScreen={window.innerWidth < 640}>
        <div className="text-white p-2 sm:p-4">
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Select the gadgets you want to add to your appliance list:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {gadgetOptions.map((gadget) => (
              <div key={gadget} className="flex items-center">
                <Checkbox
                  checked={selectedGadgets.includes(gadget)}
                  onChange={() => toggleGadgetSelection(gadget)}
                  label={gadget}
                  size="sm"
                  color="cyan"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 sm:space-x-4 mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={gadgetsModalHandlers.close}
              color="gray"
              size="sm">
              Cancel
            </Button>
            <Button
              variant="filled"
              color="blue"
              onClick={addSelectedGadgets}
              disabled={selectedGadgets.length === 0}
              size="sm">
              Add Selected Gadgets
            </Button>
          </div>
        </div>
      </Modal>
      {/* Lightings Selection Modal */}
      <Modal
        opened={lightingsModalOpened}
        onClose={lightingsModalHandlers.close}
        title="Select Lighting Options"
        styles={{
          header: {
            backgroundColor: "#13171C",
            padding: "16px",
            color: "white",
          },
          content: { backgroundColor: "#13171C" },
        }}
        size="md"
        fullScreen={window.innerWidth < 640}>
        <div className="text-white p-2 sm:p-4">
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Select the lighting options you want to add to your appliance list:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {lightingOptions.map((lighting) => (
              <div key={lighting} className="flex items-center">
                <Checkbox
                  checked={selectedLightings.includes(lighting)}
                  onChange={() => toggleLightingSelection(lighting)}
                  label={lighting}
                  size="sm"
                  color="yellow"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 sm:space-x-4 mt-4 sm:mt-6">
            <Button
              variant="outline"
              onClick={lightingsModalHandlers.close}
              color="gray"
              size="sm">
              Cancel
            </Button>
            <Button
              variant="filled"
              color="yellow"
              onClick={addSelectedLightings}
              disabled={selectedLightings.length === 0}
              size="sm">
              Add Selected Lighting
            </Button>
          </div>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirm Deletion"
        centered
        styles={{
          header: {
            backgroundColor: "#13171C",
            padding: "16px",
            color: "white",
          },
          content: {
            backgroundColor: "#13171C",
          },
        }}
        size="sm">
        <div className="text-white p-2">
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Are you sure you want to delete "
            <span className="text-cta-bluegreen">
              {applianceToDelete?.name || "this appliance"}
            </span>
            "?
          </p>
          <div className="flex justify-end space-x-3 sm:space-x-4">
            <Button
              variant="outline"
              onClick={closeDeleteModal}
              color="gray"
              size="sm">
              Cancel
            </Button>
            <Button
              variant="filled"
              color="red"
              onClick={confirmDelete}
              size="sm">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplianceItems;
