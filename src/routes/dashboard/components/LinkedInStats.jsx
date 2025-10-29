import ResponseSentiment from "./graph-cards/ResponseSentiment";
import InboxMessagesCard from "./graph-cards/InboxMessagesCard";
import CircleCard from "./graph-cards/CircleCard";
import HorizontalBarChartCard from "./graph-cards/HorizontalBarChartCard";
import TopCampaignsListCard from "./graph-cards/TopCampaignsListCard";
import HorizontalBarsFilledCard from "./graph-cards/HorizontalBarsFilledCard";
import PieChartCard from "./graph-cards/PieChartCard";
import TwoLevelCircleCard from "./graph-cards/TwoLevelCircleCard";
import CustomizedDotLineChart from "./graph-cards/CustomizedDotLineChart";
import {
  generateDateRange,
  mergeICPInsightsByDate,
} from "../../../utils/stats-helper";

const calculateTotals = (insights, selectedCampaigns = []) => {
  const totals = {
    invites: 0,
    accepted: 0,
    inviteMessages: 0,
    messages: 0,
    inmails: 0,
    sent: 0,
    invitesReply: 0,
    messagesReply: 0,
    inmailsReply: 0,
    replies: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    meetingBooked: 0,
    dealClosed: 0,
    responseSentiments: 0,
    networkDistance: { "1st": 0, "2nd": 0, "3rd": 0 },
    messageRepliesCount: 0,

    topAcceptanceRateCampaigns: [],
    topReplyRateCampaigns: [],
    topPositiveResponseCampaigns: [],

    // NEW: daily stats for charting
    sentimentCountsDateWise: [],
  };

  if (!Array.isArray(insights)) return totals;

  const acceptanceMap = {};
  const replyMap = {};
  const positiveMap = {};

  insights.forEach(insight => {
    const date = insight.date || null; // depends on API response
    const daySentimentCounts = {
      date,
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    const campaigns = insight?.campaigns_insights?.campaigns || {};
    Object.entries(campaigns).forEach(([campaignId, c]) => {
      // Filter by selectedCampaigns if provided
      if (selectedCampaigns.length && !selectedCampaigns.includes(campaignId))
        return;

      const li = c.linkedin || {};
      const name = c.name || "Unnamed Campaign";

      // Aggregate totals
      totals.invites += li.acceptance_rate?.invites || 0;
      totals.accepted += li.acceptance_rate?.accepted || 0;
      totals.sent += li.reply_rate?.sent || 0;
      totals.invitesReply += li.response_count?.invites || 0;
      totals.messagesReply += li.response_count?.messages || 0;
      totals.inmailsReply += li.response_count?.inmails || 0;
      totals.replies += li.reply_rate?.replies || 0;
      totals.positive += li.response_senitment?.positive || 0;
      totals.neutral += li.response_senitment?.neutral || 0;
      totals.negative += li.response_senitment?.negative || 0;
      totals.meetingBooked += li.response_senitment?.meeting_booked || 0;
      totals.dealClosed += li.response_senitment?.deal_closed || 0;
      totals.messageRepliesCount +=
        li.meetings_booked_vs_replies?.replies || 0;
      totals.networkDistance["1st"] +=
        li.network_distance_distribution?.["1st"] || 0;
      totals.networkDistance["2nd"] +=
        li.network_distance_distribution?.["2nd"] || 0;
      totals.networkDistance["3rd"] +=
        li.network_distance_distribution?.["3rd"] || 0;

      // ---- Daily Totals ----
      daySentimentCounts.positive += li.response_senitment?.positive || 0;
      daySentimentCounts.neutral += li.response_senitment?.neutral || 0;
      daySentimentCounts.negative += li.response_senitment?.negative || 0;

      // ----- Aggregate acceptance for top list -----
      if (!acceptanceMap[campaignId])
        acceptanceMap[campaignId] = {
          id: campaignId,
          name,
          invites: 0,
          accepted: 0,
        };
      acceptanceMap[campaignId].invites += li.acceptance_rate?.invites || 0;
      acceptanceMap[campaignId].accepted += li.acceptance_rate?.accepted || 0;

      // ----- Aggregate reply rate for top list -----
      if (!replyMap[campaignId])
        replyMap[campaignId] = { id: campaignId, name, sent: 0, replies: 0 };
      replyMap[campaignId].sent += li.reply_rate?.sent || 0;
      replyMap[campaignId].replies += li.reply_rate?.replies || 0;

      // ----- Aggregate positive response for top list -----
      const totalSentiments =
        (li.response_senitment?.positive || 0) +
        (li.response_senitment?.neutral || 0) +
        (li.response_senitment?.negative || 0);

      if (!positiveMap[campaignId])
        positiveMap[campaignId] = {
          id: campaignId,
          name,
          positive: 0,
          total: 0,
        };
      positiveMap[campaignId].positive += li.response_senitment?.positive || 0;
      positiveMap[campaignId].total += totalSentiments;
    });

    // push daily totals
    if (date) totals.sentimentCountsDateWise.push(daySentimentCounts);
  });

  totals.responseSentiments =
    totals.positive + totals.neutral + totals.negative;

  // Convert maps to arrays with percentages
  totals.topAcceptanceRateCampaigns = Object.values(acceptanceMap)
    .filter(c => c.invites > 0)
    .map(c => ({
      id: c.id,
      name: c.name,
      value:
        c.invites > 0
          ? ((c.accepted / c.invites) * 100).toFixed(2) + "%"
          : "0%",
      invites: c.invites,
      accepted: c.accepted,
    }))
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 5);

  totals.topReplyRateCampaigns = Object.values(replyMap)
    .filter(c => c.sent > 0)
    .map(c => ({
      id: c.id,
      name: c.name,
      value: c.sent > 0 ? ((c.replies / c.sent) * 100).toFixed(2) + "%" : "0%",
      sent: c.sent,
      replies: c.replies,
    }))
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 5);

  totals.topPositiveResponseCampaigns = Object.values(positiveMap)
    .filter(c => c.total > 0)
    .map(c => ({
      id: c.id,
      name: c.name,
      value:
        c.total > 0 ? ((c.positive / c.total) * 100).toFixed(0) + "%" : "0%",
      positive: c.positive,
      total: c.total,
    }))
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 5);

  return totals;
};

// Helper function to sum totals for sentiment & replies
function prepareResponseSentimentStats(periodData) {
  console.log("period data..", periodData);

  let responseSentiments = {
    positive: 0,
    neutral: 0,
    negative: 0,
    meetingBooked: 0,
    dealClosed: 0,
    total: 0,
    replies: 0,
  };

  if (periodData) {
    const sentimentKeys = Object.keys(periodData).filter(key =>
      key.startsWith("conversation_sentiment_"),
    );

    sentimentKeys.forEach(key => {
      const value = Math.max(0, periodData[key].total || 0);
      if (key === "conversation_sentiment_positive")
        responseSentiments.positive = value;
      else if (key === "conversation_sentiment_neutral")
        responseSentiments.neutral = value;
      else if (key === "conversation_sentiment_negative")
        responseSentiments.negative = value;
      else if (key === "conversation_sentiment_meeting_booked")
        responseSentiments.meetingBooked = value;
      else if (key === "conversation_sentiment_deal_closed")
        responseSentiments.dealClosed = value;

      responseSentiments.total += value;
    });
    // Add reply total
    responseSentiments.replies = periodData.reply?.total || 0;
  }
  return responseSentiments;
}

function prepareResponseSentimentTrend(periodData, dateFrom, dateTo) {
  if (!periodData) return [];

  const positiveDaily = periodData.conversation_sentiment_positive?.daily || {};
  const neutralDaily = periodData.conversation_sentiment_neutral?.daily || {};
  const negativeDaily = periodData.conversation_sentiment_negative?.daily || {};

  // Generate full range from dateFrom and dateTo
  const fullRange = generateDateRange(dateFrom, dateTo);

  // Build complete datewise data
  const result = fullRange.map(date => ({
    date,
    positive: Math.max(0, positiveDaily[date] || 0),
    neutral: Math.max(0, neutralDaily[date] || 0),
    negative: Math.max(0, negativeDaily[date] || 0),
  }));

  return result;
}


export default function LinkedInStats({
  messages,
  actions,
  insights,
  last24Actions,
  campaigns,
  selectedCampaigns,
  dateFrom,
  dateTo,
}) {
  console.log("actions..", actions);
  console.log("insights..", insights);
  console.log("campaigns..", selectedCampaigns);
  const totals = calculateTotals(insights, selectedCampaigns);
  const responseSentimentStats = prepareResponseSentimentStats(
    actions?.thisPeriod,
  );

  const responseSentimentTrend = prepareResponseSentimentTrend(actions.thisPeriod, dateFrom, dateTo);

  if (dateFrom && dateTo) {
    const dailyMap = {};
    totals.sentimentCountsDateWise.forEach(d => {
      dailyMap[d.date] = d;
    });
    const range = generateDateRange(dateFrom, dateTo);
    totals.sentimentCountsDateWise = range.map(d => {
      return dailyMap[d] || { date: d, positive: 0, neutral: 0, negative: 0 };
    });
  }

  // prepare positive reply title distrubutions
  const mergedInsights = mergeICPInsightsByDate(insights);
  console.log("merged insights", mergedInsights);

  const positiveReplyTitleDistributions = [
    ...(mergedInsights.replies?.title_distributions || []),
    ...(mergedInsights.positive_responses?.title_distributions || []),
  ];

  return (
    <div className="grid grid-cols-5 gap-6 mt-6">
      {/* Top Row Cards */}

      {/* Acceptance Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Acceptance Rate"
          fill={totals.accepted}
          total={totals.invites || totals.accepted}
          tooltipText="This shows the average acceptance rate across all your campaigns. It gives you an overview of how well your invites are performing overall."
        />
      </div>
      {/* Reply Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Reply Rate"
          fill={totals.replies}
          total={totals.sent || totals.replies}
          tooltipText="This shows the percentage of replies compared to the messages you sent. It helps you see how many people are responding to your outreach."
        />
      </div>
      {/* Response Count */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <HorizontalBarChartCard
          title="Response Count"
          data={[
            {
              label: "Invites",
              value: totals.invitesReply,
              color: "#03045E",
            },
            {
              label: "Messages",
              value: totals.messagesReply,
              color: "#0096C7",
            },
            {
              label: "InMail",
              value: totals.inmailsReply,
              color: "#00B4D8",
            },
          ]}
          tooltipText="This shows the number of responses you received, broken down by invites, messages, and InMail. It gives you a clear view of how people are engaging with you."
        />
      </div>
      {/* Positive Response Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Positive Response Rate"
          fill={responseSentimentStats.positive}
          total={responseSentimentStats.total}
          tooltipText="This shows the percentage of replies that were positive compared to all the replies you received. It helps you understand how many of the responses were favorable."
        />
      </div>
      {/* Response Sentiment */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseSentiment
          data={[
            { label: "positive", value: responseSentimentStats.positive },
            {
              label: "neutral",
              value: responseSentimentStats.neutral,
            },
            { label: "negative", value: responseSentimentStats.negative },
            {
              label: "meeting_booked",
              value: responseSentimentStats.meetingBooked,
            },
            { label: "deal_closed", value: responseSentimentStats.dealClosed },
          ]}
          tooltipText="This shows the type of responses you received. It breaks them down into positive replies, neutral replies, negative replies, meetings booked, and closed deals. It helps you see not just how many people replied, but also the quality of those responses."
        />
      </div>
      <div className="col-span-1 row-span-2   border border-[#7E7E7E] rounded-[8px] shadow-md">
        <InboxMessagesCard
          messages={messages}
          tooltipText="This shows your most recent inbox messages. It gives you a quick view of the latest replies so you can stay up to date without leaving the dashboard."
        />
      </div>

      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Acceptance Campaigns"
          data={totals.topAcceptanceRateCampaigns}
          campaignsList={campaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Reply Rate Campaigns"
          data={totals.topReplyRateCampaigns}
          campaignsList={campaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Positve Reply Campaigns"
          data={totals.topPositiveResponseCampaigns}
          campaignsList={campaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <HorizontalBarsFilledCard
          title="Positive reply title distribution"
          tooltipText="This shows the job titles of people who gave positive replies. It helps you understand which roles are most engaged with your outreach."
          data={positiveReplyTitleDistributions}
        />
      </div>

      {/* Response Count */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <HorizontalBarChartCard
          title="Last 24 Hours"
          data={[
            {
              label: "Invites",
              value: last24Actions?.linkedin_invite?.total || 0,
              color: "#03045E",
            },
            {
              label: "Messages",
              value: last24Actions?.linkedin_message?.total || 0,
              color: "#0096C7",
            },
            {
              label: "InMails",
              value: last24Actions?.linkedin_inmail?.total || 0,
              color: "#00B4D8",
            },
          ]}
          tooltipText="This shows your activity in the last 24 hours. It includes the number of invites sent, messages sent, and InMails sent during that time."
        />
      </div>

      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <PieChartCard
          title="Network Distant Distribution"
          data={totals.networkDistance}
          colors={["#28F0E6", "#00B4D8", "#0096C7"]}
          tooltipText="This shows the distribution of your network connections across all created campaigns. It is divided into 1st, 2nd, and 3rd degree connections, so you can see how closely your outreach is connected to your network."
        />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TwoLevelCircleCard
          title="Meetings Booked vs Replies"
          outerData={responseSentimentStats.replies}
          innerData={responseSentimentStats.meetingBooked}
          tooltipText="This shows the percentage of replies that resulted in a booked meeting. It helps you measure how many conversations are turning into actual meetings."
        />
      </div>
      <div className="col-span-5 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CustomizedDotLineChart
          title="Response Sentiment"
          data={responseSentimentTrend}
          tooltipText="This shows how responses are distributed over time by sentiment. It tracks positive, neutral, and negative replies, helping you see trends in how people are reacting to your outreach."
        />
      </div>
    </div>
  );
}
