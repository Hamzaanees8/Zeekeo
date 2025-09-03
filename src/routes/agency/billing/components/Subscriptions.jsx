import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSubscription } from "../context/BillingContext";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionQuantity,
} from "../../../../services/billings";
import Subscription from "../../../billing/components/Subscription";
import SubscriptionCard from "../../../billing/components/SubscriptionCard";

const Subscriptions = () => {
  const { subscription, setSubscription, setInvoices } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  // useEffect(() => {
  //   const fetchSubscription = async () => {
  //     const data = await GetActiveSubscription();
  //     setSubscription(data);
  //     setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
  //   };

  //   fetchSubscription();
  // }, []);

  const handleAddUsers = async () => {
    try {
      console.log("current quantity", subscription.items?.data?.[0]?.quantity);
      const currentQty = subscription.items?.data?.[0]?.quantity;

      if (!currentQty) {
        toast.error("Failed to add user!");
        return;
      }

      const newQuantity = currentQty + 1;
      //const result = await UpdateSubscriptionQuantity(newQuantity);
      if (result) {
        toast.success("User Added successfully!");
        const data = await GetActiveSubscription();
        setSubscription(data);
        const invoicedata = await GetBillingInvoices();
        if (invoicedata) {
          const formatted = invoicedata.map(invoice => ({
            Date: new Date(invoice.created * 1000).toLocaleDateString(),
            Number: invoice.number,
            Description:
              invoice.lines?.data?.map(line => line.description).join(", ") ||
              "No description",
            Amount: `$${(invoice.total / 100).toFixed(2)}`,
            URL: invoice.hosted_invoice_url || "#",
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
        //toast.error("Something went wrong while adding user to your plan.");
      }
      console.error(err);
      return false;
    }
  };
  const handleSwitchPlan = async (planId, quantity = 1) => {
    try {
      //const result = await UpdateSubscriptionPlan(planId, quantity);
      if (result) {
        toast.success("Plan updated successfully!");
        setSelectedPriceId(null);
        const data = await GetActiveSubscription();
        setSubscription(data);
        const invoicedata = await GetBillingInvoices();
        if (invoicedata) {
          const formatted = invoicedata.map(invoice => ({
            Date: new Date(invoice.created * 1000).toLocaleDateString(),
            Number: invoice.number,
            Description:
              invoice.lines?.data?.map(line => line.description).join(", ") ||
              "No description",
            Amount: `$${(invoice.total / 100).toFixed(2)}`,
            URL: invoice.hosted_invoice_url || "#",
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
        //toast.error("Something went wrong while updating your plan.");
      }
      console.error(err);
      return false;
    }
  };
  console.log("subscriptions", subscription);
  return (
    <div className="grid grid-cols-4 gap-5 items-start">
      {subscription.length > 0 && subscription && (
        <div className="flex flex-col gap-y-[16px]">
          <Subscription
            subscription={subscription}
            subscribedPlanId={subscribedPlanId}
            onSwitchPlan={handleSwitchPlan}
            selectedPriceId={selectedPriceId}
            setSelectedPriceId={setSelectedPriceId}
          />
          <SubscriptionCard
            type="user"
            title="Add Users"
            onAddUser={handleAddUsers}
          />
        </div>
      )}

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
