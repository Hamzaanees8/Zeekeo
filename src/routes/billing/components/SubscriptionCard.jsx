import { useEffect, useState } from "react";
import { DropDownIcon, RoundedCheck } from "../../../components/Icons";
import CancelModal from "./CancelModal";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { useAuthStore } from "../../stores/useAuthStore";
const coreFeaturesBasic = [
  "Dedicated Campaign Success Manager",
  "Omni-Channel Smart Sequences",
  "5000 Email Contacts/Month Included",
  "Email Enrichment and Verification",
  "Automated LinkedIn: Profile Views, Follows, Endorsements, and Post Engagement",
];

const moreFeaturesBasic = [
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
const coreFeatures = [
  "End-to-End AI Campaign Builder",
  "AI Template Map Library",
  "AI-Generated Responses",
  "AI Sentiment Analysis",
  "AI LinkedIn Post Scheduling",
  "AI Customer Personas",
];
const moreFeatures = [
  "Dedicated Campaign Success Manager",
  "Omni-Channel Smart Sequences",
  "5000 Email Contacts/Month Included",
  "Email Enrichment and Verification",
  "Automated LinkedIn: Profile Views, Follows, Endorsements, and Post Engagement",
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
// Array 1: Includes Basic, plus; (AI features)
const coreFeaturesAgencyBasic = [
  "End-to-End AI Campaign Builder",
  "AI Template Map Library",
  "AI-Generated Responses",
  "AI Sentiment Analysis",
  "AI LinkedIn Post Scheduling",
  "AI Customer Personas",
];

// Array 2: Premium Agency Option
const premiumFeaturesAgencyBasic = [
  "Full White-Label",
  "Global Inbox",
  "Global Templates",
  "Global Blacklist",
  "Custom JavaScript Settings",
  "Sub-Agencies",
  "DNS Setup",
  "API Access",
  "Deduplication Groupings",
  "Parallel LinkedIn Viewer",
];

// Array 3: Basic Features (combined from the previous request)
const basicFeaturesAgencyBasic = [
  "Dedicated Campaign Success Manager",
  "Omni-Channel Smart Sequences",
  "5000 Email Contacts/Month Included",
  "Email Enrichment and Verification",
  "Automated LinkedIn: Profile Views, Follows, Endorsements, and Post Engagement",
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
const basicAndProFeatures_Basic = [
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
const basicAndProFeatures_Pro = [
  "End-to-End AI Campaign Builder",
  "AI Template Map Library",
  "AI-Generated Responses",
  "AI Sentiment Analysis",
  "AI LinkedIn Post Scheduling",
  "AI Customer Personas",
];
const priceMap = {
  price_agency_basic_monthly: 156,
  price_agency_basic_quarterly: 125,
  price_agency_pro_monthly: 237,
  price_agency_pro_quarterly: 190,
};
const SubscriptionCard = ({
  title,
  type,
  onSwitchPlan,
  onAddUser,
  selectedPriceId,
  setSelectedPriceId,
  subscription,
  subscribedPlanId,
  setSubscribedPlanId,
  setSubscription,
  showConfirmationModal,
  setShowConfirmationModal,
  showAddUserModal,
  setShowAddUserModal,
  subscribedUsers,
  price,
  interval,
  isSwitchingPlan,
}) => {
  const currentUser = useAuthStore(state => state.currentUser);
  const [showBasicFeature, setShowBasicFeature] = useState(true);
  const [showBasicFeaturePro, setShowBasicFeaturePro] = useState(true);
  const [renewSubscription, setRenewSubscription] = useState(false);
  const [showProFeaturePro, setShowProFeaturePro] = useState(true);
  const [showPremiumFeature, setShowPremiumFeature] = useState(true);
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
  return (
    <div>
      {type === "useragencybasic" && (
        <>
          <div className="bg-[#F7F7F8] border border-[#7E7E7E] p-5 rounded-[8px] shadow-md">
            <div>
              <p className="font-medium text-[#0387FF] text-[20px] font-urbanist text-left">
                {title}
              </p>
            </div>
            <div className="flex items-end justify-start w-full">
              <div className="flex flex-col items-start ">
                <p className="font-medium text-left text-[11px] text-[#6D6D6D] italic">
                  ${priceMap.price_agency_basic_monthly}/Month
                </p>
                <p className="font-medium text-[11px] text-[#6D6D6D] italic text-left">
                  ${priceMap.price_agency_basic_quarterly}/Quarterly
                </p>
                <p className="font-normal text-[11px] text-[#6D6D6D] italic text-left mt-2.5">
                  Per Month for 1 Account
                </p>
                <button
                  className="w-[220px] border cursor-pointer mt-2.5 !rounded-[6px] border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                  onClick={() => setShowAddUserModal(true)}
                >
                  Add Users
                </button>
              </div>
            </div>
          </div>
          {showAddUserModal && (
            <Modal
              title="Add Users"
              actionButton="Add Users"
              subscribedUsers={subscribedUsers}
              price={price}
              interval={interval}
              premiumFee={997}
              onClose={() => setShowAddUserModal(false)}
              onClick={usersToAdd => onAddUser(usersToAdd)}
            />
          )}
        </>
      )}
      {type === "useragencypro" && (
        <>
          <div className="bg-[#F7F7F8] border border-[#7E7E7E] p-5 rounded-[8px] shadow-md">
            <div>
              <p className="font-medium text-[#0387FF] text-[20px] font-urbanist text-left">
                {title}
              </p>
            </div>
            <div className="flex items-end justify-start w-full">
              <div className="flex flex-col items-start ">
                <p className="font-medium text-left text-[11px] text-[#6D6D6D] italic">
                  ${priceMap.price_agency_pro_monthly}/Month
                </p>
                <p className="font-medium text-[11px] text-[#6D6D6D] italic text-left">
                  ${priceMap.price_agency_pro_quarterly}/Quarterly
                </p>
                <p className="font-normal text-[11px] text-[#6D6D6D] italic text-left mt-2.5">
                  Per Month for 1 Account
                </p>
                <button
                  className="w-[220px] border cursor-pointer rounded-[6px] mt-2.5 border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                  onClick={() => setShowAddUserModal(true)}
                >
                  Add Users
                </button>
              </div>
            </div>
          </div>
          {showAddUserModal && (
            <Modal
              title="Add Users"
              actionButton="Add Users"
              subscribedUsers={subscribedUsers}
              price={price}
              interval={interval}
              premiumFee={997}
              onClose={() => setShowAddUserModal(false)}
              onClick={usersToAdd => onAddUser(usersToAdd)}
            />
          )}
        </>
      )}
      {type === "basic" && (
        <>
          <div
            className={`bg-[#F7F7F8] border p-5 rounded-[8px] shadow-md
                ${
                  subscribedPlanId === "price_individual_basic_quarterly" ||
                  subscribedPlanId === "price_individual_basic_monthly"
                    ? "border-[3px] border-[#0387FF] shadow-2xl"
                    : "border border-[#7E7E7E]"
                }`}
          >
            <div>
              <p
                className={`font-medium text-[#0387FF] ${
                  type === "user"
                    ? "text-[20px] font-urbanist text-left"
                    : "text-base text-center"
                } `}
              >
                {title}
              </p>
            </div>
            <div className="flex items-end justify-between py-2.5">
              <div
                className={`flex flex-col w-[110px] h-[100px] items-center justify-center  rounded-[8px] p-2 bg-[#d9d9d9]
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
                {subscribedPlanId === "price_individual_basic_monthly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month for 1 Account
                    </p>
                  </>
                )}
              </div>
              <div
                className={`flex flex-col w-[110px] h-[100px] items-center justify-center  rounded-[8px] p-2 bg-[#d9d9d9]
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
                  $157
                </p>
                {subscribedPlanId === "price_individual_basic_quarterly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month for 1 Account
                    </p>
                  </>
                )}
              </div>
            </div>
            {(subscribedPlanId === "price_individual_basic_quarterly" ||
              subscribedPlanId === "price_individual_basic_monthly") && (
              <>
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
              </>
            )}
            <div className="flex flex-col">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[10px]">
                  Includes Basic, plus;
                </p>
                {coreFeaturesBasic.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className=" text-[10px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                    Basic Features
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
                  moreFeaturesBasic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {type === "pro" && (
        <>
          <div
            className={`bg-[#F7F7F8] border p-5 rounded-[8px] shadow-md
                ${
                  subscribedPlanId === "price_individual_pro_monthly" ||
                  subscribedPlanId === "price_individual_pro_quarterly"
                    ? "border-[3px] border-[#0387FF] shadow-2xl"
                    : "border border-[#7E7E7E]"
                }`}
          >
            <div>
              <p
                className={`font-medium text-[#0387FF] ${
                  type === "user"
                    ? "text-[20px] font-urbanist text-left"
                    : "text-base text-center"
                } `}
              >
                {title}
              </p>
            </div>
            <div className="flex items-end justify-between py-2.5">
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                ${
                  selectedPriceId === "price_individual_pro_monthly"
                    ? "border-2 border-[#0387FF]"
                    : ""
                }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $297
                </p>
                {subscribedPlanId === "price_individual_pro_monthly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month for 1 Account
                    </p>
                  </>
                )}
              </div>
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                  ${
                    selectedPriceId === "price_individual_pro_quarterly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $237
                </p>
                {subscribedPlanId === "price_individual_pro_quarterly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month for 1 Account
                    </p>
                  </>
                )}
              </div>
            </div>
            {(subscribedPlanId === "price_individual_pro_monthly" ||
              subscribedPlanId === "price_individual_pro_quarterly") && (
              <>
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
              </>
            )}
            <div className="flex flex-col">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[10px]">
                  Includes Basic, plus;
                </p>
                {coreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className=" text-[10px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                    Basic Features
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
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {type === "agencyBasic" && (
        <>
          <div
            className={`bg-[#F7F7F8] border p-5 rounded-[8px] shadow-md
                ${
                  subscribedPlanId === "price_agency_basic_monthly" ||
                  subscribedPlanId === "price_agency_basic_quarterly"
                    ? "border-[3px] border-[#0387FF] shadow-2xl"
                    : "border border-[#7E7E7E]"
                }`}
          >
            <div>
              <p
                className={`font-medium text-[#0387FF] ${
                  type === "user"
                    ? "text-[20px] font-urbanist text-left"
                    : "text-base text-center"
                } `}
              >
                {title}
              </p>
            </div>
            <div className="flex items-end justify-between py-2.5">
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                  ${
                    selectedPriceId === "price_agency_basic_monthly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $156
                </p>
                {subscribedPlanId === "price_agency_basic_monthly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month per user
                    </p>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                      Minimum 2 Users
                    </p>
                  </>
                )}
              </div>
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                  ${
                    selectedPriceId === "price_agency_basic_quarterly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $125
                </p>
                {subscribedPlanId === "price_agency_basic_quarterly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month per user
                    </p>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                      Minimum 2 Users
                    </p>
                  </>
                )}
              </div>
            </div>
            {(subscribedPlanId === "price_agency_basic_monthly" ||
              subscribedPlanId === "price_agency_basic_quarterly") && (
              <>
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
              </>
            )}
            <div className="flex flex-col">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[10px]">
                  Includes Basic, plus;
                </p>
                {coreFeaturesAgencyBasic.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className=" text-[10px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px] leading-4">
                    Premium Agency Option{" "}
                    <span className="text-[9px]">($997 one-time fee)</span>
                  </p>
                  <div
                    className={`cursor-pointer transition-transform duration-300 ${
                      showPremiumFeature ? "rotate-180" : ""
                    }`}
                    onClick={() => setShowPremiumFeature(!showPremiumFeature)}
                  >
                    <DropDownIcon />
                  </div>
                </div>
                {showPremiumFeature &&
                  premiumFeaturesAgencyBasic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                    Basic Features
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
                  basicFeaturesAgencyBasic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {type === "agencyPro" && (
        <>
          <div
            className={`bg-[#F7F7F8] border p-5 rounded-[8px] shadow-md
                ${
                  subscribedPlanId === "price_agency_pro_monthly" ||
                  subscribedPlanId === "price_agency_pro_quarterly"
                    ? "border-[3px] border-[#0387FF] shadow-2xl"
                    : "border border-[#7E7E7E]"
                }`}
          >
            <div>
              <p
                className={`font-medium text-[#0387FF] ${
                  type === "user"
                    ? "text-[20px] font-urbanist text-left"
                    : "text-base text-center"
                } `}
              >
                {title}
              </p>
            </div>
            <div className="flex items-end justify-between py-2.5">
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                  ${
                    selectedPriceId === "price_agency_pro_monthly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $237
                </p>
                {subscribedPlanId === "price_agency_pro_monthly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month per user
                    </p>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                      Minimum 2 Users
                    </p>
                  </>
                )}
              </div>
              <div
                className={`flex flex-col items-center justify-center w-[110px] h-[100px] rounded-[8px] p-2 bg-[#d9d9d9]
                  ${
                    selectedPriceId === "price_agency_pro_quarterly"
                      ? "border-2 border-[#0387FF]"
                      : ""
                  }`}
              >
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-[300] text-[31px] text-[#0387FF] text-center">
                  $190
                </p>
                {subscribedPlanId === "price_agency_pro_quarterly" ? (
                  <div className="font-normal text-[8px] text-[#FFFFFF] text-center bg-[#16A37B] rounded-[10px] py-1 px-2">
                    {subscription.status === "trialing" ? "Trial" : "Active"}
                  </div>
                ) : (
                  <>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                      Per Month per user
                    </p>
                    <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                      Minimum 2 Users
                    </p>
                  </>
                )}
              </div>
            </div>
            {(subscribedPlanId === "price_agency_pro_monthly" ||
              subscribedPlanId === "price_agency_pro_quarterly") && (
              <>
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
              </>
            )}
            <div className="flex flex-col">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[10px]">
                  Includes Basic, plus;
                </p>
                {coreFeaturesAgencyBasic.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className=" text-[10px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px] leading-4">
                    Premium Agency Option{" "}
                    <span className="text-[9px]">($997 one-time fee)</span>
                  </p>
                  <div
                    className={`cursor-pointer transition-transform duration-300 ${
                      showPremiumFeature ? "rotate-180" : ""
                    }`}
                    onClick={() => setShowPremiumFeature(!showPremiumFeature)}
                  >
                    <DropDownIcon />
                  </div>
                </div>
                {showPremiumFeature &&
                  premiumFeaturesAgencyBasic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                    Basic Features
                  </p>
                  <div
                    className={`cursor-pointer transition-transform duration-300 ${
                      showBasicFeaturePro ? "rotate-180" : ""
                    }`}
                    onClick={() =>
                      setShowBasicFeaturePro(!showBasicFeaturePro)
                    }
                  >
                    <DropDownIcon />
                  </div>
                </div>
                {showBasicFeaturePro &&
                  basicAndProFeatures_Basic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                <hr className="border border-[#6D6D6D]" />
                <div className="flex items-center justify-between gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#0387FF] my-[10px]">
                    Pro
                  </p>
                  <div
                    className={`cursor-pointer transition-transform duration-300 ${
                      showProFeaturePro ? "rotate-180" : ""
                    }`}
                    onClick={() => setShowProFeaturePro(!showProFeaturePro)}
                  >
                    <DropDownIcon />
                  </div>
                </div>
                {showProFeaturePro &&
                  basicAndProFeatures_Pro.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className=" text-[10px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
      {showModal && (
        <CancelModal
          onClose={() => setShowModal(false)}
          setSubscribedPlanId={setSubscribedPlanId}
          setSubscription={setSubscription}
          subscription={subscription}
          isPaused={subscription?.pause_collection !== null && subscription?.pause_collection !== undefined}
        />
      )}
    </div>
  );
};

export default SubscriptionCard;
