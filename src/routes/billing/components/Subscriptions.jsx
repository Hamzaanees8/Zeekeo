import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SubscriptionCard from "./SubscriptionCard";
import {
  GetActiveSubscription,
  GetBillingInvoices,
  UpdateSubscriptionPlan,
  UpdateSubscriptionSeats,
} from "../../../services/billings";
import { useSubscription } from "../context/BillingContext";
import { useAuthStore } from "../../stores/useAuthStore";
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
  const {
    subscription,
    setSubscription,
    setInvoices,
    subscribedPlanId,
    setSubscribedPlanId,
    subscribedUsers,
    setSubscribedUsers,
    isLoading,
  } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);
  const price = priceMap[subscribedPlanId] || null;
  const interval = intervalMap[subscribedPlanId] || null;
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();

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
      const result = await UpdateSubscriptionSeats(newQuantity);
      if (result) {
        toast.success("User Added successfully!");
        const data = await GetActiveSubscription();
        setSubscription(data?.subscription);
        setSubscribedPlanId(
          data?.subscription?.items?.data[0]?.price?.lookup_key,
        );
        setSubscribedUsers(data?.subscription?.items?.data?.[0]?.quantity);
        setShowAddUserModal(false);

        // Update currentUser.seats.billed in auth store
        const { currentUser, setUser } = useAuthStore.getState();
        if (currentUser) {
          setUser({
            ...currentUser,
            seats: {
              ...currentUser.seats,
              billed: newQuantity,
            },
          });
        }

        const invoicedata = await GetBillingInvoices();
        if (invoicedata?.invoices) {
          const formatted = invoicedata.invoices.map(invoice => ({
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
  const handleSwitchPlan = async (
    planId,
    seats = 1,
    premium = false,
    agencyUsername = null,
  ) => {
    setIsSwitchingPlan(true);
    try {
      // For agency plans, seats should be at least 2, for individual plans it's 1
      const isAgencyPlan = planId?.includes("agency");
      const finalSeats = isAgencyPlan ? seats || 2 : 1;

      const result = await UpdateSubscriptionPlan(
        planId,
        finalSeats,
        premium,
        agencyUsername,
      );
      if (result) {
        // Check if this is an agency creation response (contains sessionToken)
        if (
          result.sessionToken &&
          result.refreshToken &&
          result.type === "agency"
        ) {
          // This is an agency creation - log in with the new agency credentials
          toast.success(
            "Agency created successfully! Redirecting to your new agency dashboard...",
          );
          setTokens(result.sessionToken, result.refreshToken);
          setShowConfirmationModal(false);
          // Reload the page to initialize the new agency session
          setTimeout(() => {
            navigate("/");
          }, 1500);
          return true;
        }

        // Normal plan update
        toast.success("Plan updated successfully!");
        setSelectedPriceId(null);
        const data = await GetActiveSubscription();
        setSubscription(data?.subscription);
        setSubscribedPlanId(
          data?.subscription?.items?.data[0]?.price?.lookup_key,
        );
        setSubscribedUsers(data?.subscription?.items?.data?.[0]?.quantity);
        setShowConfirmationModal(false);
        const invoicedata = await GetBillingInvoices();
        if (invoicedata?.invoices) {
          const formatted = invoicedata.invoices.map(invoice => ({
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
    } finally {
      setIsSwitchingPlan(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg
          className="animate-spin h-12 w-12 text-[#0387FF]"
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
    );
  }

  return (
    <div className="grid grid-cols-4 gap-5 items-start">
      {plans.map(plan => (
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
            isSwitchingPlan={isSwitchingPlan}
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
