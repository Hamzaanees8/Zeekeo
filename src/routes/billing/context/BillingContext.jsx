import { createContext, useContext, useState } from "react";
const BillingContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState([]);
  const [invoices, setInvoices] = useState([]);
  return (
    <BillingContext.Provider
      value={{ subscription, setSubscription, invoices, setInvoices }}
    >
      {children}
    </BillingContext.Provider>
  );
};
export const useSubscription = () => useContext(BillingContext);
