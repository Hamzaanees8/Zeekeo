import { createContext, useContext, useEffect, useState } from "react";
import { GetActiveSubscription } from "../../../../services/billings";
const BillingContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("Invoice");
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const [subscribedUsers, setSubscribedUsers] = useState();
  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
      setSubscription(data);
      setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
      setSubscribedUsers(data?.items?.data?.[0]?.quantity);
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
        activeTab,
        setActiveTab,
        subscribedPlanId,
        setSubscribedPlanId,
        subscribedUsers,
        setSubscribedUsers,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
export const useSubscription = () => useContext(BillingContext);
