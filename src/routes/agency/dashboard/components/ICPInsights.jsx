import { useState, useEffect, useMemo } from "react";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
} from "../../../../components/Icons";
import {
  aggregateDistributionList,
  buildIcpInsightsByMetric,
  convertDistributionToPieChartData,
  finalizeDistributionData,
  formatTimeAgo,
  getRawDistributionList,
  limitDistributionsToTopN,
} from "../../../../utils/stats-helper";
import DropdownSingleSelectionFilter from "../../../../components/dashboard/DropdownSingleSelectionFilter";
import LocationDistribution from "../../../dashboard/components/graph-cards/LocationDistribution";
import HorizontalBarsFilledCard from "../../../dashboard/components/graph-cards/HorizontalBarsFilledCard";
import { getInsights } from "../../../../services/agency";
import { useInView } from "react-intersection-observer";
import IndustryDistribution from "../../../dashboard/components/graph-cards/IndustryDistribution";
const CACHE_TTL = 60 * 60 * 1000;
export default function ICPInsights({ selectedUsers }) {
  const { ref, inView } = useInView({
      // Use the ref on the DOM element you want to observe
      triggerOnce: true, // Only trigger the fetch once when it enters the viewport
      threshold: 0.1, // Trigger when 10% of the element is visible
    });
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];

  // real applied dates
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  // temp dates for UI inputs
  const [tempDateFrom, setTempDateFrom] = useState(lastMonthStr);
  const [tempDateTo, setTempDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [icpInsights, setIcpInsights] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
 const [lastUpdated, setLastUpdated] = useState(null);
 
  useEffect(() => {
    if (!inView) {
      console.log("Component not yet in viewport. Skipping fetch.");
      return; // Skip the fetch if not in view
    }

    setIsLoading(true);

    const fetchIcpInsights = async (params) => {
      try {
        const cacheKey = `icpInsights_${dateFrom}_${dateTo}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();

          // use cache if valid
          if (now - parsed.timestamp < CACHE_TTL) {
            setIcpInsights(parsed.data);
            setLastUpdated(parsed.timestamp);
            setIsLoading(false);
            return;
          }
        }

        const insights = await getInsights(params);
        const data = insights?.icpInsights || [];
        //  console.log("icp insights...", data);
        const timestamp = Date.now();

        setIcpInsights(data);
        setLastUpdated(timestamp);
        setIsLoading(false);

        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      } catch (err) {
        console.error("Error fetching icp insights:", err);
        setIsLoading(false);
      }
    };

    // Build params for API
    const params = {
      userIds: selectedUsers,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["icpInsights"],
    };

    fetchIcpInsights(params);
  }, [dateFrom, dateTo, inView]);

  const sortData = data => [...data].sort((a, b) => b.count - a.count);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const toggleFilters = () => setShowFilters(!showFilters);
  const formattedDateRange = `${dateFrom} - ${dateTo}`;

   const mergedInsights = useMemo(
      () => buildIcpInsightsByMetric(icpInsights?.profiles || []),
      [icpInsights],
    );
  
    // Step 2: Pick selected data
    const titlesList = getRawDistributionList(
      mergedInsights,
      "title",
      selectedType,
    );
  
    // console.log("titlesList...", titlesList);
  
    const locationsList = getRawDistributionList(
      mergedInsights,
      "location",
      selectedType,
    );
  
    // console.log("locationsList...", locationsList);
    const industriesList = getRawDistributionList(
      mergedInsights,
      "industry",
      selectedType,
    );
  
    // console.log("industriesList...", industriesList);
  
    const titleaggregatedTitles = aggregateDistributionList(titlesList);
    const locationaggregatedTitles = aggregateDistributionList(locationsList);
    const industryaggregatedTitles = aggregateDistributionList(industriesList);
  
    const titleData = finalizeDistributionData(titleaggregatedTitles, "title");
    const locationData = finalizeDistributionData(
      locationaggregatedTitles,
      "location",
    );
    const industriesData = finalizeDistributionData(
      industryaggregatedTitles,
      "industry",
    );
  
    const industryData = convertDistributionToPieChartData(
      limitDistributionsToTopN(industriesData),
    );
  
    // console.log("merged..", mergedInsights);
    // console.log("locationData stats..", locationData);
  
    const relativeLastUpdated = formatTimeAgo(lastUpdated);
  
    // Loading / Empty State
    if (isLoading) {
      return (
        <div className="col-span-5 row-span-1 h-48 flex items-center justify-center shadow-md">
          <div className="text-[16px] text-[#1E1D1D]">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 inline"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading... Please wait.
          </div>
        </div>
      );
    }
  return (
    <>
      <div
        ref={ref}
        className="flex flex-wrap items-center justify-between mt-12"
      >
        <h2 className="text-[28px] font-urbanist text-grey-medium font-medium ">
          ICP INSIGHTS
        </h2>
        {/* Filter Controls */}
        <div className="flex  gap-3 mt-4 sm:mt-0 relative">
          {/* Date Range Display */}
          <div className="relative">
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] justify-between items-center rounded-[4px] border border-grey  px-3 py-2 bg-white"
            >
              <CalenderIcon className="w-4 h-4 mr-2" />
              <span className="text-grey-light text-[12px]">
                {formattedDateRange}
              </span>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-300 shadow-md p-4 z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">From:</label>
                  <input
                    type="date"
                    value={tempDateFrom}
                    onChange={(e) => setTempDateFrom(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={tempDateTo}
                    onChange={(e) => setTempDateTo(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => {
                      setDateFrom(tempDateFrom);
                      setDateTo(tempDateTo);
                      setShowDatePicker(false);
                    }}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <DropdownSingleSelectionFilter
            selectedValue={selectedType}
            options={[
              { name: "Acceptance", value: "acceptance" },
              { name: "Replies", value: "replies" },
              { name: "Positive Responses", value: "positive_responses" },
            ]}
            setSelected={setSelectedType}
          />

          {/* Download Button */}
          {/*  <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
            <DownloadIcon className="w-4 h-4" />
          </button>
 */}
          {/* Filter Button */}
          {/* <div className="relative">
            <button
              onClick={toggleFilters}
              className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white"
            >
              <FilterIcon className="w-4 h-4" />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
                <p className="text-sm text-gray-700 mb-2">
                  Filters coming soon...
                </p>
              </div>
            )}
          </div> */}
        </div>
      </div>

      {/* Graph Cards Section */}
      <div className="grid grid-cols-[1fr_1fr_2fr] gap-6 mt-6">
        {/* Column 1 - Title Distribution */}
        <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
          <HorizontalBarsFilledCard
            title="Title Distributions"
            tooltipText="This shows the job title distribution from campaign data. It helps highlight which roles are most common within the target audience."
            data={titleData}
            lastUpdated={relativeLastUpdated}
          />
        </div>

        {/* Column 2 - Stacked (Company Size + Industry) */}
        <div className="flex  gap-6">
          {/* <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
            <PieChartCard
              title="Company Size Distribution"
              data={[]}
              tooltipText="This shows the distribution of company sizes from campaign data. It helps highlight whether outreach is reaching small, medium, or large companies."
            />
          </div> */}
          <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
            <IndustryDistribution
              title="Industry Distribution"
              data={industryData}
              tooltipText="This shows the distribution of industries from campaign data. It helps highlight which industries are most common within the target audience."
              lastUpdated={relativeLastUpdated}
            />
          </div>
        </div>

        {/* Column 3 - Location (50% width) */}
        <div className="border border-[#7E7E7E] rounded-[8px] shadow-md">
          <LocationDistribution
            data={locationData}
            lastUpdated={relativeLastUpdated}
          />
        </div>
      </div>
    </>
  );
}
