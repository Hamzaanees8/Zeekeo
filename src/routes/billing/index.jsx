import { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import { GetSavedCards } from "../../services/billings";
import {
  SubscriptionProvider,
  useSubscription,
} from "./context/BillingContext";
import Subscriptions from "./components/Subscriptions";
import Cards from "./components/Cards";
import Invoices from "./components/Invoices";
import "./index.css";
const BillingContent = () => {
  const {
    activeTab,
    setActiveTab,
    subscription,
    subscribedPlanId,
    subscribedUsers,
  } = useSubscription();
  const tabs = ["Invoices", "Subscription", "Cards"];
  const [cards, setCards] = useState([]);
  const renderTabContent = () => {
    switch (activeTab) {
      case "Invoices":
        return <Invoices />;
      case "Subscription":
        return <Subscriptions />;
      case "Cards":
        return (
          <Cards
            cards={cards}
            setActiveTab={setActiveTab}
            subscribedPlanId={subscribedPlanId}
            subscription={subscription}
            subscribedUsers={subscribedUsers}
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
    <div className="flex bg-white w-full">
      <SideBar />
      <div className="flex flex-col gap-y-[16px] py-[50px] px-[30px] bg-[#EFEFEF] w-full">
        <h1 className="font-medium text-[#6D6D6D] text-[48px] font-urbanist">
          Billing
        </h1>
        <div className="flex items-center justify-center gap-x-4 w-full">
          {tabs.map(tab => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-3 py-1.5 text-[18px] font-normal border rounded-[4px] ${
                activeTab === tab
                  ? "bg-[#0387FF] border-[#0387FF] text-white"
                  : "bg-white border-[#0387FF] text-[#0387FF]"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};
const Billing = () => (
  <SubscriptionProvider>
    <BillingContent />
  </SubscriptionProvider>
);
export default Billing;
