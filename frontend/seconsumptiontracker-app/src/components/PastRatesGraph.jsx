import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Area,
} from "recharts";

const HistoricalRatesGraph = () => {
  const [rateData, setRateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [displayMode, setDisplayMode] = useState("rate");
  const [availableYears, setAvailableYears] = useState([]);

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
    // Load the historical rates data
    const loadRatesData = async () => {
      try {
        setLoading(true);

        // Import the pastRates.json data from the assets folder
        const response = await fetch("/src/assets/datas/pastRates.json");
        if (!response.ok) {
          throw new Error("Failed to load historical rates data");
        }

        const data = await response.json();

        // Transform the data for the chart
        const formattedData = data.map((item) => {
          return {
            year: item.Year,
            month: months[item.Month - 1],
            monthIndex: item.Month - 1,
            rate: parseFloat(item["Total Bill"]),
            fullDate: `${item.Year}-${item.Month.toString().padStart(2, "0")}`,
          };
        });

        setRateData(formattedData);

        // Extract unique years and sort them
        const years = [
          ...new Set(formattedData.map((item) => item.year)),
        ].sort();
        setAvailableYears(years);

        // Set initial selected year to the most recent year in the data
        if (years.length > 0) {
          setSelectedYear(years[years.length - 1]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading historical rates data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadRatesData();
  }, []);

  // Filter data by selected year
  const filteredData = rateData
    .filter((item) => item.year === selectedYear)
    .sort((a, b) => a.monthIndex - b.monthIndex);

  // Prepare data for yearly trend chart
  const yearlyAverages = availableYears.map((year) => {
    const yearData = rateData.filter((item) => item.year === year);
    const sum = yearData.reduce((total, item) => total + item.rate, 0);
    const average = yearData.length > 0 ? sum / yearData.length : 0;

    return {
      year,
      averageRate: parseFloat(average.toFixed(4)),
      minRate: parseFloat(
        Math.min(...yearData.map((item) => item.rate)).toFixed(4),
      ),
      maxRate: parseFloat(
        Math.max(...yearData.map((item) => item.rate)).toFixed(4),
      ),
    };
  });

  // Prepare data for chart (include all months even if no data)
  const chartData = months.map((month, index) => {
    const dataPoint = filteredData.find((item) => item.monthIndex === index);
    return {
      month,
      rate: dataPoint ? dataPoint.rate : null,
      fullDate: dataPoint ? dataPoint.fullDate : null,
    };
  });

  // Custom tooltip to display detailed information
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      if (displayMode === "rate") {
        const data = payload[0].payload;
        if (data.rate === null) return null;

        return (
          <div className="bg-[#212121] p-3 border border-gray-600 rounded-md shadow-lg text-sm">
            <p className="font-medium text-cta-bluegreen">{`${data.month} ${selectedYear}`}</p>
            <p className="text-white">{`Rate: ₱${data.rate.toFixed(4)}`}</p>
          </div>
        );
      } else {
        const data = payload[0].payload;

        return (
          <div className="bg-[#212121] p-3 border border-gray-600 rounded-md shadow-lg text-sm">
            <p className="font-medium text-cta-bluegreen">{`Year: ${data.year}`}</p>
            <p className="text-white">{`Average Rate: ₱${data.averageRate}`}</p>
            <p className="text-white">{`Min Rate: ₱${data.minRate}`}</p>
            <p className="text-white">{`Max Rate: ₱${data.maxRate}`}</p>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-[#212121] text-slate-200 p-4 md:p-6 rounded-lg shadow mt-6 md:mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
          Historical Electricity Rates
        </h2>
        <div className="text-white/60">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#212121] text-slate-200 p-4 md:p-6 rounded-lg shadow mt-6 md:mt-10">
        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
          Historical Electricity Rates
        </h2>
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#212121] text-slate-200 p-4 md:p-6 rounded-lg shadow mt-6 md:mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold">
          Historical Electricity Rates
        </h2>
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center w-full xs:w-auto">
            <label
              htmlFor="displayMode"
              className="mr-2 text-sm md:text-base whitespace-nowrap">
              Display:
            </label>
            <select
              id="displayMode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="bg-[#383c3d] text-white p-1 md:p-2 rounded border border-gray-600 text-sm md:text-base flex-grow xs:flex-grow-0">
              <option value="rate">Monthly Rates</option>
              <option value="yearly">Yearly Trends</option>
            </select>
          </div>

          {displayMode === "rate" && (
            <div className="flex items-center w-full xs:w-auto">
              <label
                htmlFor="yearSelect"
                className="mr-2 text-sm md:text-base whitespace-nowrap">
                Year:
              </label>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-[#383c3d] text-white p-1 md:p-2 rounded border border-gray-600 text-sm md:text-base flex-grow xs:flex-grow-0">
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {rateData.length === 0 ? (
        <div className="text-center p-6 md:p-10 bg-gray-700 rounded-lg">
          <p className="text-white/60">
            No historical electricity rate data available
          </p>
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {displayMode === "rate" ? (
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="month"
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  domain={[0, "auto"]}
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(2)}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
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
                data={yearlyAverages}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="year"
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  fontSize={12}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#ccc"
                  tick={{ fill: "#ccc" }}
                  domain={[0, "auto"]}
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(2)}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="minRate"
                  name="Min Rate"
                  fill="#4fd1c5"
                  fillOpacity={0.1}
                  stroke="none"
                  activeDot={false}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="maxRate"
                  name="Max Rate"
                  fill="#4fd1c5"
                  fillOpacity={0.2}
                  stroke="none"
                  activeDot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="averageRate"
                  name="Average Rate"
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

      {displayMode === "rate" && (
        <div className="mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {filteredData.map((data, index) => (
            <div key={index} className="bg-[#383c3d] p-3 md:p-4 rounded-lg">
              <h3 className="text-base md:text-lg font-medium text-cta-bluegreen">{`${data.month} ${data.year}`}</h3>
              <div className="mt-2">
                <p className="flex justify-between text-sm md:text-base">
                  <span className="text-white/60">Rate:</span>
                  <span className="font-medium">₱{data.rate.toFixed(4)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricalRatesGraph;