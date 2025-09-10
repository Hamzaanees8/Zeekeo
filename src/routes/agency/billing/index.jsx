import Invoice from "./components/Invoice";
import Cards from "../../billing/components/Cards";
import {
  SubscriptionProvider,
  useSubscription,
} from "./context/BillingContext";
import Subscriptions from "./components/Subscriptions";
import { useEffect, useState } from "react";
import { GetSavedCards } from "../../../services/billings";
const AgencyBillingContent = () => {
  const { activeTab, setActiveTab, subscription, subscribedPlanId } =
    useSubscription();
  const tabs = ["Invoice", "Subscription", "Cards"];
  const [cards, setCards] = useState([]);
  const renderTabContent = () => {
    switch (activeTab) {
      case "Invoice":
        return <Invoice />;
      case "Subscription":
        return <Subscriptions />;
      case "Cards":
        return (
          <Cards
            cards={cards}
            setActiveTab={setActiveTab}
            subscribedPlanId={subscribedPlanId}
            subscription={subscription}
          />
        );
      default:
        return null;
    }
  };
  useEffect(() => {
    const fetchCards = async () => {
      const data = await GetSavedCards();
      if (data) {
        setCards(data);
      }
    };

    fetchCards();
  }, []);
  return (
    <SubscriptionProvider>
      <div className="flex flex-col gap-y-[16px] bg-[#EFEFEF] px-[24px] pt-[45px] pb-[200px]">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Billing</h1>
        <div className="flex items-center justify-center gap-x-4">
          {tabs.map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-3 py-1.5 text-[18px] font-normal border rounded-[4px] ${
                activeTab === tab
                  ? "bg-[#969696] border-[#969696] text-white"
                  : "bg-white border-[#969696] text-[#6D6D6D]"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
        <div>{renderTabContent()}</div>
      </div>
    </SubscriptionProvider>
  );
};
const AgencyBilling = () => (
  <SubscriptionProvider>
    <AgencyBillingContent />
  </SubscriptionProvider>
);
export default AgencyBilling;
