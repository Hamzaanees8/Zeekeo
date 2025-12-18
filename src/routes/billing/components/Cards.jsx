import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useAuthStore } from "../../stores/useAuthStore";
import CurrentSubscription from "./CurrentSubscription";
import PaymentMethods from "./PaymentMethods";
import UpgradeToPro from "./UpgradeToPro";
import ManagedService from "./ManagedService";
import ApplyCoupon from "./ApplyCoupon";
import { useSubscription } from "../context/BillingContext";
import toast from "react-hot-toast";
import { isWhitelabelDomain } from "../../../utils/whitelabel-helper";

const Cards = ({
  cards,
  setCards,
  subscription,
  subscribedPlanId,
  subscribedUsers,
  isLoadingCards,
}) => {
  const currentUser = useAuthStore(state => state.currentUser);
  const { discounts, isLoading, activeUsersCount, priceTiers } = useSubscription();

  // Use test key if user has dev flag set to true, otherwise use live key
  const useTestKey = currentUser?.dev === true;
  const stripePromise = loadStripe(
    useTestKey
      ? import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY
      : import.meta.env.VITE_STRIPE_LIVE_PUBLISHABLE_KEY,
  );

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

  // Check if user is on a special/custom plan
  const isSpecialPlan = subscribedPlanId && !knownPlanIds.includes(subscribedPlanId);

  // Check if user is on Pro plan
  const isProPlan =
    subscribedPlanId === "price_individual_pro_monthly" ||
    subscribedPlanId === "price_individual_pro_quarterly" ||
    subscribedPlanId === "price_agency_pro_monthly" ||
    subscribedPlanId === "price_agency_pro_quarterly" ||
    subscribedPlanId?.toLowerCase().includes("pro");

  // Check if user is on Basic plan (individual only, not agency)
  const isBasicPlan =
    subscribedPlanId === "price_individual_basic_monthly" ||
    subscribedPlanId === "price_individual_basic_quarterly" ||
    subscribedPlanId?.toLowerCase().includes("basic");

  // Show Upgrade to Pro card for individual plans only (not agency)
  // Also show as fallback if plan type is unknown (not explicitly basic or pro)
  // Show during loading to prevent layout shift
  const showUpgradeToPro = isLoading || isBasicPlan || isProPlan || (!isBasicPlan && !isProPlan && subscribedPlanId);

  const handleUpgradeToPro = async () => {
    // Determine if user is on monthly or quarterly
    const isMonthly = subscribedPlanId?.toLowerCase().includes("monthly");
    const isQuarterly = subscribedPlanId?.toLowerCase().includes("quarterly");

    // Check if we can detect billing cycle
    if (!isMonthly && !isQuarterly) {
      toast.error("Unable to determine your billing cycle. Please contact support.");
      return;
    }

    // Determine target Pro plan
    const targetPlanId = isMonthly
      ? "price_individual_pro_monthly"
      : "price_individual_pro_quarterly";

    return { targetPlanId };
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Row: 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <CurrentSubscription
          subscription={subscription}
          subscribedPlanId={subscribedPlanId}
          subscribedUsers={subscribedUsers}
          isSpecialPlan={isSpecialPlan}
          activeUsersCount={activeUsersCount}
          priceTiers={priceTiers}
        />
        {showUpgradeToPro && (
          <UpgradeToPro onUpgrade={handleUpgradeToPro} isPro={isProPlan} isLoadingSubscription={isLoading} isSpecialPlan={isSpecialPlan} />
        )}
        {!showUpgradeToPro && <div className="md:col-span-1"></div>}
        {!isWhitelabelDomain() && <ManagedService />}
      </div>

      {/* Middle Row: Payment Methods (66%) + Apply Coupon (33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Elements stripe={stripePromise}>
            <PaymentMethods
              cards={cards}
              setCards={setCards}
              isLoading={isLoadingCards}
            />
          </Elements>
        </div>
        <div className="lg:col-span-1">
          <ApplyCoupon activeCoupons={discounts} />
        </div>
      </div>
    </div>
  );
};

export default Cards;
