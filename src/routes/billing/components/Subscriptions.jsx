import { useEffect, useState } from "react";
import Subscription from "./Subscription";
import SubscriptionCard from "./SubscriptionCard";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionQuantity,
} from "../../../services/billings";
import { useSubscription } from "../context/BillingContext";
import toast from "react-hot-toast";

const Subscriptions = () => {
  const { subscription, setSubscription, setInvoices } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
      setSubscription(data);
      setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
    };

    fetchSubscription();
  }, []);

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
      }
      console.error(err);
      return false;
    }
  };
  return (
    <div className="grid grid-cols-4 gap-5 items-start">
      <div className="flex flex-col gap-y-[16px]">
        {subscription && (
          <Subscription
            subscription={subscription}
            subscribedPlanId={subscribedPlanId}
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
        )}
        <SubscriptionCard
          type="user"
          title="Add Users"
          onAddUser={handleAddUsers}
        />
      </div>

      {subscribedPlanId !== "price_individual_basic_quarterly" &&
        subscribedPlanId !== "price_individual_basic_monthly" && (
          <SubscriptionCard
            type="basic"
            title="Basic"
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
        )}
      {subscribedPlanId !== "price_individual_pro_monthly" &&
        subscribedPlanId !== "price_individual_pro_quarterly" && (
          <SubscriptionCard
            type="pro"
            title="Professional"
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
        )}
      {subscribedPlanId !== "price_agency_basic_monthly" &&
        subscribedPlanId !== "price_agency_basic_quarterly" && (
          <SubscriptionCard
            type="agencyBasic"
            title="Agency and Enterprise Basic"
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
        )}
      {subscribedPlanId !== "price_agency_pro_monthly" &&
        subscribedPlanId !== "price_agency_pro_quarterly" && (
          <SubscriptionCard
            type="agencyPro"
            title="Agency and Enterprise Pro"
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
        )}
    </div>
  );
};

export default Subscriptions;
