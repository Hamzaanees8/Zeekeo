import { useEffect, useState } from "react";
import {
  CalenderIcon,
  Cycle,
  TagIcon,
  TemplatesIcon,
} from "../../../components/Icons";
import { useSubscription as useBillingContext } from "../context/BillingContext";
import {
  UpdateSubscriptionPlan,
  UpdateSubscriptionSeats,
} from "../../../services/billings";
import toast from "react-hot-toast";
import Modal from "./Modal";
import CancelModal from "./CancelModal";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const CurrentSubscription = ({
  subscription,
  subscribedPlanId,
  subscribedUsers,
  isSpecialPlan = false,
  activeUsersCount,
  priceTiers,
}) => {
  const { discounts, isLoading, setSubscription, setSubscribedPlanId } =
    useBillingContext();
  const currentUser = useAuthStore(state => state.currentUser);
  console.log(currentUser);
  const { setTokens } = useAuthStore();
  const navigate = useNavigate();
  const [renewSubscription, setRenewSubscription] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);
  const [showAddSeatsModal, setShowAddSeatsModal] = useState(false);
  const [isUpgradingToAgency, setIsUpgradingToAgency] = useState(false);
  const [targetAgencyPlanId, setTargetAgencyPlanId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAgencyAddSeatsModal, setShowAgencyAddSeatsModal] =
    useState(false);
  const [isAddingSeats, setIsAddingSeats] = useState(false);
  const [seatsToAdd, setSeatsToAdd] = useState(1);

  const allowedUsers =
    (currentUser.seats?.billed || 0) + (currentUser.seats?.free || 0);

  function getPlanTitle(planId) {
    if (!planId) return "Unknown Plan";

    const lowerPlanId = planId.toLowerCase();

    // Determine account type
    const isAgency = lowerPlanId.includes("agency");
    const accountType = isAgency ? "Agency" : "Individual";

    // Determine tier
    let tier = "";
    if (lowerPlanId.includes("pro")) {
      tier = "Pro";
    } else if (lowerPlanId.includes("basic")) {
      tier = "Basic";
    }

    // Build plan name
    if (isAgency && tier) {
      return `${accountType} ${tier}`;
    } else if (tier) {
      return tier;
    }

    if (lowerPlanId.includes("special")) {
      return "Special Prices";
    }

    return "Unknown Plan";
  }

  // Check if this is an agency plan
  const isAgencyPlan = subscribedPlanId?.toLowerCase().includes("agency");

  useEffect(() => {
    if (subscription) {
      const now = Math.floor(Date.now() / 1000);
      const currentPeriodEnd =
        subscription.items?.data?.[0]?.current_period_end || 0;
      setRenewSubscription(currentPeriodEnd <= now);
    }
  }, [subscription]);

  function formatUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    return formattedDate.replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");
  }

  const handleBillingCycleClick = newPlanId => {
    if (newPlanId === subscribedPlanId || isSwitching) return;
    setPendingPlanId(newPlanId);
    setShowConfirmModal(true);
  };

  const confirmSwitchBillingCycle = async () => {
    if (!pendingPlanId || isSwitching) return;

    setIsSwitching(true);
    setShowConfirmModal(false);
    try {
      const quantity = isAgencyPlan ? subscribedUsers : 1;
      const result = await UpdateSubscriptionPlan(pendingPlanId, quantity);

      if (result) {
        toast.success("Billing cycle updated successfully!");
        setSubscription(result);
        setSubscribedPlanId(result?.items?.data[0]?.price?.lookup_key);
      } else {
        toast.error("Failed to update billing cycle. Please try again.");
      }
    } catch (error) {
      console.error("Error switching billing cycle:", error);
      toast.error("Something went wrong while updating your billing cycle.");
    } finally {
      setIsSwitching(false);
      setPendingPlanId(null);
    }
  };

  const handleAddSeatsClick = () => {
    // For agency plans, show modal to add users to existing plan
    if (isAgencyPlan) {
      setSeatsToAdd(1);
      setShowAgencyAddSeatsModal(true);
      return;
    }

    // For individual plans, upgrade to agency
    const isPro = subscribedPlanId?.toLowerCase().includes("pro");
    const isBasic = subscribedPlanId?.toLowerCase().includes("basic");
    const isMonthlyPlan = subscribedPlanId?.toLowerCase().includes("monthly");
    const isQuarterlyPlan = subscribedPlanId
      ?.toLowerCase()
      .includes("quarterly");

    if ((!isPro && !isBasic) || (!isMonthlyPlan && !isQuarterlyPlan)) {
      toast.error(
        "Unable to determine your plan type. Please contact support.",
      );
      return;
    }

    // Determine target agency plan
    let targetPlanId;
    if (isPro && isMonthlyPlan) {
      targetPlanId = "price_agency_pro_monthly";
    } else if (isPro && !isMonthlyPlan) {
      targetPlanId = "price_agency_pro_quarterly";
    } else if (!isPro && isMonthlyPlan) {
      targetPlanId = "price_agency_basic_monthly";
    } else {
      targetPlanId = "price_agency_basic_quarterly";
    }

    setTargetAgencyPlanId(targetPlanId);
    setShowAddSeatsModal(true);
  };

  const confirmAgencyAddSeats = async () => {
    if (!isAgencyPlan || seatsToAdd < 1) return;

    setShowAgencyAddSeatsModal(false);
    setIsAddingSeats(true);

    try {
      const currentQty =
        subscription.items?.data?.[0]?.quantity || subscribedUsers;
      const newQuantity = currentQty + seatsToAdd;

      const result = await UpdateSubscriptionSeats(newQuantity);

      if (result) {
        toast.success(
          `Successfully added ${seatsToAdd} seat${seatsToAdd > 1 ? "s" : ""}!`,
        );
        setSubscription(result);
        setSubscribedPlanId(result?.items?.data[0]?.price?.lookup_key);

        // Update currentUser.seats.billed in auth store
        const { setUser } = useAuthStore.getState();
        setUser({
          ...currentUser,
          seats: {
            ...currentUser.seats,
            billed: newQuantity,
          },
        });
      } else {
        toast.error("Failed to add seats. Please try again.");
      }
    } catch (error) {
      console.error("Error adding seats:", error);
      toast.error(
        "Something went wrong while adding seats. Please try again.",
      );
    } finally {
      setIsAddingSeats(false);
    }
  };

  const confirmUpgradeToAgency = async (seats, premium, agencyUsername) => {
    setShowAddSeatsModal(false);
    setIsUpgradingToAgency(true);

    try {
      const result = await UpdateSubscriptionPlan(
        targetAgencyPlanId,
        seats,
        premium,
        agencyUsername,
      );

      if (result) {
        // Check if this is an agency creation response (contains sessionToken)
        if (
          result.sessionToken &&
          result.refreshToken &&
          result.type === "agency"
        ) {
          // This is an agency creation - log in with the new agency credentials
          toast.success(
            "Agency created successfully! Redirecting to your new agency dashboard...",
          );
          setTokens(result.sessionToken, result.refreshToken);
          setShowAddSeatsModal(false);
          // Reload the page to initialize the new agency session
          setTimeout(() => {
            navigate("/");
          }, 1500);
          return;
        }

        // Normal plan update
        toast.success("Successfully upgraded to Agency plan!");
        setSubscription(result);
        setSubscribedPlanId(result?.items?.data[0]?.price?.lookup_key);
      } else {
        toast.error("Failed to upgrade to Agency. Please try again.");
      }
    } catch (error) {
      console.error("Error upgrading to Agency:", error);
      toast.error("Something went wrong while upgrading. Please try again.");
    } finally {
      setIsUpgradingToAgency(false);
    }
  };

  const getAlternatePlanId = () => {
    const planMap = {
      price_individual_basic_monthly: "price_individual_basic_quarterly",
      price_individual_basic_quarterly: "price_individual_basic_monthly",
      price_individual_pro_monthly: "price_individual_pro_quarterly",
      price_individual_pro_quarterly: "price_individual_pro_monthly",
      price_agency_basic_monthly: "price_agency_basic_quarterly",
      price_agency_basic_quarterly: "price_agency_basic_monthly",
      price_agency_pro_monthly: "price_agency_pro_quarterly",
      price_agency_pro_quarterly: "price_agency_pro_monthly",
    };

    // If found in map, return it
    if (planMap[subscribedPlanId]) {
      return planMap[subscribedPlanId];
    }

    // Fallback: construct alternate plan ID based on current plan
    const isProPlan = subscribedPlanId?.toLowerCase().includes("pro");
    const isMonthlyPlan = subscribedPlanId?.toLowerCase().includes("monthly");

    if (isProPlan) {
      return isMonthlyPlan
        ? "price_individual_pro_quarterly"
        : "price_individual_pro_monthly";
    } else {
      return isMonthlyPlan
        ? "price_individual_basic_quarterly"
        : "price_individual_basic_monthly";
    }
  };

  const getPriceForPlan = planId => {
    const prices = {
      price_individual_basic_monthly: 197,
      price_individual_basic_quarterly: 157,
      price_individual_pro_monthly: 297,
      price_individual_pro_quarterly: 237,
      price_agency_basic_monthly: 156,
      price_agency_basic_quarterly: 125,
      price_agency_pro_monthly: 237,
      price_agency_pro_quarterly: 190,
    };

    // If planId exists in prices, return it
    if (prices[planId]) {
      return prices[planId];
    }

    // Fallback logic for individual plans (this page is always individual)
    const isProPlan = planId?.toLowerCase().includes("pro");
    const isMonthlyPlan = planId?.toLowerCase().includes("monthly");

    if (isProPlan) {
      return isMonthlyPlan ? 297 : 237; // Pro monthly or quarterly
    } else {
      return isMonthlyPlan ? 197 : 157; // Basic monthly or quarterly (default)
    }
  };

  const currentPrice = getPriceForPlan(subscribedPlanId);
  const alternatePrice = getPriceForPlan(getAlternatePlanId());
  const isMonthly = subscribedPlanId?.includes("monthly");
  const alternatePlanId = getAlternatePlanId();

  return (
    <div className="bg-[#FFFFFF] border border-[#6D6D6D] p-3.5 rounded-[8px] shadow-md flex flex-col gap-y-3 w-full h-full">
      <div className="flex items-center gap-x-[20px]">
        <p className="text-[20px] font-semibold font-urbanist leading-[20px]">
          Current Subscription
        </p>
        {subscribedPlanId && (
          <p className="px-4 py-1 rounded-[6px] bg-[#0387FF] text-white">
            {subscription.status === "trialing" ? "Trial" : "Active"}
          </p>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-[#0387FF]"
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
      ) : subscribedPlanId ? (
        <>
          {renewSubscription ? (
            <div className="flex items-center justify-center">
              <p className="text-[#6D6D6D] text-[16px] font-normal">
                Your subscription has expired. Please renew to continue using
                the service.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex flex-col gap-y-2.5 flex-1">
                <div className="flex items-center gap-x-1.5">
                  <TemplatesIcon className="w-4 h-4" />
                  <p className="font-normal text-[16px] text-[#6D6D6D]">
                    Subscribed Plan:
                  </p>
                  <p className="text-[16px] text-[#6D6D6D] font-semibold">
                    {getPlanTitle(subscribedPlanId)}
                  </p>
                </div>

                <div className="flex items-center gap-x-1.5">
                  <CalenderIcon className="w-4 h-4" />
                  <p className="font-normal text-[16px] text-[#6D6D6D]">
                    Subscription Renews:
                  </p>
                  <p className="text-[16px] text-[#6D6D6D] font-semibold">
                    {formatUnixTimestamp(
                      subscription?.items?.data[0]?.current_period_end,
                    )}
                  </p>
                </div>

                {discounts && discounts.length > 0 && (
                  <div className="flex items-center gap-x-1.5">
                    <TagIcon className="w-5 h-5" />
                    <p className="font-normal text-[16px] text-[#6D6D6D]">
                      Coupon:
                    </p>
                    <p className="text-[16px] text-[#6D6D6D] font-semibold">
                      Active
                    </p>
                    <p className="text-[15px] text-[#6D6D6D] font-normal">
                      (
                      {discounts[0].coupon.percent_off
                        ? `Percentage Off: ${discounts[0].coupon.percent_off}%`
                        : discounts[0].coupon.amount_off
                        ? `Amount Off: $${(
                            discounts[0].coupon.amount_off / 100
                          ).toFixed(2)}`
                        : "Discount Applied"}
                      , Duration: {discounts[0].coupon.duration}
                      {discounts[0].coupon.duration === "repeating" &&
                      discounts[0].coupon.duration_in_months
                        ? ` (${discounts[0].coupon.duration_in_months} months)`
                        : ""}
                      )
                    </p>
                  </div>
                )}
              </div>

              {/* Billing Cycle Boxes + Add More Seats */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                {/* Left group: Monthly and Quarterly */}
                <div className="flex items-center gap-3">
                  <div
                    onClick={() =>
                      !isMonthly &&
                      !isSpecialPlan &&
                      handleBillingCycleClick(getAlternatePlanId())
                    }
                    className={`relative group flex flex-col items-center justify-center w-[110px] h-[90px] rounded-[8px] p-2 bg-[#d9d9d9] ${
                      isMonthly && !isSpecialPlan
                        ? "border-2 border-[#0387FF]"
                        : isSpecialPlan
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:border hover:border-[#0387FF]"
                    } ${
                      isSwitching || isSpecialPlan
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                      Monthly
                    </p>
                    <p className="font-[300] text-[28px] text-[#0387FF] text-center">
                      ${isMonthly ? currentPrice : alternatePrice}
                    </p>
                    {isMonthly && !isSpecialPlan && (
                      <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                        Active
                      </div>
                    )}
                    {isSpecialPlan && (
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
                        Special plan. Contact support for changes.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() =>
                      isMonthly &&
                      !isSpecialPlan &&
                      handleBillingCycleClick(getAlternatePlanId())
                    }
                    className={`relative group flex flex-col items-center justify-center w-[110px] h-[90px] rounded-[8px] p-2 bg-[#d9d9d9] ${
                      !isMonthly && !isSpecialPlan
                        ? "border-2 border-[#0387FF]"
                        : isSpecialPlan
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:border hover:border-[#0387FF]"
                    } ${
                      isSwitching || isSpecialPlan
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                      Quarterly
                    </p>
                    <p className="font-[300] text-[28px] text-[#0387FF] text-center">
                      ${!isMonthly ? currentPrice : alternatePrice}
                    </p>
                    {!isMonthly && !isSpecialPlan && (
                      <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                        Active
                      </div>
                    )}
                    {isSpecialPlan && (
                      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
                        Special plan. Contact support for changes.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right group: Add More Seats and Cancel Subscription - Show for all plans except special plans */}
                {!isSpecialPlan && (
                  <div className="flex items-center gap-3">
                    <div
                      onClick={handleAddSeatsClick}
                      className={`relative group flex flex-col items-center justify-center w-[110px] h-[90px] rounded-[8px] p-2 bg-gradient-to-br from-[#FFA500] to-[#FF8C00] transition-all shadow-sm ${
                        isUpgradingToAgency || isAddingSeats
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:from-[#FF8C00] hover:to-[#FF7700]"
                      }`}
                    >
                      <p className="font-semibold text-center text-[12px] text-white leading-tight mb-1">
                        Add More
                      </p>
                      <p className="font-bold text-[20px] text-white text-center leading-tight">
                        Seats
                      </p>
                    </div>

                    <div
                      onClick={() => setShowCancelModal(true)}
                      className="relative group flex flex-col items-center justify-center w-[110px] h-[90px] rounded-[8px] p-2 bg-[#d9d9d9] transition-all shadow-sm cursor-pointer hover:bg-[#c9c9c9]"
                    >
                      <p className="font-medium text-center text-[12px] text-[#6D6D6D]">
                        Cancel Subscription
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {isAgencyPlan && (
                <>
                  {priceTiers?.length > 0 && (
                    <div className="flex items-center gap-x-2 mt-[20px] overflow-x-auto pb-3">
                      {priceTiers.map((tier, index, arr) => {
                        const prevTierUpTo =
                          index === 0 ? 0 : arr[index - 1].up_to;
                        const tierLabel = tier.up_to
                          ? `User ${prevTierUpTo + 1}-${tier.up_to}`
                          : `User ${prevTierUpTo + 1}+`;
                        const unitPrice = tier.unit_amount
                          ? `$${(tier.unit_amount / 100).toFixed(2)}/user`
                          : tier.flat_amount
                          ? `$${(tier.flat_amount / 100).toFixed(2)} flat`
                          : "Contact us";

                        return (
                          <div
                            key={index}
                            className="flex flex-col rounded-[4px] border border-[#7E7E7E] overflow-hidden min-w-[90px]"
                          >
                            <p className="text-[11px] text-[#6D6D6D] font-semibold bg-[#EFEFEF] px-2 py-1 text-center">
                              {tierLabel}
                            </p>
                            <p className="text-[11px] text-[#6D6D6D] font-normal bg-[#FFFFFF] px-2 py-1 text-center">
                              {unitPrice}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex flex-col gap-y-1.5 w-full mt-[10px]">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[16px] text-[#6D6D6D]">
                        Current Users
                      </p>
                      <p className="text-[16px] text-[#6D6D6D] font-semibold">
                        {activeUsersCount ?? 0} of {allowedUsers}
                      </p>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-3 bg-[#0387FF] rounded-full"
                        style={{
                          width: `${
                            ((activeUsersCount ?? 0) / allowedUsers) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-[14px] text-[#6D6D6D] font-normal">
                      {currentUser.seats?.billed || 0} billed users
                      {currentUser.seats?.free
                        ? ` and ${currentUser.seats.free} free users`
                        : ""}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center">
          <p className="text-[#6D6D6D] text-[16px] font-normal">
            No active subscription. Please select a plan below.
          </p>
        </div>
      )}

      {/* Billing Cycle Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[450px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
            <div className="flex justify-between items-start mb-[21px]">
              <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                Confirm Billing Cycle Change
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cursor-pointer text-[20px]"
              >
                ✕
              </button>
            </div>
            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              Are you sure you want to switch to{" "}
              {pendingPlanId?.includes("monthly") ? "Monthly" : "Quarterly"}{" "}
              billing? Your subscription will be updated immediately.
            </p>
            <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitchBillingCycle}
                className="px-4 py-1 bg-white border rounded-[4px] text-[#04479C] border-[#04479C] cursor-pointer"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add More Seats Confirmation Modal */}
      {showAddSeatsModal && (
        <Modal
          title="Add More Seats"
          text="Are you sure you would like to upgrade to Agency plan? This will allow you to add multiple seats and have access to an agency dashboard."
          actionButton="Add Seats"
          onClose={() => setShowAddSeatsModal(false)}
          onClick={confirmUpgradeToAgency}
          isLoading={isUpgradingToAgency}
          selectedPlanId={targetAgencyPlanId}
          isAgencyPlan={true}
          userEmail={currentUser?.email}
        />
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <CancelModal
          onClose={() => setShowCancelModal(false)}
          setSubscribedPlanId={setSubscribedPlanId}
          setSubscription={setSubscription}
        />
      )}

      {/* Agency Add More Seats Modal */}
      {showAgencyAddSeatsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[450px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
            <div className="flex justify-between items-start mb-[21px]">
              <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                Add More Seats
              </h2>
              <button
                onClick={() => setShowAgencyAddSeatsModal(false)}
                className="cursor-pointer text-[20px]"
              >
                ✕
              </button>
            </div>
            <div className="mb-[21px]">
              <label className="block text-[#6D6D6D] text-[14px] font-medium mb-2">
                Number of seats to add
              </label>
              <input
                type="number"
                min="1"
                value={seatsToAdd}
                onChange={e => setSeatsToAdd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#7E7E7E] rounded-[4px] focus:outline-none focus:border-[#0387FF]"
              />
              <p className="text-[#7E7E7E] text-[14px] mt-2">
                Current seats: {subscribedUsers}
              </p>
              <p className="text-[#6D6D6D] text-[14px] font-semibold mt-1">
                New total: {subscribedUsers + seatsToAdd} seats
              </p>
            </div>
            <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
              <button
                onClick={() => setShowAgencyAddSeatsModal(false)}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAgencyAddSeats}
                disabled={seatsToAdd < 1}
                className="px-4 py-1 bg-white border rounded-[4px] text-[#04479C] border-[#04479C] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentSubscription;
