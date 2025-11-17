import { useEffect, useState } from "react";
import { getInsights } from "../../../services/insights";
import TopCampaignsListCard from "./graph-cards/TopCampaignsListCard";
import { formatTimeAgo } from "../../../utils/stats-helper";

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const TopCampaignsStats = ({
  dateFrom,
  dateTo,
  selectedCampaigns,
  campaignsList,
}) => {
  const [topCampaignStats, setTopCampaignStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Helper to build a cache key that’s unique per date range & campaign selection
  const getCacheKey = params => {
    return `topCampaignsStats_${params.fromDate}_${params.toDate}_${
      params.campaignIds || "all"
    }`;
  };

  useEffect(() => {
    const fetchTopCampaignsStats = async params => {
      try {
        const cacheKey = getCacheKey(params);
        const cachedData = localStorage.getItem(cacheKey);
        console.log("cachedData:", cachedData);

        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          const now = Date.now();

          // If cached data is recent enough, use it
          if (now - parsedCache.timestamp < CACHE_TTL) {
            setTopCampaignStats(parsedCache.data);
            setLastUpdated(parsedCache.timestamp);
            setIsLoading(false);
            return;
          }
        }

        // Otherwise, fetch fresh data
        const insights = await getInsights(params);
        const data = insights?.topCampaigns || [];
        const timestamp = Date.now();

        setTopCampaignStats(data);
        setLastUpdated(timestamp);
        setIsLoading(false);

        // Cache it with timestamp
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data,
            timestamp,
          }),
        );
      } catch (err) {
        console.error("Error fetching top campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const params = {
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["topCampaigns"],
    };

    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }
    setIsLoading(true);

    fetchTopCampaignsStats(params);
  }, [dateFrom, dateTo, selectedCampaigns]);

  console.log("campaignStats:", topCampaignStats);
  // Derived Metrics
  const computedCampaigns = topCampaignStats.map(c => {
    const s = c.stats || {};

    const invites = s.linkedin_invite || 0;
    const accepted = s.linkedin_invite_accepted || 0;
    const sent =
      (s.linkedin_invite_with_message || 0) +
      (s.linkedin_message || 0) +
      (s.linkedin_inmail || 0);
    const replies =
      (s.linkedin_invite_reply || 0) +
      (s.linkedin_message_reply || 0) +
      (s.linkedin_inmail_reply || 0);
    const totalResponses =
      (s.conversation_sentiment_positive || 0) +
      (s.conversation_sentiment_neutral || 0) +
      (s.conversation_sentiment_negative || 0) +
      (s.conversation_sentiment_meeting_booked || 0) +
      (s.conversation_sentiment_deal_closed || 0);

    return {
      id: c.campaign_id,
      name: c.campaign_name,
      acceptanceRate: invites > 0 ? (accepted / invites) * 100 : 0,
      replyRate: sent > 0 ? (replies / sent) * 100 : 0,
      positiveRate:
        totalResponses > 0
          ? ((s.conversation_sentiment_positive || 0) / totalResponses) * 100
          : 0,
      accepted,
      replies,
      totalResponses,
    };
  });

  // Sorting
  // Helper to format percentages cleanly
  const formatRate = rate => {
    if (isNaN(rate) || rate <= 0) return "0%";
    const formatted =
      rate % 1 === 0
        ? rate.toFixed(0) // full number
        : rate % 0.1 === 0
        ? rate.toFixed(1) // one decimal
        : rate.toFixed(2); // otherwise two decimals
    return `${formatted}%`;
  };

  console.log("computedCampaigns:", computedCampaigns);

  // Compute and filter Top Campaigns
  const topAcceptanceRateCampaigns = [...computedCampaigns]
    .filter(c => c.acceptanceRate > 0)
    .sort(
      (a, b) => parseFloat(b.acceptanceRate) - parseFloat(a.acceptanceRate),
    )
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      name: c.name,
      value: formatRate(c.acceptanceRate),
    }));

  const topReplyRateCampaigns = [...computedCampaigns]
    .filter(c => c.replyRate > 0)
    .sort((a, b) => parseFloat(b.replyRate) - parseFloat(a.replyRate))
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      name: c.name,
      value: formatRate(c.replyRate),
    }));

  const topPositiveResponseCampaigns = [...computedCampaigns]
    .filter(c => c.positiveRate > 0)
    .sort((a, b) => parseFloat(b.positiveRate) - parseFloat(a.positiveRate))
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      name: c.name,
      value: formatRate(c.positiveRate),
    }));

  console.log("topAcceptanceRateCampaigns:", topAcceptanceRateCampaigns);
  console.log("topReplyRateCampaigns:", topReplyRateCampaigns);
  console.log("topPositiveResponseCampaigns:", topPositiveResponseCampaigns);

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
          Loading Top Campaigns... Please wait.
        </div>
      </div>
    );
  }

  if (!topCampaignStats.length) {
    return (
      <div className="col-span-3 row-span-1 h-64 flex items-center justify-center shadow-md text-gray-600">
        No campaign data available for this date range.
      </div>
    );
  }

  const relativeLastUpdated = formatTimeAgo(lastUpdated);

  return (
    <>
      {/* Top Acceptance Campaigns */}
      <div className="col-span-1 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TopCampaignsListCard
          title="Top Acceptance Campaigns"
          data={topAcceptanceRateCampaigns}
          viewAllLink="/campaigns"
          tooltipText="Shows the campaigns with the highest acceptance rate based on invites sent vs accepted."
          lastUpdated={relativeLastUpdated}
          campaignsList={campaignsList}
        />
      </div>

      {/* Top Reply Rate Campaigns */}
      <div className="col-span-1 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TopCampaignsListCard
          title="Top Reply Rate Campaigns"
          data={topReplyRateCampaigns}
          viewAllLink="/campaigns"
          tooltipText="Shows the campaigns with the highest reply rate based on messages sent vs replies received."
          lastUpdated={relativeLastUpdated}
          campaignsList={campaignsList}
        />
      </div>

      {/* Top Positive Response Campaigns */}
      <div className="col-span-1 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TopCampaignsListCard
          title="Top Positive Reply Campaigns"
          data={topPositiveResponseCampaigns}
          viewAllLink="/campaigns"
          tooltipText="Shows campaigns where the highest percentage of replies were positive in sentiment."
          lastUpdated={relativeLastUpdated}
          campaignsList={campaignsList}
        />
      </div>
    </>
  );
};

export default TopCampaignsStats;
