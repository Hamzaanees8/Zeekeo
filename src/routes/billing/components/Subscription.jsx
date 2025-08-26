import { useEffect, useState } from "react";
import {
  ArrowDown,
  DropDownIcon,
  RoundedCheck,
} from "../../../components/Icons";
import CancelModal from "./CancelModal";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
} from "../../../services/billings";
import toast from "react-hot-toast";
import { useSubscription } from "../context/BillingContext";
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
const Subscription = () => {
  const { subscription, setSubscription, setInvoices } = useSubscription();
  const [showBasic, setShowBasic] = useState(false);
  const [showBasicFeature, setShowBasicFeature] = useState(true);
  const [renewSubscription, setRenewSubscription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
     // console.log('subscription', data)
      setSubscription(data);
    };

    fetchSubscription();
  }, []);
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
    <div className="flex flex-col gap-y-[45px]">
      {subscription && (
        <div className="flex flex-col gap-y-5">
          <p className="text-[20px] font-medium">Subscription</p>
          <div className="flex flex-col py-[18px] px-[24px] bg-[#FFFFFF] border border-[#7E7E7E] gap-y-[27px]">
            <div className="flex items-center justify-between ">
              <div>
                <p className="font-medium text-[18px] text-[#0387FF] font-urbanist">
                  {subscription?.items?.data[0]?.plan?.nickname}
                </p>
                <p className="font-medium text-[10px] text-[#6D6D6D] italic">
                  ${subscription?.plan?.amount_decimal / 100}/
                  {subscription?.plan?.interval.charAt(0).toUpperCase() +
                    subscription?.plan?.interval.slice(1)}
                </p>
              </div>
              {renewSubscription ? (
                <button className="border cursor-pointer border-[#16A37B] px-[14.5px] py-[5px] text-[16px] text-[#16A37B] bg-white font-medium font-urbanist">
                  Renew Subscription
                </button>
              ) : (
                <div>
                  <p className="font-medium text-[10px] text-[#6D6D6D]">
                    Subscription Renews
                  </p>
                  <p className="font-normal text-[14px] text-[#0387FF] ">
                    {formatUnixTimestamp(
                      subscription?.items?.data[0]?.current_period_end,
                    )}
                  </p>
                </div>
              )}

              <div
                className={`cursor-pointer transition-transform duration-300 ${
                  showBasic ? "rotate-180" : ""
                }`}
                onClick={() => setShowBasic(!showBasic)}
              >
                <ArrowDown />
              </div>
            </div>
            {showBasic && (
              <div className="flex flex-col pt-[9px] px-[50px]">
                <div className="flex flex-col gap-y-2.5">
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
                    <p className="text-[14px] font-normal text-[#6D6D6D]">
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
                        <p className="text-[12px] font-normal text-[#6D6D6D]">
                          {feature}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {showBasic && (
              <div className="flex items-end justify-between px-[50px] pb-[32px]">
                <div className="flex flex-col gap-y-[7px] items-center justify-center w-[115px]">
                  <p className="font-medium text-center text-[11px] text-[#6D6D6D] italic">
                    Quarterly
                  </p>
                  <p className="font-medium text-[36px] text-[#0387FF] font-urbanist text-center">
                    $157
                  </p>
                  <p className="font-normal text-[11px] text-[#6D6D6D] italic text-center">
                    Per Month for 1 Account
                  </p>
                  <button
                    onClick={() =>
                      handleSwitchPlan("price_individual_basic_quarterly")
                    }
                    className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] font-medium font-urbanist"
                  >
                    Switch Plan
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="border cursor-pointer border-[#7E7E7E] px-[14.5px] py-[5px] text-[16px] text-[#7E7E7E] bg-white font-medium font-urbanist"
                >
                  Cancel Subscription
                </button>
                {showModal && (
                  <CancelModal onClose={() => setShowModal(false)} />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
