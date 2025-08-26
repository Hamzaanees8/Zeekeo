import SubscriptionCard from "./SubscriptionCard";

const OtherSubscription = () => {
  return (
    <div className="flex flex-col mt-4 gap-y-[26px]">
      <p className="text-[16px] font-normal text-[#6D6D6D]">
        Other Subscriptions:
      </p>
      <SubscriptionCard type="user" title="Add Users" />
      <SubscriptionCard type="pro" title="Pro" />
      <SubscriptionCard
        type="agencyBasic"
        title="Agency and Enterprise Basic"
      />
      <SubscriptionCard type="agencyPro" title="Agency and Enterprise Pro" />
    </div>
  );
};

export default OtherSubscription;
