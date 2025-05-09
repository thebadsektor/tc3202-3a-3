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
      <div className="bg-[#212121] text-slate-200 p-4 md:p-6 rounded-lg shadow mt-6 md:mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
          Dashboard
        </h2>
        <p className="mb-2 text-sm md:text-base">
          Welcome to your dashboard! Here you can view your electricity
          consumption and bill predictions.
        </p>
        <p className="mb-4 text-sm md:text-base">
          Use the Electricity Rate Graph below to track your electricity rates
          and bills change over time.
        </p>

        {loading ? (
          <p className="text-white/60">Loading your dashboard...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-[#383c3d] p-3 md:p-4 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium text-cta-bluegreen">
                  Appliance Sets
                </h3>
                <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                  {applianceSetsCount}
                </p>
              </div>
              <div className="bg-[#383c3d] p-3 md:p-4 rounded-lg text-center">
                <h3 className="text-base md:text-lg font-medium text-cta-bluegreen">
                  Saved Calculations
                </h3>
                <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                  {calculationsCount}
                </p>
              </div>
              <div className="bg-[#383c3d] p-3 md:p-4 rounded-lg text-center sm:col-span-2 md:col-span-1">
                <h3 className="text-base md:text-lg font-medium text-cta-bluegreen">
                  Bill Predictions
                </h3>
                <p className="text-xl md:text-2xl font-bold mt-1 md:mt-2">
                  {predictionsCount}
                </p>
              </div>
            </div>

            {latestPrediction && (
              <div className="bg-[#2c2f30] p-3 md:p-5 rounded-lg mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">
                  Latest Bill Prediction
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  <div className="bg-[#383c3d] p-2 md:p-3 rounded-lg">
                    <p className="text-white/60 text-sm">Month</p>
                    <p className="font-medium text-base md:text-lg truncate">
                      {latestPrediction.month}
                    </p>
                  </div>
                  <div className="bg-[#383c3d] p-2 md:p-3 rounded-lg">
                    <p className="text-white/60 text-sm">Rate</p>
                    <p className="font-medium text-base md:text-lg">
                      ₱{latestPrediction.predictedRate}
                    </p>
                  </div>
                  <div className="bg-[#383c3d] p-2 md:p-3 rounded-lg">
                    <p className="text-white/60 text-sm">Total kWh</p>
                    <p className="font-medium text-base md:text-lg">
                      {latestPrediction.totalKWh}
                    </p>
                  </div>

                  {latestPrediction.estimatedBill && (
                    <div className="bg-[#383c3d] p-2 md:p-3 rounded-lg">
                      <p className="text-white/60 text-sm">
                        Estimated Bill (Avg)
                      </p>
                      <p className="font-medium text-base md:text-lg">
                        ₱
                        {parseFloat(
                          latestPrediction.estimatedBill.average,
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {latestPrediction.estimatedBill && (
                  <div className="mt-3 md:mt-4 bg-[#383c3d] p-2 md:p-3 rounded-lg">
                    <p className="text-white/60 mb-1 md:mb-2 text-sm md:text-base">
                      Bill Range
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="text-white/80 text-sm md:text-base">
                          Min:
                        </span>
                        <span className="font-medium text-green-400 ml-2 text-sm md:text-base">
                          ₱
                          {parseFloat(
                            latestPrediction.estimatedBill.min,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/80 text-sm md:text-base">
                          Average:
                        </span>
                        <span className="font-medium text-blue-400 ml-2 text-sm md:text-base">
                          ₱
                          {parseFloat(
                            latestPrediction.estimatedBill.average,
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/80 text-sm md:text-base">
                          Max:
                        </span>
                        <span className="font-medium text-red-400 ml-2 text-sm md:text-base">
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
