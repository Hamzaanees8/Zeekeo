import { createContext, useContext, useEffect, useState } from "react";
import { GetActiveSubscription } from "../../../services/billings";
const BillingContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const [subscribedUsers, setSubscribedUsers] = useState();
  const [activeTab, setActiveTab] = useState("Invoices");
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
        subscribedPlanId,
        setSubscribedPlanId,
        subscribedUsers,
        setSubscribedUsers,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};
export const useSubscription = () => useContext(BillingContext);
