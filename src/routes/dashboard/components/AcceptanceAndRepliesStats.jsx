import { useEffect, useState } from "react";
import { getInsights } from "../../../services/insights";
import CircleCard from "./graph-cards/CircleCard";
import HorizontalBarChartCard from "./graph-cards/HorizontalBarChartCard";
import ResponseSentiment from "./graph-cards/ResponseSentiment";

const CACHE_TTL = 0 * 60 * 1000; // no cache

const AcceptanceAndRepliesStats = ({
  dateFrom,
  dateTo,
  selectedCampaigns,
}) => {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Generate a cache key unique to the request parameters
  const getCacheKey = params => {
    return `acceptanceAndReplies_${params.fromDate}_${params.toDate}_${
      params.campaignIds || "all"
    }`;
  };

  useEffect(() => {
    const fetchAcceptanceAndRepliesStats = async params => {
      try {
        const cacheKey = getCacheKey(params);
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          const now = Date.now();

          // If cached data is recent enough, use it
          if (now - parsedCache.timestamp < CACHE_TTL) {
            setStats(parsedCache.data);
            setLastUpdated(parsedCache.timestamp);
            setIsLoading(false);
            return;
          }
        }

        // Otherwise, fetch fresh data
        const insights = await getInsights(params);
        const data = insights?.acceptancesAndReplies || {};
        const timestamp = Date.now();

        setStats(data);
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
      types: ["acceptancesAndReplies"],
    };

    if (selectedCampaigns.length > 0) {
      params.campaignIds = selectedCampaigns.join(",");
    }

    setIsLoading(true);
    fetchAcceptanceAndRepliesStats(params);
  }, [dateFrom, dateTo, selectedCampaigns]);

  if (isLoading || !stats || Object.keys(stats).length === 0) {
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
          Loading Stats... Please wait.
        </div>
      </div>
    );
  }

  // --- Stats processing ---
  const invites = stats.linkedin_invite || 0;
  const accepted = stats.linkedin_invite_accepted || 0;
  const inviteMessages = stats.linkedin_invite_with_message || 0;
  const messages = stats.linkedin_message || 0;
  const inmails = stats.linkedin_inmail || 0;
  const sent = inviteMessages + messages + inmails;

  const invitesReply = stats.linkedin_invite_reply || 0;
  const messagesReply = stats.linkedin_message_reply || 0;
  const inmailsReply = stats.linkedin_inmail_reply || 0;
  const replies = invitesReply + messagesReply + inmailsReply;

  const positive = stats.conversation_sentiment_positive || 0;
  const neutral = stats.conversation_sentiment_neutral || 0;
  const negative = stats.conversation_sentiment_negative || 0;
  const meetingBooked = stats.conversation_sentiment_meeting_booked || 0;
  const dealClosed = stats.conversation_sentiment_deal_closed || 0;
  const totalResponses =
    positive + neutral + negative + meetingBooked + dealClosed;

  // --- Format timestamp for display ---
  const formattedTimestamp =
    lastUpdated &&
    new Date(lastUpdated).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <>
      {/* Acceptance Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Acceptance Rate"
          fill={accepted}
          total={invites || accepted}
          tooltipText="This shows the average acceptance rate across all your campaigns."
        />
      </div>

      {/* Reply Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Reply Rate"
          fill={replies}
          total={sent || replies}
          tooltipText="This shows the percentage of replies compared to messages sent."
        />
      </div>

      {/* Response Count */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <HorizontalBarChartCard
          title="Response Count"
          data={[
            { label: "Invites", value: invitesReply, color: "#03045E" },
            { label: "Messages", value: messagesReply, color: "#0096C7" },
            { label: "InMail", value: inmailsReply, color: "#00B4D8" },
          ]}
        />
      </div>

      {/* Positive Response Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Positive Response Rate"
          fill={positive}
          total={totalResponses}
          tooltipText="This shows the percentage of positive replies among all responses."
        />
      </div>

      {/* Response Sentiment */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseSentiment
          data={[
            { label: "positive", value: positive },
            { label: "neutral", value: neutral },
            { label: "negative", value: negative },
            { label: "meeting_booked", value: meetingBooked },
            { label: "deal_closed", value: dealClosed },
          ]}
        />
      </div>
    </>
  );
};

export default AcceptanceAndRepliesStats;
