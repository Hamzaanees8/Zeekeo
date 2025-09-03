import { useEffect, useState } from "react";
import { DropDownIcon, RoundedCheck } from "../../../components/Icons";
import CancelModal from "./CancelModal";
import toast from "react-hot-toast";
const coreFeatures = [
  "Dedicated Campaign Success Manager",
  "Omni-Channel Smart Sequences",
  "5000 Email Contacts/Month Included",
  "Email Enrichment and Verification",
  "Automated LinkedIn: Profile Views, Follows, Endorsements, and Post Engagement",
];

const moreFeatures = [
  "ChatGPT-4 Template & LinkedIn Post Creation",
  "LinkedIn Post Scheduler",
  'Group, Event, Webinar and "Who\'s Viewed Your Profile" Campaign Generation',
  "A/B Testing",
  "CSV Import Campaigns",
  "Zapier Integration and API Access",
  "CRM Integration: Hubspot & Salesforce",
  "Direct Email Integration with Google and Microsoft",
  "Hyperise Integration: Image and GIF Personalization",
  "Monthly Masterclass",
];
const Subscription = ({
  subscription,
  onSwitchPlan,
  selectedPriceId,
  setSelectedPriceId,
  subscribedPlanId,
}) => {
  const [showBasicFeature, setShowBasicFeature] = useState(true);
  const [renewSubscription, setRenewSubscription] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  const isMonthly = subscribedPlanId?.includes("monthly");
  const isQuarterly = subscribedPlanId?.includes("quarterly");
  return (
    <div>
      {subscription && (
        <div className="flex flex-col bg-[#FFFFFF] border-[3px] border-[#0387FF] shadow-2xl p-5">
          <div className="">
            <p className="font-medium text-[#0387FF] text-base text-center">
              {subscription?.items?.data[0]?.plan?.nickname}
            </p>
          </div>
          <div className="flex items-end justify-between py-2.5">
            <div
              onClick={() => {
                if (isMonthly) {
                  toast.error(
                    "You have already subscribed to a monthly plan.",
                  );
                  return;
                }
                setSelectedPriceId("price_individual_basic_monthly");
              }}
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
                  
                ${
                  selectedPriceId === "price_individual_basic_monthly"
                    ? "border-2 border-[#0387FF]"
                    : ""
                }`}
            >
              <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                Monthly
              </p>
              <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                $197
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 1 Users Required
              </p>
            </div>
            <div
              onClick={() => {
                if (isQuarterly) {
                  toast.error(
                    "You have already subscribed to a quarterly plan.",
                  );
                  return;
                }
                setSelectedPriceId("price_individual_basic_quarterly");
              }}
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
                  ${
                    selectedPriceId === "price_individual_basic_quarterly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
            >
              <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                Quarterly
              </p>
              <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                $156
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 1 Users Required
              </p>
            </div>
          </div>
          {renewSubscription ? (
            <button className="border cursor-pointer border-[#16A37B] px-[14.5px] py-[5px] text-[16px] text-[#16A37B] bg-white font-medium font-urbanist">
              Renew Subscription
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-medium text-[12px] text-[#16A37B]">
                Subscription Renews
              </p>
              <p className="font-medium text-[12px] text-[#16A37B] ">
                {formatUnixTimestamp(
                  subscription?.items?.data[0]?.current_period_end,
                )}
              </p>
            </div>
          )}
          <div className="flex flex-col pt-[9px]">
            <div className="flex flex-col gap-y-2">
              {coreFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="grid gap-x-[6px] items-start"
                  style={{ gridTemplateColumns: "20px auto" }}
                >
                  <RoundedCheck />
                  <p className="text-[10px] font-normal text-[#6D6D6D]">
                    {feature}
                  </p>
                </div>
              ))}
              <hr className="border border-[#6D6D6D]" />
              <div className="flex items-center justify-between gap-x-[30px]">
                <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                  More Features
                </p>
                <div
                  className={`cursor-pointer transition-transform duration-300 ${
                    showBasicFeature ? "rotate-180" : ""
                  }`}
                  onClick={() => setShowBasicFeature(!showBasicFeature)}
                >
                  <DropDownIcon />
                </div>
              </div>
              {showBasicFeature &&
                moreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className="text-[10px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="border w-full h-[36px] mt-2.5 cursor-pointer border-[#DE4B32] px-[14.5px] py-[5px] text-[16px] text-[#DE4B32] bg-white font-medium font-urbanist"
          >
            Cancel Subscription
          </button>
          <>
            {(selectedPriceId === "price_individual_basic_quarterly" ||
              selectedPriceId === "price_individual_basic_monthly") && (
              <button
                onClick={() => {
                  onSwitchPlan(selectedPriceId);
                }}
                className="border mt-2.5 cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] h-[32px] w-full text-[16px] text-[#7E7E7E] font-medium font-urbanist"
              >
                Switch Plan
              </button>
            )}
          </>
          {showModal && <CancelModal onClose={() => setShowModal(false)} />}
        </div>
      )}
    </div>
  );
};

export default Subscription;
