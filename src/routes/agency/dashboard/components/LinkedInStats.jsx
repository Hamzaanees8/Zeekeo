import InsightCard from "./InsightCard";
import ResponseEmailSentiment from "../../../dashboard/components/graph-cards/ResponseEmailSentiment";
import DeliveryRate from "../../../dashboard/components/graph-cards/DeliveryRate";
import PeriodCard from "./PeriodCard";
import SequenceCard from "./SequenceCard";
import LeaderBoard from "./LeaderBoard";
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
const acceptanceData = [
  { percentage: "95%", name: "Renato Leite" },
  { percentage: "53%", name: "Rafael Santos" },
  { percentage: "51%", name: "Henrique Brugugnoli" },
  { percentage: "48%", name: "Vinicius Gallafrio" },
  { percentage: "44%", name: "Alessandra Martins" },
];

const replyData = [
  { percentage: "35%", name: "Karolina Yassuda" },
  { percentage: "25%", name: "Alessandra Martins" },
  { percentage: "24%", name: "Francisco Pereira" },
  { percentage: "17%", name: "Rafael Santos" },
  { percentage: "16%", name: "Jessica Amorim" },
];
const stats = [
  {
    label: "Messages Sent",
    value: 7016,
  },
  {
    label: "Sequences",
    value: 3662,
  },
  {
    label: "InMails",
    value: 0,
  },
  {
    label: "Connection",
    value: 3354,
  },
  {
    label: "Connect Accept",
    value: 1515,
  },
  {
    label: "Without Msg",
    value: 3,
    percentage: "0.20%",
  },
  {
    label: "With Msg",
    value: 1512,
    percentage: "99.80%",
  },
];

const responses = [
  {
    label: "After Sequence 1",
    value: 100,
    percentage: "6%",
  },
  {
    label: "After Sequence 2",
    value: 42,
    percentage: "55%",
  },
  {
    label: "After Sequence 3",
    value: 505,
    percentage: "45%",
  },
  {
    label: "After Sequence 4",
    value: 45,
    percentage: "10%",
  },
  {
    label: "After Sequence 5",
    value: 25,
    percentage: "100%",
  },
  {
    label: "After Sequence 6",
    value: 45,
    percentage: "48%",
  },
  {
    label: "After Sequence 7",
    value: 20,
    percentage: "60%",
  },
  {
    label: "After Sequence 8",
    value: 75,
    percentage: "85%",
  },
  {
    label: "After Sequence 9",
    value: 85,
    percentage: "32%",
  },
  {
    label: "After Sequence 10",
    value: 25,
    percentage: "25%",
  },
];
const responsesSource = [
  {
    label: "After Sequence",
    value: 100,
    percentage: "6%",
  },
  {
    label: "After InMail",
    value: 42,
    percentage: "55%",
  },
  {
    label: "After Connection Msg",
    value: 505,
    percentage: "45%",
  },
  {
    label: "After Sequence 4",
    value: 45,
    percentage: "10%",
  },
  {
    label: "After Sequence 5",
    value: 25,
    percentage: "100%",
  },
];
const LinkedInStats = () => {
  const firstFive = responses.slice(0, 5);
  const secondFive = responses.slice(5, 10);
  return (
    <div className="mt-6">
      <div className="flex flex-col gap-y-4">
        <div className="grid grid-cols-7 gap-3">
          {stats.map((stat, index) => (
            <PeriodCard
              key={index}
              title={stat.label}
              value={stat.value}
              percentage={stat.percentage}
              type="linkedin"
            />
          ))}
        </div>
        <div className="grid grid-cols-6 gap-6">
          <div className="col-span-1 row-span-1 ">
            <DeliveryRate
              accepted={865}
              total={1238}
              title="Acceptance Rate"
              textcolor="#454545"
              circlecolor="#28f0e6"
              type="agency-dashboard"
            />
          </div>
          <div className="col-span-1 row-span-1 ">
            <DeliveryRate
              accepted={865}
              total={1238}
              title="Reply Rate"
              textcolor="#454545"
              circlecolor="#00b4d8"
              type="agency-dashboard"
            />
          </div>
          <div className="col-span-1 row-span-1 ">
            <DeliveryRate
              accepted={865}
              total={1238}
              title="Sequence"
              textcolor="#454545"
              circlecolor="#25c396"
              type="agency-dashboard"
            />
          </div>
          <div className="col-span-1 row-span-1 ">
            <DeliveryRate
              accepted={865}
              total={1238}
              title="InMail"
              textcolor="#454545"
              circlecolor="#28f0e6"
              type="agency-dashboard"
            />
          </div>
          <div className="col-span-2 row-span-1 ">
            <ResponseEmailSentiment
              value="1124,596,243,2"
              type="agency-dashboard"
            />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <SequenceCard
            data={firstFive}
            title="Response to Sequences (1-5)"
            text="This is the stats of Response to Sequences (1-5)."
          />
          <SequenceCard
            data={secondFive}
            title="Response to Sequences (6-10)"
            text="This is the stats of Response to Sequences (6-10)."
          />
          <SequenceCard
            data={responsesSource}
            title="Response Sources"
            text="This is the stats of Response Sources."
          />
          <LeaderBoard
            topAcceptanceRates={acceptanceData}
            topReplyRates={replyData}
            text="This is the stats of LeaderBoard"
          />
        </div>
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
};

export default LinkedInStats;
