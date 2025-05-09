import { useState, useEffect } from "react";
import { ref, getDatabase, onValue, remove } from "firebase/database";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FaChevronDown, FaChevronUp, FaTrash } from "react-icons/fa";

const History = () => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCalculation, setExpandedCalculation] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [calculationToDelete, setCalculationToDelete] = useState(null);

  // Function to extract number of weeks from string like "4 Weeks/Month"
  const extractWeeks = (weeksString) => {
    const match = weeksString?.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 4;
  };

  // Toggle the expanded state of a calculation
  const toggleCalculation = (index) => {
    if (expandedCalculation === index) {
      setExpandedCalculation(null);
    } else {
      setExpandedCalculation(index);
    }
  };

  // Function to format timestamp
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

  // This function will open the confirmation modal
  const handleDeleteConfirmation = (calculationId, calculation) => {
    // Use the actual calculation name or a fallback
    const calculationName = calculation.name || `Unnamed Calculation`;
    setCalculationToDelete({ id: calculationId, name: calculationName });
    openDeleteModal();
  };

  // Your original delete function - remains exactly the same
  const deleteCalculation = async (calculationId) => {
    const userToken = localStorage.getItem("idToken");
    const userId = localStorage.getItem("uid");
    if (!userToken || !userId) {
      toast.error("User not logged in");
      return;
    }
    try {
      setDeleting(true);
      const db = getDatabase();
      const calculationRef = ref(
        db,
        `users/${userId}/calculations/${calculationId}`
      );
      await remove(calculationRef);
      toast.success("Calculation deleted successfully");
    } catch (error) {
      console.error("Error deleting calculation:", error);
      toast.error("Failed to delete calculation");
    } finally {
      setDeleting(false);
    }
  };

  // New function to handle the confirmation
  const confirmDelete = () => {
    if (!calculationToDelete) return;

    // Call the original delete function
    deleteCalculation(calculationToDelete.id);

    // Close the modal
    closeDeleteModal();
    setCalculationToDelete(null);
  };

  // Function to generate a fallback name if none exists
  const getCalculationDisplayName = (calculation, index, totalCount) => {
    if (calculation.name) {
      return calculation.name;
    }

    // Fallback name if no custom name exists
    if (calculation.appliances && calculation.appliances.length > 0) {
      const mainAppliance = calculation.appliances[0].name;
      const remainingCount = calculation.appliances.length - 1;

      if (remainingCount > 0) {
        return `${mainAppliance} + ${remainingCount} ${
          remainingCount === 1 ? "Appliance" : "Appliances"
        }`;
      }
      return mainAppliance;
    }

    // Last resort: use calculation number
    return `Calculation #${totalCount - index}`;
  };

  useEffect(() => {
    const userToken = localStorage.getItem("idToken");
    const userId = localStorage.getItem("uid");

    if (!userToken || !userId) {
      toast.error("User not logged in", {
        description: "Please login to view your calculation history",
        duration: 5000,
      });
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const calculationsRef = ref(db, `users/${userId}/calculations`);

    // Set up real-time listener for calculations
    const unsubscribe = onValue(
      calculationsRef,
      (snapshot) => {
        setLoading(true);

        if (snapshot.exists()) {
          const data = snapshot.val();

          // Convert object to array and sort by timestamp (newest first)
          const calculationsArray = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              ...value,
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

          setCalculations(calculationsArray);
        } else {
          setCalculations([]);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching calculations:", error);
        toast.error("Failed to load calculations", {
          description: "Please try again later",
          duration: 5000,
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="mt-10">
        <div className="text-white text-xl">
          Loading your calculation history...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Secondary header with your specified styling */}
      <div className="w-full">
        <h1 className="text-left text-cta-bluegreen text-3xl font-semibold mb-3">
          Calculation History
        </h1>
        <p className="text-white/80 mb-5">
          View all your saved calculations below
        </p>

        {calculations.length === 0 ? (
          <div className="bg-[#212121] p-8 rounded-lg">
            <p className="text-white/60">
              No calculation history found. Start by calculating your appliance
              energy consumption.
            </p>
            <button
              onClick={() => navigate("/consumption-calculator")}
              className="bg-cta-bluegreen text-black px-4 py-2 rounded mt-4 hover:bg-cta-bluegreen/70 transition"
            >
              Go to Calculator
            </button>
          </div>
        ) : (
          calculations.map((calculation, index) => (
            <div
              key={calculation.id}
              className="mb-3 bg-[#212121] p-3 px-5 rounded-lg shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {getCalculationDisplayName(
                      calculation,
                      index,
                      calculations.length
                    )}
                  </h2>
                  <p className="text-white/60 text-sm">
                    {formatDate(calculation.timestamp)}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => toggleCalculation(index)}
                    className="text-cta-bluegreen px-3 py-1 rounded transition cursor-pointer"
                  >
                    {expandedCalculation === index ? (
                      <FaChevronUp size={20} />
                    ) : (
                      <FaChevronDown size={20} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteConfirmation(calculation.id, calculation)
                    }
                    disabled={deleting}
                    className="text-red-500 px-3 py-1 rounded transition cursor-pointer disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>

              {expandedCalculation === index && (
                <div className="mt-4 text-white">
                  <h3 className="text-cta-bluegreen font-medium mb-2">
                    Appliances:
                  </h3>
                  <div className="mb-5">
                    {calculation.appliances.map((appliance, appIndex) => (
                      <div
                        key={appIndex}
                        className="mb-4 bg-[#383c3d] p-4 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">
                            <span className="text-cta-bluegreen">
                              {appliance.name}
                            </span>{" "}
                            ({appliance.quantity || 1} unit
                            {appliance.quantity > 1 ? "s" : ""})
                          </div>
                        </div>
                        <div className="mt-4 pl-4 border-l-2 border-cta-bluegreen">
                          <div className="mb-2">
                            <span className="text-gray-400">
                              Specifications:
                            </span>{" "}
                            {appliance.watt}W | &nbsp;{appliance.hours}h/day |
                            &nbsp;
                            {appliance.days?.length} day
                            {appliance.days?.length > 1 ? "s" : ""}/week |
                            &nbsp;
                            {appliance.weeks}/Month
                          </div>
                          <ul className="list-disc pl-8 text-white/70">
                            <li>
                              Total cost per Hour:{" "}
                              <b> ₱{appliance.costPerHour?.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Day:{" "}
                              <b> ₱{appliance.costPerDay?.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Week:{" "}
                              <b> ₱{appliance.costPerWeek?.toFixed(2)}</b>
                            </li>
                            <li>
                              Total cost per Month:{" "}
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
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    <div className="bg-[#586669] p-6 rounded-lg text-center">
                      <p className="text-white">Total cost per hour</p>
                      <p className="text-xl font-bold text-gray-300">
                        ₱{calculation.totalCostPerHour?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#586669] p-6 rounded-lg text-center">
                      <p className="text-white">Total cost per day</p>
                      <p className="text-xl font-bold text-gray-300">
                        ₱{calculation.totalCostPerDay?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#586669] p-6 rounded-lg text-center">
                      <p className="text-white">Total cost per week</p>
                      <p className="text-xl font-bold text-gray-300">
                        ₱{calculation.totalCostPerWeek?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-[#586669] p-6 rounded-lg text-center">
                      <p className="text-white">Total cost per month</p>
                      <p className="text-xl font-bold text-gray-300">
                        ₱{calculation.totalCost?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {calculation.monthlyBill && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                      <p className="text-white/80">
                        Monthly Bill:{" "}
                        <span className="font-bold">
                          ₱{calculation.monthlyBill?.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Toaster />
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        centered
        title="Confirm Deletion"
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
      >
        <div className="text-white p-2">
          <p className="mb-4">
            Are you sure you want to delete "
            <span className="text-cta-bluegreen">
              {calculationToDelete?.name || "this calculation"}"
            </span>
            ?
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={closeDeleteModal} color="gray">
              Cancel
            </Button>
            <Button
              variant="filled"
              color="red"
              onClick={confirmDelete}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default History;
