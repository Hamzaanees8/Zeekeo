import DeliveryRate from "../../../dashboard/components/graph-cards/DeliveryRate";
import EmailResponseRate from "../../../dashboard/components/graph-cards/EmailResponseRate";
import ResponseEmailSentiment from "../../../dashboard/components/graph-cards/ResponseEmailSentiment";

export default function UserEmailStats({ periodData }) {
  const email_sent = periodData?.email_message?.total || 0;
  const email_open = periodData?.email_open?.total || 0;
  const email_reply = periodData?.email_reply?.total || 0;
  const email_failed = periodData?.email_message_failed?.total || 0;
  const email_delivered = email_sent - email_failed;
  return (
    <div className="grid grid-cols-5 gap-6 mt-6 ">
      {/* Top Row Cards */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
         <DeliveryRate accepted={email_delivered} total={email_sent} />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <EmailResponseRate
          data={{
            openCount: email_open,
            replyCount: email_reply,
            bounceCount: email_failed,
          }}
          total={email_sent}
        />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
          <ResponseEmailSentiment value="1124,596,243,2" />
      </div>
    </div>
  );
}
