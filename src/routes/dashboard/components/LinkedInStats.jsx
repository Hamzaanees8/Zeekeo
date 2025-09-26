import ConnectionsAcceptedCard from "./graph-cards/ConnectionsAcceptedCard";
import SSIgraphCard from "./graph-cards/SSIgraphCard";
import ResponseSentiment from "./graph-cards/ResponseSentiment";
import ResponseRate from "./graph-cards/ResponseRate";
import AcceptanceRate from "./graph-cards/AcceptanceRate";
import CompanySize from "./graph-cards/CompanySize";
import LocationDistribution from "./graph-cards/LocationDistribution";
import InboxMessagesCard from "./graph-cards/InboxMessagesCard";
import IndustryDistribution from "./graph-cards/IndustryDistribution";
import TitleDistribution from "./graph-cards/TitleDistribution";
import MessagesSent from "./graph-cards/MessagesSent";
import TopAcceptanceCampaigns from "./graph-cards/TopAcceptanceCampaigns";
import MessagesBarChart from "./graph-cards/MessagesBarChart";
import RecentProfileViewCard from "./graph-cards/RecentProfileViewCard";
import InMailAndConnections from "./graph-cards/InMailAndConnections";
import ProfileViews from "./graph-cards/ProfileViews";
import CircleCard from "./graph-cards/CircleCard";
import HorizontalBarChartCard from "./graph-cards/HorizontalBarChartCard";
import TopCampaignsListCard from "./graph-cards/TopCampaignsListCard";
import HorizontalBarsFilledCard from "./graph-cards/HorizontalBarsFilledCard";
import PieChartCard from "./graph-cards/PieChartCard";
import TwoLevelCircleCard from "./graph-cards/TwoLevelCircleCard";

export default function LinkedInStats() {
  return (
    <div className="grid grid-cols-5 gap-6 mt-6">
      {/* Top Row Cards */}

      {/* Acceptance Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard title="Acceptance Rate" fill={25} total={75} />
      </div>
      {/* Reply Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard title="Reply Rate" fill={12} total={75} />
      </div>
      {/* Response Count */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <HorizontalBarChartCard
          title="Response Count"
          data={[
            { label: "Reply Rate", value: 75, color: "#03045E" },
            { label: "Sequences", value: 45, color: "#0096C7" },
            { label: "InMail", value: 55, color: "#00B4D8" },
          ]}
          tooltipText="This shows performance split by channel."
        />
      </div>
      {/* Positive Response Rate */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <CircleCard title="Positive Response Rate" fill={16} total={75} />
      </div>
      {/* Response Sentiment */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseSentiment
          data={[
            { label: "positive", value: 1124 },
            {
              label: "neutral",
              value: 596,
            },
            { label: "negative", value: 150 },
            { label: "meeting_booked", value: 20 },
            { label: "deal_closed", value: 10 },
          ]}
          tooltipText="This shows the sentiment breakdown of responses."
        />
      </div>
      <div className="col-span-1 row-span-2   border border-[#7E7E7E] rounded-[8px] shadow-md">
        <InboxMessagesCard />
      </div>

      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Acceptance Campaigns"
          campaigns={[
            {
              id: 1,
              name: "UX Connections Campaign",
              percent: "85%",
              tooltip: "Highest engagement rate this month",
            },
            {
              id: 2,
              name: "Custom Campaign",
              percent: "75%",
              tooltip: "Custom audience targeting",
            },
            { id: 3, name: "Campaign 1", percent: "65%" },
            { id: 4, name: "Campaign 2", percent: "55%" },
            {
              id: 5,
              name: "Campaign 3",
              percent: "45%",
              tooltip: "Low engagement",
            },
          ]}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Reply Rate Campaigns"
          campaigns={[
            {
              id: 1,
              name: "UX Connections Campaign",
              percent: "85%",
              tooltip: "Highest engagement rate this month",
            },
            {
              id: 2,
              name: "Custom Campaign",
              percent: "75%",
              tooltip: "Custom audience targeting",
            },
            { id: 3, name: "Campaign 1", percent: "65%" },
            { id: 4, name: "Campaign 2", percent: "55%" },
            {
              id: 5,
              name: "Campaign 3",
              percent: "45%",
              tooltip: "Low engagement",
            },
          ]}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <TopCampaignsListCard
          title="Top Positve Reply Campaigns"
          campaigns={[
            {
              id: 1,
              name: "UX Connections Campaign",
              percent: "85%",
              tooltip: "Highest engagement rate this month",
            },
            {
              id: 2,
              name: "Custom Campaign",
              percent: "75%",
              tooltip: "Custom audience targeting",
            },
            { id: 3, name: "Campaign 1", percent: "65%" },
            { id: 4, name: "Campaign 2", percent: "55%" },
            {
              id: 5,
              name: "Campaign 3",
              percent: "45%",
              tooltip: "Low engagement",
            },
          ]}
          viewAllLink="/campaigns"
          tooltipText=""
        />
      </div>
      <div className="col-span-1 row-span-2  border border-[#7E7E7E] rounded-[8px] shadow-md ">
        <HorizontalBarsFilledCard
          title="Title Distributions"
          tooltipText="This shows the percentage distribution across titles."
          data={[
            { label: "Founder & CEO", value: 30, color: "#04479C" },
            { label: "Co-Founder", value: 25 },
            { label: "Others", value: 45 },
          ]}
        />
      </div>

      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <PieChartCard
          title="Network Distant Distribution"
          percentList={[30, 15, 18, 15, 12, 10]}
        />
      </div>
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <TwoLevelCircleCard
          title="Meetings Booked vs Replies"
          outerPercent={75}
          innerPercent={25}
        />
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
