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

export default function LinkedInStats() {
  return (
    <div className="grid grid-cols-5 gap-6 mt-6">
      {/* Top Row Cards */}
      <div className="col-span-1 row-span-1 ">
        <ConnectionsAcceptedCard outerPercent={75} innerPercent={25} />
      </div>
      <div className="col-span-1 row-span-1 ">
        <SSIgraphCard percentList={[30, 35, 10, 10]} />
      </div>
      <div className="col-span-1 row-span-1 ">
        <ResponseSentiment value="1124,596,43,2" />
      </div>
      <div className="col-span-1 row-span-1 ">
        <ResponseRate value="80,60,50" />
      </div>
      <div className="col-span-1 row-span-1 ">
        <AcceptanceRate accepted={865} total={1238} />
      </div>
      <div className="col-span-2 row-span-1 ">
        <CompanySize percentList={[30, 15, 18, 15, 12, 10]} />
      </div>
      <div className="col-span-2 row-span-2 ">
        <LocationDistribution />
      </div>
      <div className="col-span-1 row-span-2   ">
        <InboxMessagesCard />
      </div>
      <div className="col-span-2 row-span-1 ">
        <IndustryDistribution percentList={[30, 30, 5, 5, 5, 5, 5, 5, 5, 5]} />
      </div>
      <div className="col-span-1 row-span-2   ">
        <TitleDistribution value="80,70,60,50,30,40,20,10" />
      </div>
      <div className="col-span-1 row-span-1 ">
        <MessagesSent />
      </div>
      <div className="col-span-1 row-span-2   ">
        <TopAcceptanceCampaigns />
      </div>
      <div className="col-span-2 row-span-1 ">
        <MessagesBarChart />
      </div>
      <div className="col-span-1 row-span-1 ">
        <RecentProfileViewCard />
      </div>
      <div className="col-span-1 row-span-1 ">
        <InMailAndConnections outerPercent={75} innerPercent={25} />
      </div>
      <div className="col-span-1 row-span-2   ">
        <TopAcceptanceCampaigns />
      </div>
      <div className="col-span-4 row-span-1 ">
        <ProfileViews />
      </div>
    </div>
  );
}
