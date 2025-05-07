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
  ReferenceLine,
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
        <div className="bg-gray-800 p-3 border border-gray-600 rounded-md shadow-lg">
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
      <div className="bg-gray-800 text-slate-200 p-6 rounded-lg shadow mt-10">
        <h2 className="text-2xl font-bold mb-4">Electricity Rate Predictions</h2>
        <div className="text-white/60">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 text-slate-200 p-6 rounded-lg shadow mt-10">
        <h2 className="text-2xl font-bold mb-4">Electricity Rate Predictions</h2>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-slate-200 p-6 rounded-lg shadow mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Electricity Rate Predictions</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="displayMode" className="mr-2">
              Display:
            </label>
            <select
              id="displayMode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="bg-gray-700 text-white p-2 rounded border border-gray-600">
              <option value="rate">Rate</option>
              <option value="bill">Bill Estimates</option>
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="yearSelect" className="mr-2">
              Year:
            </label>
            <select
              id="yearSelect"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-700 text-white p-2 rounded border border-gray-600">
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
        <div className="text-center p-10 bg-gray-700 rounded-lg">
          <p className="text-white/60">
            No electricity rate data available for {selectedYear}
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {displayMode === "rate" ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#ccc" tick={{ fill: "#ccc" }} />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  domain={[0, "auto"]}
                  label={{
                    //value: "Rate (₱)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#ccc" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Electricity Rate"
                  stroke="#4fd1c5"
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: "#4fd1c5", stroke: "#fff" }}
                  connectNulls
                />
              </LineChart>
            ) : (
              <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#ccc" tick={{ fill: "#ccc" }} />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  domain={[0, "auto"]}
                  label={{
                    //value: "Bill Amount (₱)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "#ccc" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
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
                  activeDot={{ r: 8, fill: "#4fd1c5", stroke: "#fff" }}
                  connectNulls
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredData.map((data) => (
          <div key={data.id} className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-cta-bluegreen">{`${data.month} ${data.year}`}</h3>
            <div className="mt-2">
              <p className="flex justify-between">
                <span className="text-white/60">Rate:</span>
                <span className="font-medium">₱{data.rate}</span>
              </p>

              {data.billAvg && (
                <>
                  <div className="my-2 border-t border-gray-600 pt-2">
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

              <div className="mt-2 border-t border-gray-600 pt-2">
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
