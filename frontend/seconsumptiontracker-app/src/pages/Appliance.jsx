import React, { useEffect } from "react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Modal } from "@mantine/core";
import { FaEye, FaTrash, FaPencilAlt } from "react-icons/fa";
import ApplianceItems from "../components/ApplianceItemsForProfile"; // Import the component
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
  set,
} from "firebase/database";

const Appliance = () => {
  // Modal state
  const [opened, { open, close }] = useDisclosure(false);
  // Appliance sets list
  const [applianceSets, setApplianceSets] = useState([]);
  // Current appliance set name
  const [applianceName, setApplianceName] = useState("");
  // Track if we're editing or adding new
  const [editIndex, setEditIndex] = useState(null);
  // Error message state
  const [errorMessage, setErrorMessage] = useState("");
  // State to track which set is currently being viewed/edited
  const [currentSet, setCurrentSet] = useState(null);
  // State to store all appliances data within sets
  const [appliancesData, setAppliancesData] = useState({});

  // Fetch data from the relatime database to populate data
  useEffect(() => {
    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!user || !userToken) {
      alert("User not Logged in");
      return;
    }

    // initialize realtime databse
    const db = getDatabase();
    const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

    // Listen changes from realtime databse
    const unSubscribe = onValue(
      applianceSetsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const setArray = Object.values(data).map((set) => set.name);
          setApplianceSets(setArray);

          const appliancesObj = {};
          Object.values(data).forEach((set) => {
            appliancesObj[set.name] = set.appliances;
          });
          setAppliancesData(appliancesObj);
        } else {
          // If no data exists, reset states
          setApplianceSets([]);
          setAppliancesData({});
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      },
    );

    // Cleanup subscription on unmount
    return () => unSubscribe();
  }, []);

  // Handle adding or updating an appliance set
  const handleAddOrUpdate = () => {
    if (!applianceName.trim()) {
      setErrorMessage("Appliance set name cannot be empty");
      return;
    }

    const userToken = localStorage.getItem("idToken");
    const user = localStorage.getItem("uid");

    if (!user || !userToken) {
      alert("User not logged in");
      return;
    }

    const db = getDatabase();

    if (editIndex !== null) {
      // Edit an existing set
      const oldName = applianceSets[editIndex];

      // If the name didn't change, just close the modal
      if (oldName === applianceName) {
        setEditIndex(null);
        setApplianceName("");
        setErrorMessage("");
        close();
        return;
      }

      // Find the key for the set we want to update
      const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

      onValue(
        applianceSetsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const keys = Object.keys(data);
            const setKey = keys.find((key) => data[key].name === oldName);

            if (setKey) {
              // Update the name in the database
              const setRef = ref(
                db,
                "users/" + user + "/applianceSets/" + setKey,
              );

              // Keep all data the same, just update the name
              const updatedData = { ...data[setKey], name: applianceName };

              set(setRef, updatedData)
                .then(() => {
                  console.log("Appliance set renamed successfully");

                  // Update local state
                  const updatedSets = [...applianceSets];
                  updatedSets[editIndex] = applianceName;
                  setApplianceSets(updatedSets);

                  // Update the appliances data with the new name
                  const applianceDataCopy = { ...appliancesData };
                  if (applianceDataCopy[oldName]) {
                    applianceDataCopy[applianceName] =
                      applianceDataCopy[oldName];
                    delete applianceDataCopy[oldName];
                    setAppliancesData(applianceDataCopy);
                  }

                  setEditIndex(null);
                  setApplianceName("");
                  setErrorMessage("");
                  close();
                })
                .catch((error) => {
                  console.error("Error renaming appliance set:", error);
                  setErrorMessage(
                    "Failed to rename appliance set. Please try again.",
                  );
                });
            }
          }
        },
        { onlyOnce: true },
      );
    } else {
      // We're adding a new set
      const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

      // Create a new set entry with timestamp
      const newSet = {
        name: applianceName,
        timestamp: Date.now(),
      };

      // Push the new set to the database
      push(applianceSetsRef, newSet)
        .then(() => {
          console.log("New appliance set added successfully");

          // Update local state
          setApplianceSets([...applianceSets, applianceName]);
          setApplianceName("");
          setErrorMessage("");
          close();
        })
        .catch((error) => {
          console.error("Error adding new appliance set:", error);
          setErrorMessage("Failed to add new appliance set. Please try again.");
        });
    }
  };

  // Open modal for adding new item
  const handleAddNew = () => {
    setApplianceName("");
    setEditIndex(null);
    setErrorMessage("");
    open();
  };

  // Open modal for editing existing item
  const handleEdit = (index) => {
    setApplianceName(applianceSets[index]);
    setEditIndex(index);
    setErrorMessage("");
    open();
  };

  // Delete an appliance set
  const handleDelete = (index) => {
    const setName = applianceSets[index];

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${setName}" and all its appliances?`,
    );

    if (confirmDelete) {
      const user = localStorage.getItem("uid");

      if (!user) {
        alert("User not logged in");
        return;
      }

      // Initialize the database
      const db = getDatabase();
      const applianceSetsRef = ref(db, "users/" + user + "/applianceSets");

      // Get a snapshot of the data to find the key
      onValue(
        applianceSetsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Find the key for the set we want to delete
            const keys = Object.keys(data);
            const setKey = keys.find((key) => data[key].name === setName);

            if (setKey) {
              // Create a reference to the specific set
              const setRef = ref(
                db,
                "users/" + user + "/applianceSets/" + setKey,
              );

              // Remove the set from the database
              remove(setRef)
                .then(() => {
                  console.log("Appliance set deleted successfully");

                  // Update local state
                  const updatedSets = applianceSets.filter(
                    (_, i) => i !== index,
                  );
                  setApplianceSets(updatedSets);

                  // Also remove any stored appliance data for this set
                  setAppliancesData((prev) => {
                    const newData = { ...prev };
                    delete newData[setName];
                    return newData;
                  });
                })
                .catch((error) => {
                  console.error("Error deleting appliance set:", error);
                  alert("Failed to delete appliance set. Please try again.");
                });
            }
          }
        },
        { onlyOnce: true },
      );
    }
  };

  // View appliance items for a specific set
  const handleViewItems = (index) => {
    setCurrentSet({
      id: index,
      name: applianceSets[index],
    });
  };

  // Handle going back to sets list view
  const handleBackToSets = () => {
    setCurrentSet(null);
  };

  // Save appliance items data for a set
  const handleSaveApplianceItems = (setData) => {
    // Store the appliance items data
    setAppliancesData((prev) => ({
      ...prev,
      [setData.name]: setData.appliances,
    }));

    console.log("Saved appliance set data:", setData);
  };

  // Render the appliance items view if a set is selected
  if (currentSet) {
    // Get existing data for the current set if available
    const existingData = appliancesData[currentSet.name] || [];

    return (
      <ApplianceItems
        setId={currentSet.id}
        setName={currentSet.name}
        onBack={handleBackToSets}
        onSave={handleSaveApplianceItems}
        existingData={existingData}
      />
    );
  }

  // Otherwise render the main appliance sets list
  return (
    <>
      <div className="bg-gray-800 text-slate-200 p-6 rounded-lg shadow mt-10">
        <h2 className="text-2xl font-bold mb-4">Appliance</h2>
        <p>Manage your appliances and devices here.</p>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white py-3 px-4 rounded !font-semibold mt-5">
          Set up appliance
        </button>

        {applianceSets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-3">Your Appliance Sets</h3>
            <ol className="list-decimal ml-6">
              {applianceSets.map((set, index) => (
                <li key={index} className="py-2 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <a
                      href="#"
                      className="text-slate-200 font-bold text-2xl p-3"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewItems(index);
                      }}>
                      {set}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleEdit(index);
                        }}
                        className="text-blue-500 font-semibold text-base">
                        &nbsp;&nbsp;&nbsp;(rename)
                      </span>
                    </a>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewItems(index)}
                        className="text-green-500 hover:text-green-700"
                        title="View Details">
                        <FaEye size={25} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(index);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit">
                        <FaPencilAlt size={23} />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete">
                        <FaTrash size={23} />
                      </button>
                    </div>
                  </div>

                  {/* Display appliance count if there are items in this set */}
                  {appliancesData[set] && appliancesData[set].length > 0 && (
                    <div className="ml-4 text-slate-400 text-sm">
                      {appliancesData[set].length} appliance
                      {appliancesData[set].length !== 1 ? "s" : ""}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={close}
        styles={{
          header: { backgroundColor: "#13171C", padding: "16px" },
          content: { backgroundColor: "#13171C" },
        }}>
        <div className="text-white">
          <h4 className="text-xl">
            {editIndex !== null ? "Edit Appliance Set" : "Appliance Set Name"}
          </h4>
          <input
            type="text"
            placeholder="Kitchen Appliances"
            className="flex-1 p-2 !text-xl bg-gray-700 border border-gray-600 rounded focus:outline-none w-full mt-3"
            value={applianceName}
            onChange={(e) => setApplianceName(e.target.value)}
          />
          {errorMessage && (
            <p className="text-red-400 mt-2 text-sm">{errorMessage}</p>
          )}
        </div>
        <button
          className="text-white bg-blue-500 w-full !text-xl py-2 rounded mt-6"
          onClick={handleAddOrUpdate}>
          {editIndex !== null ? "Rename" : "Add"}
        </button>
      </Modal>
    </>
  );
};

export default Appliance;
