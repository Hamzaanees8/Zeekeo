import { createContext, useContext, useState } from "react";

// Create Context
const BillingContext = createContext();

// Provider
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

// Custom hook
export const useSubscription = () => useContext(BillingContext);
