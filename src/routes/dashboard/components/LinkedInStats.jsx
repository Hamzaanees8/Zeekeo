import ResponseSentiment from "./graph-cards/ResponseSentiment";
import InboxMessagesCard from "./graph-cards/InboxMessagesCard";
import CircleCard from "./graph-cards/CircleCard";
import HorizontalBarChartCard from "./graph-cards/HorizontalBarChartCard";
import TopCampaignsListCard from "./graph-cards/TopCampaignsListCard";
import HorizontalBarsFilledCard from "./graph-cards/HorizontalBarsFilledCard";
import PieChartCard from "./graph-cards/PieChartCard";
import TwoLevelCircleCard from "./graph-cards/TwoLevelCircleCard";
import CustomizedDotLineChart from "./graph-cards/CustomizedDotLineChart";
import { generateDateRange } from "../../../utils/stats-helper";

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
        acceptanceMap[campaignId] = { name, invites: 0, accepted: 0 };
      acceptanceMap[campaignId].invites += li.acceptance_rate?.invites || 0;
      acceptanceMap[campaignId].accepted += li.acceptance_rate?.accepted || 0;

      // ----- Aggregate reply rate for top list -----
      if (!replyMap[campaignId])
        replyMap[campaignId] = { name, sent: 0, replies: 0 };
      replyMap[campaignId].sent += li.reply_rate?.sent || 0;
      replyMap[campaignId].replies += li.reply_rate?.replies || 0;

      // ----- Aggregate positive response for top list -----
      const totalSentiments =
        (li.response_senitment?.positive || 0) +
        (li.response_senitment?.neutral || 0) +
        (li.response_senitment?.negative || 0);

      if (!positiveMap[campaignId])
        positiveMap[campaignId] = { name, positive: 0, total: 0 };
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

export default function LinkedInStats({
  messages,
  insights,
  last24Actions,
  selectedCampaigns,
  dateFrom,
  dateTo,
}) {
  console.log("insights..", insights);
  console.log("campaigns..", selectedCampaigns);
  const totals = calculateTotals(insights, selectedCampaigns);

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

  return (
    <div className="grid grid-cols-5 gap-6 mt-6">
      {/* Top Row Cards */}

      {/* Acceptance Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Acceptance Rate"
          fill={totals.accepted}
          total={totals.invites || totals.accepted}
        />
      </div>
      {/* Reply Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Reply Rate"
          fill={totals.replies}
          total={totals.sent || totals.replies}
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
            { label: "InMail", value: totals.inmailsReply, color: "#00B4D8" },
          ]}
          tooltipText="This shows performance split by channel."
        />
      </div>
      {/* Positive Response Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard
          title="Positive Response Rate"
          fill={totals.positive}
          total={totals.responseSentiments}
        />
      </div>
      {/* Response Sentiment */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseSentiment
          data={[
            { label: "positive", value: totals.positive },
            {
              label: "neutral",
              value: totals.neutral,
            },
            { label: "negative", value: totals.negative },
            { label: "meeting_booked", value: totals.meetingBooked },
            { label: "deal_closed", value: totals.dealClosed },
          ]}
          tooltipText="This shows the sentiment breakdown of responses."
        />
      </div>
      <div className="col-span-1 row-span-2   border border-[#7E7E7E] rounded-[8px] shadow-md">
        <InboxMessagesCard messages={messages} />
      </div>

      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Acceptance Campaigns"
          campaigns={totals.topAcceptanceRateCampaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Reply Rate Campaigns"
          campaigns={totals.topReplyRateCampaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Positve Reply Campaigns"
          campaigns={totals.topPositiveResponseCampaigns}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <HorizontalBarsFilledCard
          title="Title Distributions"
          tooltipText="This shows the percentage distribution across titles."
          data={[
            { title: "Founder & CEO", count: 30 },
            { title: "Co-Founder", count: 25 },
            { title: "Others", count: 45 },
          ]}
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
            { label: "InMails", value: last24Actions?.linkedin_inmail?.total || 0, color: "#00B4D8" },
          ]}
          tooltipText="This shows performance split by channel."
        />
      </div>

      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <PieChartCard
          title="Network Distant Distribution"
          data={totals.networkDistance}
          colors={["#28F0E6", "#00B4D8", "#0096C7"]}
        />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TwoLevelCircleCard
          title="Meetings Booked vs Replies"
          outerPercent={totals.replies}
          innerPercent={totals.meetingBooked}
        />
      </div>
      <div className="col-span-5 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CustomizedDotLineChart title="Response Sentiment" data={totals.sentimentCountsDateWise} />
      </div>
      {/*  <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <SSIgraphCard percentList={[30, 35, 10, 10]} />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseSentiment value="1124,596,43,2" />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseRate value="80,60,50" />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <AcceptanceRate accepted={865} total={1238} />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CompanySize percentList={[30, 15, 18, 15, 12, 10]} />
      </div>
      <div className="col-span-2 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <LocationDistribution />
      </div>
      <div className="col-span-1 row-span-2   border border-[#7E7E7E] rounded-[8px] shadow-md">
        <InboxMessagesCard />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <IndustryDistribution percentList={[30, 30, 5, 5, 5, 5, 5, 5, 5, 5]} />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TitleDistribution value="80,70,60,50,30,40,20,10" />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <MessagesSent />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopAcceptanceCampaigns />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <MessagesBarChart />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <RecentProfileViewCard />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md overflow-hidden">
        <InMailAndConnections outerPercent={75} innerPercent={25} />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopAcceptanceCampaigns />
      </div>
      <div className="col-span-4 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ProfileViews />
      </div> */}
    </div>
  );
}
