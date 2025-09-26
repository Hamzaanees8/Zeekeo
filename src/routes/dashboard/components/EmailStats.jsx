import DeliveryRate from "./graph-cards/DeliveryRate";
import EmailResponseRate from "./graph-cards/EmailResponseRate";
import ResponseEmailSentiment from "./graph-cards/ResponseEmailSentiment";

export default function EmailStats() {
  return (
    <div className="grid grid-cols-5 gap-6 mt-6 ">
      {/* Top Row Cards */}
      <div className="col-span-1 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <DeliveryRate accepted={865} total={1238} />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <EmailResponseRate value="80,60,50" />
      </div>
      <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
        <ResponseEmailSentiment value="1124,596,243,2" />
      </div>
    </div>
  );
}
