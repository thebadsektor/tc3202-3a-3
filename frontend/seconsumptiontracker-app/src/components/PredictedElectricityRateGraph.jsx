import { useState, useEffect } from "react";
import { ref, getDatabase, onValue } from "firebase/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

const ElectricityRateGraph = () => {
  const [billData, setBillData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [displayMode, setDisplayMode] = useState("rate"); // "rate" or "bill"

  // Get available years from the data
  const availableYears = [...new Set(billData.map((item) => item.year))].sort();

  // Define months for x-axis
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    const userToken = localStorage.getItem("idToken");
    const userId = localStorage.getItem("uid");

    if (!userToken || !userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const db = getDatabase();
    const billPredictionsRef = ref(db, `users/${userId}/billPredictions`);

    const unsubscribe = onValue(
      billPredictionsRef,
      (snapshot) => {
        setLoading(true);

        if (snapshot.exists()) {
          const data = snapshot.val();
          // Transform the data for the chart
          const formattedData = Object.entries(data).map(([key, value]) => {
            // Parse YYYY-MM format
            const [year, monthNum] = value.month.split("-");
            const monthIndex = parseInt(monthNum) - 1; // 0-based month index

            // Handle the new estimatedBill structure
            const billEstimate = value.estimatedBill || {};

            return {
              id: key,
              year: parseInt(year),
              month: months[monthIndex],
              monthIndex,
              rate: parseFloat(value.predictedRate),
              billMin: billEstimate.min ? parseFloat(billEstimate.min) : null,
              billAvg: billEstimate.average
                ? parseFloat(billEstimate.average)
                : null,
              billMax: billEstimate.max ? parseFloat(billEstimate.max) : null,
              totalKWh: parseFloat(value.totalKWh),
              fullDate: value.month,
            };
          });

          setBillData(formattedData);
        } else {
          setBillData([]);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bill predictions:", error);
        setError("Failed to load bill predictions");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Filter data by selected year
  const filteredData = billData
    .filter((item) => item.year === selectedYear)
    .sort((a, b) => a.monthIndex - b.monthIndex);

  // Prepare data for chart (include all months even if no data)
  const chartData = months.map((month, index) => {
    const dataPoint = filteredData.find((item) => item.monthIndex === index);
    return {
      month,
      rate: dataPoint ? dataPoint.rate : null,
      billMin: dataPoint ? dataPoint.billMin : null,
      billAvg: dataPoint ? dataPoint.billAvg : null,
      billMax: dataPoint ? dataPoint.billMax : null,
      totalKWh: dataPoint ? dataPoint.totalKWh : null,
      fullDate: dataPoint ? dataPoint.fullDate : null,
    };
  });

  // Custom tooltip to display detailed information
  const CustomTooltip = ({ active, payload }) => {
    if (
      active &&
      payload &&
      payload.length &&
      payload[0].payload[displayMode === "rate" ? "rate" : "billAvg"] !== null
    ) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-md shadow-lg text-sm">
          <p className="font-medium text-cta-bluegreen">{`${data.month} ${selectedYear}`}</p>
          <p className="text-white">{`Rate: ₱${data.rate}`}</p>
          {data.billAvg && (
            <>
              <p className="text-white font-medium">{`Estimated Bill:`}</p>
              <p className="text-white pl-2">{`Avg: ₱${data.billAvg.toFixed(
                2,
              )}`}</p>
              {data.billMin && (
                <p className="text-white pl-2">{`Min: ₱${data.billMin.toFixed(
                  2,
                )}`}</p>
              )}
              {data.billMax && (
                <p className="text-white pl-2">{`Max: ₱${data.billMax.toFixed(
                  2,
                )}`}</p>
              )}
            </>
          )}
          {data.totalKWh && (
            <p className="text-white">{`Total kWh: ${data.totalKWh}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-[#212121] text-slate-200 p-4 sm:p-6 rounded-lg shadow mt-6 sm:mt-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Electricity Rate Predictions
        </h2>
        <div className="text-white/60">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#212121] text-slate-200 p-4 sm:p-6 rounded-lg shadow mt-6 sm:mt-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">
          Electricity Rate Predictions
        </h2>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#212121] text-slate-200 p-4 sm:p-6 rounded-lg shadow mt-6 sm:mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          Electricity Rate Predictions
        </h2>
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center w-full xs:w-auto">
            <label
              htmlFor="displayMode"
              className="mr-2 text-sm sm:text-base whitespace-nowrap">
              Display:
            </label>
            <select
              id="displayMode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="bg-[#383c3d] text-white p-1 sm:p-2 rounded border border-gray-600 text-sm sm:text-base w-full">
              <option value="rate">Rate</option>
              <option value="bill">Bill Estimates</option>
            </select>
          </div>
          <div className="flex items-center w-full xs:w-auto">
            <label
              htmlFor="yearSelect"
              className="mr-2 text-sm sm:text-base whitespace-nowrap">
              Year:
            </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-[#383c3d] text-white p-1 sm:p-2 rounded border border-gray-600 text-sm sm:text-base w-full">
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                // Default to current and previous year if no data
                <>
                  <option value={selectedYear}>{selectedYear}</option>
                  <option value={selectedYear - 1}>{selectedYear - 1}</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {billData.length === 0 ? (
        <div className="text-center p-6 sm:p-10 bg-[#383c3d] rounded-lg">
          <p className="text-white/60">
            No electricity rate data available for {selectedYear}
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {displayMode === "rate" ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="month"
                  stroke="#ccc"
                  tick={{ fill: "#ccc", fontSize: "0.75rem" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc", fontSize: "0.75rem" }}
                  domain={[0, "auto"]}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Electricity Rate"
                  stroke="#4fd1c5"
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: "#4fd1c5", stroke: "#fff" }}
                  connectNulls
                />
              </LineChart>
            ) : (
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="month"
                  stroke="#ccc"
                  tick={{ fill: "#ccc", fontSize: "0.75rem" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc", fontSize: "0.75rem" }}
                  domain={[0, "auto"]}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                <Area
                  type="monotone"
                  dataKey="billMin"
                  name="Min Bill"
                  fill="#4fd1c5"
                  fillOpacity={0.1}
                  stroke="none"
                  activeDot={false}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="billMax"
                  name="Max Bill"
                  fill="#4fd1c5"
                  fillOpacity={0.2}
                  stroke="none"
                  activeDot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="billAvg"
                  name="Average Bill"
                  stroke="#4fd1c5"
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: "#4fd1c5", stroke: "#fff" }}
                  connectNulls
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 sm:mt-6 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {filteredData.map((data) => (
          <div
            key={data.id}
            className="bg-[#383c3d] p-3 sm:p-4 rounded-lg text-sm sm:text-base">
            <h3 className="text-base sm:text-lg font-medium text-cta-bluegreen truncate">{`${data.month} ${data.year}`}</h3>
            <div className="mt-2">
              <p className="flex justify-between">
                <span className="text-white/60">Rate:</span>
                <span className="font-medium">₱{data.rate}</span>
              </p>

              {data.billAvg && (
                <>
                  <div className="my-1 sm:my-2 border-t border-gray-600 pt-1 sm:pt-2">
                    <p className="text-white/80 font-medium">Estimated Bill:</p>
                  </div>
                  <p className="flex justify-between">
                    <span className="text-white/60 pl-2">Average:</span>
                    <span className="font-medium">
                      ₱{parseFloat(data.billAvg).toFixed(2)}
                    </span>
                  </p>
                  {data.billMin && (
                    <p className="flex justify-between">
                      <span className="text-white/60 pl-2">Minimum:</span>
                      <span className="font-medium">
                        ₱{parseFloat(data.billMin).toFixed(2)}
                      </span>
                    </p>
                  )}
                  {data.billMax && (
                    <p className="flex justify-between">
                      <span className="text-white/60 pl-2">Maximum:</span>
                      <span className="font-medium">
                        ₱{parseFloat(data.billMax).toFixed(2)}
                      </span>
                    </p>
                  )}
                </>
              )}

              <div className="mt-1 sm:mt-2 border-t border-gray-600 pt-1 sm:pt-2">
                <p className="flex justify-between">
                  <span className="text-white/60">Total kWh:</span>
                  <span className="font-medium">{data.totalKWh}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectricityRateGraph;