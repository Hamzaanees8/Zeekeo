import { useState } from "react";
import {
  ArrowDown,
  DropDownIcon,
  RoundedCheck,
} from "../../../components/Icons";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionQuantity,
} from "../../../services/billings";
import toast from "react-hot-toast";
import { useSubscription } from "../context/BillingContext";
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
const SubscriptionCard = ({ title, type }) => {
  const { subscription, setSubscription, setInvoices } = useSubscription();
  const [show, setShow] = useState(false);
  const [showBasicFeature, setShowBasicFeature] = useState(true);
  const [showPremiumFeature, setShowPremiumFeature] = useState(true);

  const handleAddUsers = async () => {
    try {
      console.log("current quantity", subscription.items?.data?.[0]?.quantity);
      const currentQty = subscription.items?.data?.[0]?.quantity;

      if (!currentQty) {
        toast.error("Failed to add user!");
        return;
      }

      const newQuantity = currentQty + 1;
      const result = await UpdateSubscriptionQuantity(newQuantity);
      if (result) {
        toast.success("User Added successfully!");
        setShow(!show);
        const data = await GetActiveSubscription();
        setSubscription(data);
        const invoicedata = await GetBillingInvoices();
        if (invoicedata) {
          const formatted = invoicedata.map(invoice => ({
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            number: invoice.number,
            description:
              invoice.lines?.data?.map(line => line.description).join(", ") ||
              "No description",
            amount: `$${(invoice.total / 100).toFixed(2)}`,
            url: invoice.hosted_invoice_url || "#",
          }));
          setInvoices(formatted);
        }
        return true;
      } else {
        toast.error("Failed to add user. Please try again.");
        return false;
      }
    } catch (error) {
      toast.error("Something went wrong while adding user to your plan.");
      console.error(error);
      return false;
    }
  };

  const handleSwitchPlan = async (planId, quantity = 1) => {
    try {
      const result = await UpdateSubscriptionPlan(planId, quantity);
      if (result) {
        toast.success("Plan updated successfully!");
        const data = await GetActiveSubscription();
        setSubscription(data);
        const invoicedata = await GetBillingInvoices();
        if (invoicedata) {
          const formatted = invoicedata.map(invoice => ({
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            number: invoice.number,
            description:
              invoice.lines?.data?.map(line => line.description).join(", ") ||
              "No description",
            amount: `$${(invoice.total / 100).toFixed(2)}`,
            url: invoice.hosted_invoice_url || "#",
          }));
          setInvoices(formatted);
        }
        return true;
      } else {
        toast.error("Failed to update plan. Please try again.");
        return false;
      }
    } catch (error) {
      toast.error("Something went wrong while updating your plan.");
      console.error(error);
      return false;
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#7E7E7E] ">
      <div
        className="flex items-center justify-between px-[24px] py-[18px] cursor-pointer"
        onClick={() => setShow(!show)}
      >
        <p className="text-[20px] font-medium text-[#0387FF] font-urbanist">
          {title}
        </p>
        <div
          className={`cursor-pointer transition-transform duration-300 ${
            show ? "rotate-180" : ""
          }`}
        >
          <ArrowDown />
        </div>
      </div>
      {type === "user" && (
        <>
          {show && (
            <div className="flex items-end justify-center px-[100px] pb-[32px]">
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[115px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $197
                </p>
                <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                  Per Month for 1 Account
                </p>
                <button
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                  onClick={() =>
                    handleAddUsers("price_individual_pro_monthly")
                  }
                >
                  Add Users
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {type === "pro" && (
        <>
          {show && (
            <div className="flex flex-col px-[80px] pb-9">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                  Includes Basic, plus;
                </p>
                {coreFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className="text-[12px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
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
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
      {type === "pro" && (
        <>
          {show && (
            <div className="flex items-end justify-between px-[100px] pb-[32px]">
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[115px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $297
                </p>
                <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                  Per Month for 1 Account
                </p>
                <button
                  onClick={() =>
                    handleSwitchPlan("price_individual_pro_monthly")
                  }
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[115px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $237
                </p>
                <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                  Per Month for 1 Account
                </p>
                <button
                  onClick={() =>
                    handleSwitchPlan("price_individual_pro_quarterly")
                  }
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {type === "agencyBasic" && (
        <>
          {show && (
            <div className="flex flex-col px-[80px] pb-9">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                  Includes Basic, plus;
                </p>
                {coreFeaturesAgencyBasic.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className="text-[12px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                    Premium Agency Option($997 one-time fee)
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
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                <div className="flex items-center gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
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
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
      {type === "agencyBasic" && (
        <>
          {show && (
            <div className="flex items-end justify-between px-[80px] pb-[32px]">
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[130px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $156
                </p>
                <div className="flex flex-col">
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Per Month for 1 Account
                  </p>
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Min 2 Users Required
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSwitchPlan("price_agency_basic_monthly")
                  }
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[130px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $125
                </p>
                <div className="flex flex-col">
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Per Month for 1 Account
                  </p>
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Min 2 Users Required
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSwitchPlan("price_agency_basic_quarterly")
                  }
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {type === "agencyPro" && (
        <>
          {show && (
            <div className="flex flex-col px-[80px] pb-9">
              <div className="flex flex-col gap-y-2">
                <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                  Includes Basic, plus;
                </p>
                {coreFeaturesAgencyBasic.map((feature, index) => (
                  <div
                    key={index}
                    className="grid gap-x-[6px] items-start"
                    style={{ gridTemplateColumns: "20px auto" }}
                  >
                    <RoundedCheck />
                    <p className="text-[12px] font-normal text-[#6D6D6D]">
                      {feature}
                    </p>
                  </div>
                ))}
                <div className="flex items-center gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                    Premium Agency Option($997 one-time fee)
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
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                <div className="flex items-center gap-x-[30px]">
                  <p className="text-[14px] font-normal text-[#6D6D6D] my-[9px]">
                    Basic and Pro Features
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
                {showBasicFeature && (
                  <p className="text-[#7E7E7E] font-normal text-xs mb-1">
                    Basic:
                  </p>
                )}
                {showBasicFeature &&
                  basicAndProFeatures_Basic.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
                {showBasicFeature && (
                  <p className="text-[#7E7E7E] font-normal text-xs mb-1">
                    Pro:
                  </p>
                )}
                {showBasicFeature &&
                  basicAndProFeatures_Pro.map((feature, index) => (
                    <div
                      key={index}
                      className="grid gap-x-[6px] items-start"
                      style={{ gridTemplateColumns: "20px auto" }}
                    >
                      <RoundedCheck />
                      <p className="text-[12px] font-normal text-[#6D6D6D]">
                        {feature}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
      {type === "agencyPro" && (
        <>
          {show && (
            <div className="flex items-end justify-between px-[80px] pb-[32px]">
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[130px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Monthly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $237
                </p>
                <div className="flex flex-col">
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Per Month for 1 Account
                  </p>
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Min 2 Users Required
                  </p>
                </div>
                <button
                  onClick={() => handleSwitchPlan("price_agency_pro_monthly")}
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
              <div className="flex flex-col gap-y-[7px] items-center justify-center w-[130px]">
                <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                  Quarterly
                </p>
                <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                  $190
                </p>
                <div className="flex flex-col">
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Per Month for 1 Account
                  </p>
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Min 2 Users Required
                  </p>
                </div>
                <button
                  onClick={() =>
                    handleSwitchPlan("price_agency_pro_quarterly")
                  }
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                >
                  Switch Plan
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubscriptionCard;
