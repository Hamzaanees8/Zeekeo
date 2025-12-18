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
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";

const BillingContent = () => {
  const pageStyles = useAgencyPageStyles();
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
    <div className="flex w-full" style={pageStyles}>
      <SideBar />
      <div className="flex flex-col gap-y-[16px] py-[50px] px-[30px] w-full" style={pageStyles}>
        <h1 className="font-medium text-[48px] font-urbanist" style={{ color: 'var(--page-text-color, #6D6D6D)' }}>
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
          <p className="text-[28px] font-medium font-urbanist mb-4" style={{ color: 'var(--page-text-color, #6D6D6D)' }}>
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
