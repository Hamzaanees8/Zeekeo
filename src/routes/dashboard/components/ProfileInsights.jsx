import React, { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { getInsights } from "../../../services/insights";
import RecentProfileViewCard from "./graph-cards/RecentProfileViewCard";
import ProfileViews from "./graph-cards/ProfileViews";
import InsightsDataTable from "./InsightsDataTable";
import { formatTimeAgo, generateDateRange } from "../../../utils/stats-helper";

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function buildProfileViewsTrend(profiles, dateFrom, dateTo) {
  // 1. Group counts by date
  const count = {};

  // Safety check: ensure profiles is an array
  if (!Array.isArray(profiles)) {
    profiles = [];
  }

  for (const item of profiles) {
    // Use local date instead of UTC to avoid timezone bugs
    const date = new Date(item.viewed_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
    count[key] = (count[key] || 0) + 1;
  }

  const fullRange = generateDateRange(dateFrom, dateTo);

  const viewsTrend = fullRange.map(date => ({
    date,
    views: count[date] || 0,
  }));

  return viewsTrend;
}

export default function ProfileInsights() {
  const { ref, inView } = useInView({
    // Use the ref on the DOM element you want to observe
    triggerOnce: true, // Only trigger the fetch once when it enters the viewport
    threshold: 0.1, // Trigger when 10% of the element is visible
  });
  // Get today's date
  const today = new Date();

  // Get one week back
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const dateFrom = lastWeek.toISOString().split("T")[0];
  const dateTo = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [profileInsights, setProfileInsights] = useState([]);

  useEffect(() => {
    if (!inView) {
      console.log("Component not yet in viewport. Skipping fetch.");
      return; // Skip the fetch if not in view
    }

    setIsLoading(true);

    const fetchProfileInsights = async params => {
      try {
        const cacheKey = "profileInsights";
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();

          // use cache if valid
          if (now - parsed.timestamp < CACHE_TTL) {
            setProfileInsights(Array.isArray(parsed.data) ? parsed.data : []);
            setLastUpdated(parsed.timestamp);
            setIsLoading(false);
            return;
          }
        }

        const insights = await getInsights(params);
        // console.log("insights...", insights);
        const data = Array.isArray(insights?.profileInsights)
          ? insights?.profileInsights
          : [];
        // console.log("data...", data);
        const timestamp = Date.now();

        setProfileInsights(data);
        setLastUpdated(timestamp);
        setIsLoading(false);

        localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp }));
      } catch (err) {
        console.error("Error fetching profile insights:", err);
        setIsLoading(false);
      }
    };

    // Build params for API
    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["profileInsights"],
    };

    fetchProfileInsights(params);
  }, [inView]);

  console.log("profileInsights...", profileInsights);

  const viewsTrend = buildProfileViewsTrend(profileInsights, dateFrom, dateTo);

  const recentProfiles = profileInsights
    .sort((a, b) => b.viewed_at - a.viewed_at)
    .slice(0, 20)
    .map(p => ({
      name: p.name?.trim(),
      headline: p.headline,
      network_distance: p.network_distance,
      profile_url: p.profile_url,
      profile_picture: p.profile_picture,
      viewed_at: new Date(p.viewed_at).toISOString(),
    }));

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
          PROFILE INSIGHTS
        </h2>
      </div>
      {lastUpdated && (
        <div className="flex items-center text-[#7E7E7E]">
          <span className="italic text-[11px] text-gray-500">
            Last updated {relativeLastUpdated}
          </span>
        </div>
      )}

      {/* Graph Cards Section */}
      <div className="grid grid-cols-6  gap-5 mt-6 ">
        {/* Column 1 - Title Distribution */}
        <div className="col-span-6  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <ProfileViews
            views={viewsTrend}
            dateFrom={dateFrom}
            dateTo={dateTo}
            tooltipText="This shows the number of times your profile was viewed over time. It helps you understand how much visibility your outreach and activity are generating."
          />
        </div>
        <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
          <RecentProfileViewCard profiles={recentProfiles} />
        </div>
        <div className="col-span-5  border border-[#7E7E7E] rounded-[8px] shadow-md">
          <InsightsDataTable data={recentProfiles} />
        </div>
      </div>
    </>
  );
}
