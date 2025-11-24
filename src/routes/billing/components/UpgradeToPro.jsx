import { RoundedCheck } from "../../../components/Icons";
import { useState } from "react";
import { UpdateSubscriptionPlan } from "../../../services/billings";
import toast from "react-hot-toast";
import { useSubscription } from "../context/BillingContext";

const proFeatures = [
  "AI Generated Responses",
  "AI Inbox Autopilot",
  "AI Sentiment Analysis",
  "AI Generated LinkedIn Posts",
  "AI Personas",
];

const UpgradeToPro = ({ onUpgrade, isPro = false, isLoadingSubscription = false, isSpecialPlan = false }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState(null);
  const { setSubscription, setSubscribedPlanId } = useSubscription();

  const handleUpgradeClick = async () => {
    const result = await onUpgrade();

    if (!result || !result.targetPlanId) {
      // User validation failed or error occurred
      return;
    }

    // Store upgrade details and show modal
    setUpgradeDetails(result);
    setShowConfirmModal(true);
  };

  const confirmUpgrade = async () => {
    setShowConfirmModal(false);
    setIsUpgrading(true);

    try {
      const { targetPlanId } = upgradeDetails;

      // Call the update subscription API
      const response = await UpdateSubscriptionPlan(targetPlanId, 1);

      if (response) {
        toast.success("Successfully upgraded to Pro!");
        setSubscription(response);
        setSubscribedPlanId(response?.items?.data[0]?.price?.lookup_key);
      } else {
        toast.error("Failed to upgrade. Please try again.");
      }
    } catch (error) {
      console.error("Error upgrading to Pro:", error);
      toast.error("Something went wrong while upgrading. Please try again.");
    } finally {
      setIsUpgrading(false);
      setUpgradeDetails(null);
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#6D6D6D] p-3.5 rounded-[8px] shadow-md flex flex-col h-full">
      <p className="text-[20px] font-semibold font-urbanist leading-[20px] text-[#6D6D6D] mb-3">
        {isPro ? "Pro Features" : "Upgrade to Pro"}
      </p>

      {isLoadingSubscription ? (
        <div className="flex items-center justify-center flex-1">
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
      ) : (
        <>
          <div className="flex flex-col flex-1 min-h-0 mt-[10px]">
            <p className="text-[14px] font-semibold text-[#6D6D6D] mb-1.5">
              {isPro ? "Enjoy these features:" : "Pro Features:"}
            </p>
            <div className="flex flex-col gap-y-1.5 overflow-y-auto pr-2 custom-scrollbar max-h-[150px]">
          {proFeatures.map((feature, index) => (
            <div
              key={index}
              className="grid gap-x-[6px] items-start"
              style={{ gridTemplateColumns: "20px auto" }}
            >
              <RoundedCheck />
              <p className="text-[12px] font-normal text-[#6D6D6D] leading-tight">
                {feature}
              </p>
            </div>
          ))}
            </div>
          </div>

          <div className="mt-3">
            {isPro ? (
              <div className="w-full border-2 border-[#16A37B] bg-[#F0FDF4] rounded-[6px] px-4 py-2 text-center">
                <p className="text-[16px] font-semibold font-urbanist text-[#16A37B]">
                  ✓ You are on Pro!
                </p>
              </div>
            ) : (
              <div className="relative group">
                <button
                  onClick={handleUpgradeClick}
                  disabled={isUpgrading || isSpecialPlan}
                  className={`w-full border rounded-[6px] px-4 py-2 text-[16px] font-semibold font-urbanist transition-colors ${
                    isUpgrading || isSpecialPlan
                      ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#0387FF] border-[#0387FF] text-white hover:bg-[#0270D9] cursor-pointer"
                  }`}
                >
                  {isUpgrading ? "Upgrading..." : "Upgrade for +$100/month"}
                </button>
                {isSpecialPlan && (
                  <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-10">
                    You're on a special plan. Contact support for changes.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && upgradeDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[450px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
            <div className="flex justify-between items-start mb-[21px]">
              <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                Confirm Upgrade to Pro
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="cursor-pointer text-[20px]"
              >
                ✕
              </button>
            </div>
            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              Are you sure you want to upgrade to Individual Pro {upgradeDetails.targetPlanId?.includes("monthly") ? "Monthly" : "Quarterly"}?
            </p>
            <p className="text-[#7E7E7E] mb-[21px] font-[400] font-urbanist text-[14px]">
              Your subscription will be updated immediately and you'll be charged the new rate.
            </p>
            <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-1 bg-white border rounded-[4px] text-[#04479C] border-[#04479C] cursor-pointer"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeToPro;
