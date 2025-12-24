import DeliveryRate from "../../../dashboard/components/graph-cards/DeliveryRate";
import ResponseEmailSentiment from "../../../dashboard/components/graph-cards/ResponseEmailSentiment";
import InsightCard from "./InsightCard";
const dashboardData = [
  // Campaign Status
  {
    type: "CampaignStatus",
    title: "Open Rate Campaigns",
    data: [
      { value: "85%", campaign: "UX Connections Campaign" },
      { value: "75%", campaign: "UX Connections Campaign" },
      { value: "80%", campaign: "UX Connections Campaign" },
      { value: "5%", campaign: "UX Connections Campaign" },
      { value: "44%", campaign: "UX Connections Campaign" },
      { value: "11%", campaign: "UX Connections Campaign" },
    ],
  },

  // Monthly Targets
  {
    type: "MonthlyTargets",
    title: "Top Reply Campaigns",
    data: [
      { value: "20%", campaign: "Campaign 2" },
      { value: "100%", campaign: "Campaign 1" },
      { value: "90%", campaign: "Campaign 5" },
      { value: "10%", campaign: "Campaign 4" },
      { value: "95%", campaign: "Campaign 3" },
      { value: "30%", campaign: "Campaign 6" },
    ],
  },

  // User Replies
  {
    type: "UserReplies",
    title: "Top Positive Response Campaigns",
    data: [
      { value: "45", campaign: "Francisco Pereira", type: "Sprint 2025" },
      { value: "50", campaign: "Marcelo Bravo", type: "MANUFATURA" },
      { value: "55", campaign: "Vinicius Gallafrio", type: "Finance" },
      { value: "60", campaign: "Renato Leite", type: "Sprint 2" },
      { value: "65", campaign: "Karolina Yassuda", type: "Sprint 5" },
      { value: "70", campaign: "Vinicius Gallafrio", type: "Sprint 202" },
      { value: "75", campaign: "Karolina Yassuda", type: "Sprint 25" },
    ],
  },
];
export default function EmailStats() {
  return (
    <div>
      <div className="grid grid-cols-6 gap-6 mt-6">
        <div className="col-span-1 row-span-1 ">
          <DeliveryRate
            accepted={865}
            total={1238}
            title="Delivery Rate"
            textcolor="#454545"
            circlecolor="#28f0e6"
            type="agency-dashboard"
          />
        </div>
        <div className="col-span-1 row-span-1 ">
          <DeliveryRate
            accepted={865}
            total={1238}
            title="Open Rate"
            textcolor="#454545"
            circlecolor="#00b4d8"
            type="agency-dashboard"
          />
        </div>
        <div className="col-span-1 row-span-1 ">
          <DeliveryRate
            accepted={865}
            total={1238}
            title="Bounce Rate"
            textcolor="#454545"
            circlecolor="#25c396"
            type="agency-dashboard"
          />
        </div>
        <div className="col-span-1 row-span-1 ">
          <DeliveryRate
            accepted={865}
            total={1238}
            title="Reply Rate"
            textcolor="#454545"
            circlecolor="#28f0e6"
            type="agency-dashboard"
          />
        </div>
        {/* <div className="col-span-2 row-span-1 ">
          <ResponseEmailSentiment
            value="1124,596,243,2"
            type="agency-dashboard"
          />
        </div> */}
      </div>
      <div className="mt-[48px] flex flex-col gap-y-[12px]">
        <p className="text-[28px] font-medium text-[#6D6D6D] font-urbanist">
          Insights
        </p>
        <div className="grid grid-cols-3 gap-4">
          {dashboardData.map((card, index) => (
            <InsightCard
              key={index}
              title={card.title}
              data={card.data}
              text={`This is the stats of ${card.title}.`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
