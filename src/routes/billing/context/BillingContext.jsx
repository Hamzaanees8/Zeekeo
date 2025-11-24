import { createContext, useContext, useEffect, useState } from "react";
import { GetActiveSubscription } from "../../../services/billings";
const BillingContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const [subscribedUsers, setSubscribedUsers] = useState();
  const [discounts, setDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState("Invoices");
  const [isLoading, setIsLoading] = useState(true);
  const [activeUsersCount, setActiveUsersCount] = useState(null);
  const [priceTiers, setPriceTiers] = useState(null);
  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const response = await GetActiveSubscription();
        setSubscription(response?.subscription);
        setDiscounts(response?.discounts || []);
        setSubscribedPlanId(
          response?.subscription?.items?.data?.[0]?.price?.lookup_key,
        );
        setSubscribedUsers(response?.subscription?.items?.data?.[0]?.quantity);
        setActiveUsersCount(response?.activeUsersCount);
        setPriceTiers(response?.priceTiers);
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);
  return (
    <BillingContext.Provider
      value={{
        subscription,
        setSubscription,
        invoices,
        setInvoices,
        subscribedPlanId,
        setSubscribedPlanId,
        subscribedUsers,
        setSubscribedUsers,
        discounts,
        setDiscounts,
        activeTab,
        setActiveTab,
        isLoading,
        activeUsersCount,
        setActiveUsersCount,
        priceTiers,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
export const useSubscription = () => useContext(BillingContext);
