import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSubscription } from "../context/BillingContext";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionQuantity,
} from "../../../../services/billings";
import SubscriptionCard from "../../../billing/components/SubscriptionCard";
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
    try {
      console.log("current quantity", subscription.items?.data?.[0]?.quantity);
      const currentQty = subscription.items?.data?.[0]?.quantity;

      if (!currentQty) {
        toast.error("Failed to add user!");
        return;
      }

      const newQuantity = currentQty + usersToAdd;
      const result = true; /*await UpdateSubscriptionQuantity(newQuantity);*/
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
        toast.error("Something went wrong while adding user to your plan.");
      }
      console.error(err);
      return false;
    }
  };
  const handleSwitchPlan = async (planId, quantity = 1) => {
    try {
      const result = true; /*await UpdateSubscriptionPlan(planId, quantity);*/
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
        toast.error("Something went wrong while updating your plan.");
        setShowConfirmationModal(false);
      }
      console.error(err);
      return false;
    }
  };
  console.log("subscriptions", subscription);
  return (
    <div className="grid grid-cols-4 gap-5 items-start">
      <SubscriptionCard
        type="basic"
        title="Basic"
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
      <SubscriptionCard
        type="pro"
        title="Professional"
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
      <div className="flex flex-col gap-y-[16px]">
        <SubscriptionCard
          type="agencyBasic"
          title="Agency and Enterprise Basic"
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
        {(subscribedPlanId === "price_agency_basic_monthly" ||
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
      </div>
      <div className="flex flex-col gap-y-[16px]">
        <SubscriptionCard
          type="agencyPro"
          title="Agency and Enterprise Pro"
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
        {(subscribedPlanId === "price_agency_pro_monthly" ||
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
    </div>
  );
};

export default Subscriptions;
