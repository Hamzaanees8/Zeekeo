import { useState } from "react";
import Invoice from "./components/Invoice";
import Cards from "../../billing/components/Cards";
import { SubscriptionProvider } from "./context/BillingContext";
import Subscriptions from "./components/Subscriptions";
const cards = [
  {
    id: "card_1",
    card: {
      brand: "visa",
      last4: "1234",
    },
  },
  {
    id: "card_2",
    card: {
      brand: "mastercard",
      last4: "5678",
    },
  },
];
const AgencyBilling = () => {
  const tabs = ["Invoice", "Subscription", "Cards"];
  const [activeTab, setActiveTab] = useState("Invoice");
  const renderTabContent = () => {
    switch (activeTab) {
      case "Invoice":
        return <Invoice />;
      case "Subscription":
        return <Subscriptions />;
      case "Cards":
        return <Cards cards={cards} />;
      default:
        return null;
    }
  };
  return (
    <SubscriptionProvider>
      <div className="flex flex-col gap-y-[16px] bg-[#EFEFEF] px-[24px] pt-[45px] pb-[200px]">
        <h1 className="text-[#6D6D6D] text-[44px] font-[300]">Billing</h1>
        <div className="flex items-center justify-center gap-x-4">
          {tabs.map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-3 py-1.5 text-[18px] font-normal border ${
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

export default AgencyBilling;
