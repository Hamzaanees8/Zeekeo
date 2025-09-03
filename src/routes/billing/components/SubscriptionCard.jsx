import { useState } from "react";
import { DropDownIcon, RoundedCheck } from "../../../components/Icons";
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
const SubscriptionCard = ({
  title,
  type,
  onSwitchPlan,
  onAddUser,
  selectedPriceId,
  setSelectedPriceId,
}) => {
  const [showBasicFeature, setShowBasicFeature] = useState(true);
  const [showBasicFeaturePro, setShowBasicFeaturePro] = useState(true);
  const [showProFeaturePro, setShowProFeaturePro] = useState(true);
  const [showPremiumFeature, setShowPremiumFeature] = useState(true);
  return (
    <div className="bg-[#F7F7F8] border border-[#7E7E7E] p-5">
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
      {type === "user" && (
        <>
          <div className="flex items-end justify-start w-full">
            <div className="flex flex-col items-start">
              <p className="font-medium text-left text-[11px] text-[#6D6D6D] italic">
                $197/Month
              </p>
              <p className="font-medium text-[11px] text-[#6D6D6D] italic text-left">
                $157/Quarterly
              </p>
              <p className="font-normal text-[11px] text-[#6D6D6D] italic text-left mt-2.5">
                Per Month for 1 Account
              </p>
              <button
                className="w-[220px] border cursor-pointer mt-2.5 border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                onClick={() => onAddUser("price_individual_pro_monthly")}
              >
                Add Users
              </button>
            </div>
          </div>
        </>
      )}
      {type === "basic" && (
        <>
          <div className="flex items-end justify-between py-2.5">
            <div
              onClick={() =>
                setSelectedPriceId("price_individual_basic_monthly")
              }
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
                Min 2 Users Required
              </p>
            </div>
            <div
              onClick={() =>
                setSelectedPriceId("price_individual_basic_quarterly")
              }
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
                $157
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
          </div>
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
        </>
      )}
      {type === "basic" && (
        <>
          {(selectedPriceId === "price_individual_basic_quarterly" ||
            selectedPriceId === "price_individual_basic_monthly") && (
            <button
              onClick={() => {
                onSwitchPlan(selectedPriceId);
              }}
              className="border my-2.5 cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] h-[32px] w-full text-[16px] text-[#7E7E7E] font-medium font-urbanist"
            >
              Switch Plan
            </button>
          )}
        </>
      )}
      {type === "pro" && (
        <>
          <div className="flex items-end justify-between py-2.5">
            <div
              onClick={() =>
                setSelectedPriceId("price_individual_pro_monthly")
              }
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
            <div
              onClick={() =>
                setSelectedPriceId("price_individual_pro_quarterly")
              }
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
                $125
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
          </div>
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
        </>
      )}
      {type === "pro" && (
        <>
          {(selectedPriceId === "price_individual_pro_monthly" ||
            selectedPriceId === "price_individual_pro_quarterly") && (
            <button
              onClick={() => {
                onSwitchPlan(selectedPriceId);
              }}
              className="border my-2.5 cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] h-[32px] w-full text-[16px] text-[#7E7E7E] font-medium font-urbanist"
            >
              Switch Plan
            </button>
          )}
        </>
      )}
      {type === "agencyBasic" && (
        <>
          <div className="flex items-end justify-between py-2.5">
            <div
              onClick={() => setSelectedPriceId("price_agency_basic_monthly")}
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
            <div
              onClick={() =>
                setSelectedPriceId("price_agency_basic_quarterly")
              }
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
          </div>
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
        </>
      )}
      {type === "agencyBasic" && (
        <>
          {(selectedPriceId === "price_agency_basic_monthly" ||
            selectedPriceId === "price_agency_basic_quarterly") && (
            <button
              onClick={() => {
                onSwitchPlan(selectedPriceId);
              }}
              className="border my-2.5 cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] h-[32px] w-full text-[16px] text-[#7E7E7E] font-medium font-urbanist"
            >
              Switch Plan
            </button>
          )}
        </>
      )}
      {type === "agencyPro" && (
        <>
          <div className="flex items-end justify-between py-2.5">
            <div
              onClick={() => setSelectedPriceId("price_agency_pro_monthly")}
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
            <div
              onClick={() => setSelectedPriceId("price_agency_pro_quarterly")}
              className={`flex flex-col items-center justify-center w-[115px] rounded-[8px] p-2 cursor-pointer bg-[#d9d9d9] 
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
                $197
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center">
                Per Month for 1 Account
              </p>
              <p className="font-normal text-[8px] text-[#6D6D6D] italic text-center mb-[6px]">
                Min 2 Users Required
              </p>
            </div>
          </div>
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
                  onClick={() => setShowBasicFeaturePro(!showBasicFeaturePro)}
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
        </>
      )}
      {type === "agencyPro" && (
        <>
          {(selectedPriceId === "price_agency_pro_monthly" ||
            selectedPriceId === "price_agency_pro_quarterly") && (
            <button
              onClick={() => {
                onSwitchPlan(selectedPriceId);
              }}
              className="border my-2.5 cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] h-[32px] w-full text-[16px] text-[#7E7E7E] font-medium font-urbanist"
            >
              Switch Plan
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionCard;
