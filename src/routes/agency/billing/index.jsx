import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GetSavedCards } from "../../../services/billings";
import {
  SubscriptionProvider,
  useSubscription,
} from "../../billing/context/BillingContext";
import Subscriptions from "../../billing/components/Subscriptions";
import Cards from "../../billing/components/Cards";
import Invoices from "../../billing/components/Invoices";
import "../../billing/index.css";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";
import { useAuthStore } from "../../stores/useAuthStore";

const AgencyBillingContent = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.currentUser);
  const {
    subscription,
    subscribedPlanId,
    subscribedUsers,
  } = useSubscription();
  const [cards, setCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const { background, textColor } = useAgencySettingsStore();

  // Check if this is a subagency
  const isSubagency = !!currentUser?.agency_parent;

  // Redirect subagencies away from billing
  useEffect(() => {
    if (isSubagency) {
      navigate("/agency/dashboard", { replace: true });
    }
  }, [isSubagency, navigate]);

  useEffect(() => {
    // Skip fetching cards for subagencies
    if (isSubagency) return;

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
  }, [isSubagency]);

  // Don't render anything for subagencies
  if (isSubagency) {
    return null;
  }
  return (
    <div className="flex flex-col gap-y-[16px] py-[50px] px-[30px] w-full" style={{ backgroundColor: background || "#EFEFEF" }}>
      <h1 className="font-medium  text-[48px] font-urbanist" style={{ color: textColor || "#6D6D6D" }}>
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
  );
};

const AgencyBilling = () => (
  <SubscriptionProvider>
    <AgencyBillingContent />
  </SubscriptionProvider>
);

export default AgencyBilling;
