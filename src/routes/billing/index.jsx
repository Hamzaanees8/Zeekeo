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
    subscription,
    subscribedPlanId,
    subscribedUsers,
  } = useSubscription();
  const [cards, setCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoadingCards(true);
      try {
        const data = await GetSavedCards();
        if (data) {
          setCards(data);
        }
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      } finally {
        setIsLoadingCards(false);
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

        <Cards
          cards={cards}
          setCards={setCards}
          subscribedPlanId={subscribedPlanId}
          subscription={subscription}
          subscribedUsers={subscribedUsers}
          isLoadingCards={isLoadingCards}
        />

        <Invoices />

        <div className="mt-4" id="available-plans">
          <p className="text-[28px] text-[#6D6D6D] font-medium font-urbanist mb-4">
            Available Plans
          </p>
          <Subscriptions />
        </div>
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
