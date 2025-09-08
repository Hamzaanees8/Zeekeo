import { useEffect, useState } from "react";
import SubscriptionCard from "./SubscriptionCard";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionQuantity,
} from "../../../services/billings";
import { useSubscription } from "../context/BillingContext";
import toast from "react-hot-toast";
const priceMap = {
  price_agency_basic_monthly: 156,
  price_agency_basic_quarterly: 125,
  price_agency_pro_monthly: 237,
  price_agency_pro_quarterly: 190,
};
const intervalMap = {
  price_agency_basic_monthly: "monthly",
  price_agency_basic_quarterly: "quarterly",
  price_agency_pro_monthly: "monthly",
  price_agency_pro_quarterly: "quarterly",
};

const plans = [
  { type: "basic", title: "Basic" },
  { type: "pro", title: "Professional" },
  { type: "agencyBasic", title: "Agency and Enterprise Basic" },
  { type: "agencyPro", title: "Agency and Enterprise Pro" },
];


const Subscriptions = () => {
  const { subscription, setSubscription, setInvoices } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [subscribedUsers, setSubscribedUsers] = useState();
  const price = priceMap[subscribedPlanId] || null;
  const interval = intervalMap[subscribedPlanId] || null;
  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
      setSubscription(data);
      setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
      setSubscribedUsers(data?.items?.data?.[0]?.quantity);
    };

    fetchSubscription();
  }, []);

  const handleAddUsers = async (usersToAdd = 1) => {
    console.log("users to add", usersToAdd);
    try {
      console.log("current quantity", subscription.items?.data?.[0]?.quantity);
      const currentQty = subscription.items?.data?.[0]?.quantity;

      if (!currentQty) {
        toast.error("Failed to add user!");
        return;
      }

      const newQuantity = currentQty + usersToAdd;
      const result = await UpdateSubscriptionQuantity(newQuantity);
      if (result) {
        toast.success("User Added successfully!");
        const data = await GetActiveSubscription();
        setSubscription(data);
        setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
        setSubscribedUsers(data?.items?.data?.[0]?.quantity);
        setShowAddUserModal(false);
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
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Something went wrong while adding user to your plan.");
      }
      console.error(err);
      return false;
    }
  };
  const handleSwitchPlan = async (planId, quantity = 1) => {
    try {
      const result = await UpdateSubscriptionPlan(planId, quantity);
      if (result) {
        toast.success("Plan updated successfully!");
        setSelectedPriceId(null);
        const data = await GetActiveSubscription();
        setSubscription(data);
        setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
        setSubscribedUsers(data?.items?.data?.[0]?.quantity);
        setShowConfirmationModal(false);
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
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Something went wrong while updating your plan.");
        setShowConfirmationModal(false);
      }
      console.error(err);
      return false;
    }
  };

  
const planIdToTypeMap = {
  // Individual Basic
  price_individual_basic_monthly: "basic",
  price_individual_basic_quarterly: "basic",

  // Agency Basic
  price_agency_basic_monthly: "agencyBasic",
  price_agency_basic_quarterly: "agencyBasic",

  // Individual Pro
  price_individual_pro_monthly: "pro",
  price_individual_pro_quarterly: "pro",

  // Agency Pro
  price_agency_pro_monthly: "agencyPro",
  price_agency_pro_quarterly: "agencyPro",
};

const activeType = planIdToTypeMap[subscribedPlanId];

const orderedPlans = [...plans].sort((a, b) => {
  if (a.type === activeType) return -1;
  if (b.type === activeType) return 1;
  return 0;
});


  return (
    <div className="grid grid-cols-4 gap-5 items-start">
      {subscribedPlanId && orderedPlans.map(plan => (
        <div key={plan.type} className="flex flex-col gap-y-[16px]">
          <SubscriptionCard
            type={plan.type}
            title={plan.title}
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
            subscription={subscription}
            subscribedPlanId={subscribedPlanId}
            setSubscribedPlanId={setSubscribedPlanId}
            setSubscription={setSubscription}
            setShowConfirmationModal={setShowConfirmationModal}
            showConfirmationModal={showConfirmationModal}
          />

          {/* Handle "Add Users" */}
          {plan.type === "agencyBasic" &&
            (subscribedPlanId === "price_agency_basic_monthly" ||
              subscribedPlanId === "price_agency_basic_quarterly") && (
              <SubscriptionCard
                type="useragencybasic"
                title="Add Users"
                onAddUser={handleAddUsers}
                showAddUserModal={showAddUserModal}
                setShowAddUserModal={setShowAddUserModal}
                subscribedUsers={subscribedUsers}
                price={price}
                interval={interval}
              />
            )}

          {plan.type === "agencyPro" &&
            (subscribedPlanId === "price_agency_pro_monthly" ||
              subscribedPlanId === "price_agency_pro_quarterly") && (
              <SubscriptionCard
                type="useragencypro"
                title="Add Users"
                onAddUser={handleAddUsers}
                showAddUserModal={showAddUserModal}
                setShowAddUserModal={setShowAddUserModal}
                subscribedUsers={subscribedUsers}
                price={price}
                interval={interval}
              />
            )}
        </div>
      ))}
    </div>
  );
};

export default Subscriptions;
