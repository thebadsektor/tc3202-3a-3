import { useState } from "react";
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
import { Modal, NativeSelect, NumberInput, Chip } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function DynamicTextFields() {
  const [fields, setFields] = useState([
    { id: 1, text: "", isEditing: false, completed: false },
  ]);
  const navigate = useNavigate();

  const [applianceData, setApplianceData] = useState({});

  const [value, setValue] = useState("");
  const [weeks, setWeeks] = useState("1 Week");
  const [error, setError] = useState(false);

  // const [hours, setHours] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const daysOfWeek = ["SU", "M", "T", "W", "TH", "F", "S"];
  const [selectedDays, setSelectedDays] = useState([]);

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

  // Add new text field
  const addField = () => {
    setFields([...fields, { id: Date.now(), text: "", isEditing: true }]);
  };

  // Handle text change
  const updateText = (id, value) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, text: value } : f)));
  };

  const deleteField = (id) => {
    if (fields.length === 1) {
      alert("You must have at least one appliance.");
      return;
    }

    // Find the field to be deleted to get its name
    const fieldToDelete = fields.find((f) => f.id === id);
    if (!fieldToDelete) return;

    // Ask for confirmation before deleting
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${
        fieldToDelete.text || "this appliance"
      }"?`
    );

    if (confirmDelete) {
      // Remove from fields array
      setFields(fields.filter((f) => f.id !== id));

      // Also remove the appliance data if it exists
      if (fieldToDelete.text) {
        setApplianceData((prevData) => {
          const newData = { ...prevData };
          delete newData[fieldToDelete.text];
          return newData;
        });
      }

      console.log(`Deleted appliance: ${fieldToDelete.text || "Unnamed"}`);
    }
  };

  // Calculate action with validation
  const calculate = () => {
    // Check if any field is incomplete
    const hasIncompleteFields = fields.some((field) => !field.completed);

    if (hasIncompleteFields) {
      alert(
        "Please complete all appliances before calculating. Look for fields marked with a red X."
      );
      return;
    }

    if (fields.some((field) => !field.completed)) return;

    const electricityRate = 12.1901;

    // Convert object to array of entries with name included
    const applianceResults = Object.entries(applianceData).map(
      ([name, data]) => {
        const { watt, hours, days, weeks, quant } = data;
        const kWh = watt / 1000;

        const weeksNumber = parseInt(weeks.split(" ")[0], 10);

        // Calculate costs considering quantity
        const quantity = parseInt(quant, 10) || 1;
        const costPerHour = kWh * electricityRate * quantity;
        const costPerDay = costPerHour * hours;
        const costPerWeek = costPerDay * days.length;
        const costPerMonth = costPerWeek * weeksNumber;

        return {
          name, // Include the appliance name
          ...data,
          costPerHour,
          costPerDay,
          costPerWeek,
          costPerMonth,
          quantity, // Include quantity in the results
        };
      }
    );

    // Compute total cost
    const totalCost = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerMonth,
      0
    );

    // Compute total cost per day
    const totalCostPerDay = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerDay,
      0
    );

    // Compute total cost per week
    const totalCostPerWeek = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerWeek,
      0
    );

    // Compute total cost per hour
    const totalCostPerHour = applianceResults.reduce(
      (sum, appliance) => sum + appliance.costPerHour,
      0
    );

    console.log("Navigating with data:", {
      appliances: applianceResults,
      totalCost,
      monthlyBill: value,
      totalCostPerHour,
      totalCostPerDay,
      totalCostPerWeek,
    });

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

    // Add console logs to track what's happening
    console.log("Saving appliance data:", {
      name: selectedField.text,
      hours: currentAppliance.hours,
      watt: currentAppliance.watt,
      days: selectedDays,
      weeks: weeks,
      quant: currentAppliance.quant,
    });

    setApplianceData((prev) => ({
      ...prev,
      [selectedField.text]: {
        ...currentAppliance,
        days: selectedDays,
        weeks: weeks.trim(),
      },
    }));

    // Mark the field as completed
    setFields(
      fields.map((f) =>
        f.id === selectedField.id ? { ...f, completed: true } : f
      )
    );

    setSelectedField(null);
    close();
  };

  //Modal, to open the usage pop up
  const [opened, { open, close }] = useDisclosure(false);

  const [isLoading, setIsLoading] = useState(false);

  // Get wattage uising api
  const getWattage = async () => {
    if (!selectedField || !selectedField.text.trim()) {
      alert("Please enter an appliance name first");
      return;
    }

    // Set loading to true at the start
    setIsLoading(true);

    try {
      // Make the API request to your Django backend
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
      // Set loading back to false regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="w-full h-screen flex items-start justify-center mt-[15vh]">
        <div className="max-w-lg mx-auto p-5 text-white rounded-lg shadow-lg">
          <span className="text-white/40 text-[14px] inline-flex items-center gap-1">
            <IoMdHome /> Home / Bill Calculator
          </span>
          <h2 className="text-4xl font-bold mb-3">Bill Calculator</h2>

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
                  value={value.toLocaleString()}
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
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none"
                  placeholder="Appliance name"
                />

                {/* Show check only if completed */}
                {field.completed ? (
                  <FaCheck className="text-green-400 cursor-pointer" />
                ) : (
                  <FaTimes className="text-red-400 cursor-pointer" />
                )}

                {/* Edit button with validation */}
                <FaEdit
                  className={`cursor-pointer ${
                    !field.text.trim()
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-blue-400"
                  }`}
                  // Add this to the FaEdit onClick handler
                  onClick={() => {
                    if (!field.text.trim()) {
                      alert("Please enter an appliance name before editing.");
                      return;
                    }

                    // Set the selected field correctly
                    setSelectedField(field);

                    // Load saved data (or set default values if new)
                    const savedData = applianceData[field.text] || {
                      hours: "",
                      watt: "",
                      days: [],
                      weeks: "1 Week",
                    };

                    // Set selected days from the appliance data
                    setSelectedDays(savedData.days || []);
                    setWeeks(savedData.weeks || "1 Week");

                    setApplianceData((prev) => ({
                      ...prev,
                      [field.text]: savedData,
                    }));

                    open(); // Open the modal
                  }}
                />

                <FaTrash
                  className={`cursor-pointer ${
                    fields.length === 1
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-red-500"
                  }`}
                  onClick={() => {
                    if (fields.length > 1) {
                      deleteField(field.id);
                    }
                  }}
                />
              </div>

              {/* Error message below the input */}
              {field.error && (
                <p className="text-red-500 text-sm">{field.error}</p>
              )}
            </div>
          ))}

          {/* Add New Field Button */}
          <button
            onClick={addField}
            className=" flex items-center justify-center w-auto py-1 px-5 mt-3 bg-blue-500 hover:bg-blue-600 rounded transition"
          >
            <FaPlus className="mr-2" /> Add Appliance
          </button>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className={`w-full mt-12 py-2 rounded transition ${
              fields.some((field) => !field.completed)
                ? "bg-green-800/50 cursor-not-allowed" // Disabled appearance
                : "bg-green-500 hover:bg-green-600" // Enabled appearance
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
          header: { backgroundColor: "#13171C", padding: "16px" }, // Top part
          content: { backgroundColor: "#13171C" }, // Main content area
        }}
      >
        <div className="text-white">
          <h1 className="text-2xl font-semibold">
            Usage for{" "}
            <span className="text-blue-400">
              {selectedField ? selectedField.text : "Appliance"}
            </span>
          </h1>
          <br />

          <div className="flex gap-5">
            <NumberInput
              label="Number of Appliances"
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
          <div className="bg-white/20 p-5 rounded">
            <h4 className="text-base font-semibold mb-1">
              Don't know your appliance wattage?{" "}
            </h4>
            <p className="text-[14px] text-white/60 mb-2">
              <span className="text-blue-400">WattBot</span> will automatically
              analyze your appliance and get the average wattage for your
              appliance
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

          <p>
            Days used per week<span className="text-red-400">*</span>
          </p>
          <Chip.Group
            multiple
            value={selectedDays} // Bind to selectedDays state
            onChange={setSelectedDays} // Directly update state
          >
            <div className="flex gap-2 flex-wrap mb-3">
              {daysOfWeek.map((day) => (
                <Chip key={day} value={day} size="lg" radius="xl">
                  {day}
                </Chip>
              ))}
            </div>
          </Chip.Group>

          <p>
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
    </>
  );
}
