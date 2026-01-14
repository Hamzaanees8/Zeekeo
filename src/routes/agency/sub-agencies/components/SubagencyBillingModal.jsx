import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import {
  GetActiveSubscription,
  GetSavedCards,
  SetupSubagencyBilling,
} from "../../../../services/billings";
import { useAuthStore } from "../../../stores/useAuthStore";
import CurrentSubscription from "../../../billing/components/CurrentSubscription";
import PaymentMethods from "../../../billing/components/PaymentMethods";

const SubagencyBillingModal = ({ subagency, onClose, onBillingSetup }) => {
  const currentUser = useAuthStore(state => state.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [cards, setCards] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [priceTiers, setPriceTiers] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [seats, setSeats] = useState(null);

  // Use test key if user has dev flag set to true, otherwise use live key
  const useTestKey = currentUser?.dev === true;
  const stripePromise = loadStripe(
    useTestKey
      ? import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY
      : import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY
  );

  const fetchBillingData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscription and cards using the subagency username
      const [subscriptionResponse, cardsResponse] = await Promise.all([
        GetActiveSubscription(subagency.username),
        GetSavedCards(subagency.username),
      ]);

      if (subscriptionResponse?.hasStripeCustomer !== false) {
        setHasStripeCustomer(true);
        setSubscription(subscriptionResponse?.subscription);
        setActiveUsersCount(subscriptionResponse?.activeUsersCount ?? 0);
        setPriceTiers(subscriptionResponse?.priceTiers || []);
        setDiscounts(subscriptionResponse?.discounts || []);
        setSeats(subscriptionResponse?.seats || null);
        setCards(cardsResponse || []);
      } else {
        setHasStripeCustomer(false);
      }
    } catch (error) {
      console.error("Failed to fetch subagency billing:", error);
      setHasStripeCustomer(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (subagency?.username) {
      fetchBillingData();
    }
  }, [subagency?.username]);

  const handleSetupBilling = async () => {
    setIsSettingUp(true);
    try {
      const response = await SetupSubagencyBilling(subagency.username);
      if (response?.success) {
        toast.success("Billing setup successfully!");
        setHasStripeCustomer(true);
        onBillingSetup && onBillingSetup(subagency.username);
        // Refetch billing data
        await fetchBillingData();
      } else {
        toast.error(response?.message || "Failed to setup billing");
      }
    } catch (error) {
      console.error("Failed to setup subagency billing:", error);
      toast.error("Something went wrong while setting up billing");
    } finally {
      setIsSettingUp(false);
    }
  };

  // Known plan IDs
  const knownPlanIds = [
    "price_individual_basic_monthly",
    "price_individual_basic_quarterly",
    "price_individual_pro_monthly",
    "price_individual_pro_quarterly",
    "price_agency_basic_monthly",
    "price_agency_basic_quarterly",
    "price_agency_pro_monthly",
    "price_agency_pro_quarterly",
  ];

  const subscribedPlanId =
    subscription?.items?.data?.[0]?.price?.lookup_key;
  const isSpecialPlan =
    subscribedPlanId && !knownPlanIds.includes(subscribedPlanId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto rounded-[8px] shadow-md">
        <div className="flex justify-between items-center px-7 pt-[15px] pb-4 border-b border-[#CCCCCC]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Billing - {subagency?.username}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-[20px] text-[#6D6D6D] hover:text-[#333]"
          >
            &times;
          </button>
        </div>

        <div className="p-7">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <svg
                className="animate-spin h-10 w-10 text-[#0387FF]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : !hasStripeCustomer ? (
            // Scenario 1: No Stripe customer - show setup button
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="text-center">
                <h3 className="text-[24px] font-semibold text-[#6D6D6D] mb-2">
                  Billing Not Set Up
                </h3>
                <p className="text-[16px] text-[#7E7E7E] max-w-md">
                  This subagency does not have billing configured. Click the
                  button below to set up a billing account.
                </p>
              </div>
              <button
                onClick={handleSetupBilling}
                disabled={isSettingUp}
                className={`px-6 py-3 rounded-[6px] text-white font-medium text-[16px] transition-all ${
                  isSettingUp
                    ? "bg-[#7E7E7E] cursor-not-allowed"
                    : "bg-[#0387FF] hover:bg-[#0270D4] cursor-pointer"
                }`}
              >
                {isSettingUp ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Setting Up...</span>
                  </div>
                ) : (
                  "Setup Subagency Billing"
                )}
              </button>
            </div>
          ) : (
            // Scenario 2: Has Stripe customer - show billing UI
            <div className="flex flex-col gap-6">
              <CurrentSubscription
                subscription={subscription}
                subscribedPlanId={subscribedPlanId}
                subscribedUsers={
                  subscription?.items?.data?.[0]?.quantity || 1
                }
                isSpecialPlan={isSpecialPlan}
                activeUsersCount={activeUsersCount}
                priceTiers={priceTiers}
                discounts={discounts}
                isLoading={false}
                readOnly={true}
                billedSeats={seats?.billed || subscription?.items?.data?.[0]?.quantity || 0}
                freeSeats={seats?.free || 0}
              />

              <Elements stripe={stripePromise}>
                <PaymentMethods
                  cards={cards}
                  setCards={setCards}
                  isLoading={false}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubagencyBillingModal;
