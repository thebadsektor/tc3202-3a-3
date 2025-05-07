import { useState, useEffect } from "react";
import { ref, getDatabase, onValue } from "firebase/database";
import ElectricityRateGraph from "../components/PredictedElectricityRateGraph";
import PastRatesGraph from "../components/PastRatesGraph";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userToken = localStorage.getItem("idToken");
    const userId = localStorage.getItem("uid");

    if (!userToken || !userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const userRef = ref(db, `users/${userId}`);

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        setLoading(true);

        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
        } else {
          setUserData(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Count appliance sets
  const applianceSetsCount = userData?.applianceSets
    ? Object.keys(userData.applianceSets).length
    : 0;

  // Count saved calculations
  const calculationsCount = userData?.calculations
    ? Object.keys(userData.calculations).length
    : 0;

  // Count bill predictions
  const predictionsCount = userData?.billPredictions
    ? Object.keys(userData.billPredictions).length
    : 0;

  // Get the latest prediction if available
  const getLatestPrediction = () => {
    if (!userData?.billPredictions) return null;

    const predictions = Object.values(userData.billPredictions);
    if (predictions.length === 0) return null;

    // Sort by timestamp in descending order
    return predictions.sort((a, b) => b.timestamp - a.timestamp)[0];
  };

  const latestPrediction = getLatestPrediction();

  return (
    <>
      <div className="bg-gray-800 text-slate-200 p-6 rounded-lg shadow mt-10">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
        <p className="mb-2">
          Welcome to your dashboard! Here you can view your electricity
          consumption and bill predictions.
        </p>
        <p className="mb-4">
          Use the Electricity Rate Graph below to track your electricity
          rates and bills change over time.
        </p>

        {loading ? (
          <p className="text-white/60">Loading your dashboard...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-blue-400">
                  Appliance Sets
                </h3>
                <p className="text-2xl font-bold mt-2">{applianceSetsCount}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-green-400">
                  Saved Calculations
                </h3>
                <p className="text-2xl font-bold mt-2">{calculationsCount}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <h3 className="text-lg font-medium text-cta-bluegreen">
                  Bill Predictions
                </h3>
                <p className="text-2xl font-bold mt-2">{predictionsCount}</p>
              </div>
            </div>

            {latestPrediction && (
              <div className="bg-gray-700 p-5 rounded-lg mb-6">
                <h3 className="text-xl font-medium text-cta-bluegreen mb-3">
                  Latest Bill Prediction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-white/60">Month</p>
                    <p className="font-medium text-lg">
                      {latestPrediction.month}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-white/60">Rate</p>
                    <p className="font-medium text-lg">
                      ₱{latestPrediction.predictedRate}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-white/60">Total kWh</p>
                    <p className="font-medium text-lg">
                      {latestPrediction.totalKWh}
                    </p>
                  </div>

                  {latestPrediction.estimatedBill && (
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-white/60">Estimated Bill (Avg)</p>
                      <p className="font-medium text-lg">
                        ₱
                        {parseFloat(
                          latestPrediction.estimatedBill.average,
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {latestPrediction.estimatedBill && (
                  <div className="mt-4 bg-gray-800 p-3 rounded-lg">
                    <p className="text-white/60 mb-2">Bill Range</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white/80">Min:</span>
                        <span className="font-medium text-green-400 ml-2">
                          ₱
                          {parseFloat(
                            latestPrediction.estimatedBill.min,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/80">Average:</span>
                        <span className="font-medium text-blue-400 ml-2">
                          ₱
                          {parseFloat(
                            latestPrediction.estimatedBill.average,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/80">Max:</span>
                        <span className="font-medium text-red-400 ml-2">
                          ₱
                          {parseFloat(
                            latestPrediction.estimatedBill.max,
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Include the Past Rates Graph component */}
      <PastRatesGraph />
      {/* Include the Electricity Rate Graph component */}
      <ElectricityRateGraph />
    </>
  );
};

export default Dashboard;