import DeliveryRate from "../../../dashboard/components/graph-cards/DeliveryRate";
import EmailResponseRate from "../../../dashboard/components/graph-cards/EmailResponseRate";
import ResponseEmailSentiment from "../../../dashboard/components/graph-cards/ResponseEmailSentiment";

export default function EmailStats() {
  return (
    <div className="grid grid-cols-6 gap-6 mt-6">
      <div className="col-span-1 row-span-1 ">
        <DeliveryRate
          accepted={865}
          total={1238}
          title="Delivery Rate"
          textcolor="#454545"
          circlecolor="#28f0e6"
        />
      </div>
      <div className="col-span-1 row-span-1 ">
        <DeliveryRate
          accepted={865}
          total={1238}
          title="Open Rate"
          textcolor="#454545"
          circlecolor="#00b4d8"
        />
      </div>
      <div className="col-span-1 row-span-1 ">
        <DeliveryRate
          accepted={865}
          total={1238}
          title="Bounce Rate"
          textcolor="#454545"
          circlecolor="#25c396"
        />
      </div>
      <div className="col-span-1 row-span-1 ">
        <DeliveryRate
          accepted={865}
          total={1238}
          title="Reply Rate"
          textcolor="#454545"
          circlecolor="#28f0e6"
        />
      </div>
      <div className="col-span-2 row-span-1 ">
        <ResponseEmailSentiment value="1124,596,243,2" />
      </div>
    </div>
  );
}
