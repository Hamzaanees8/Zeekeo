import { createContext, useContext, useEffect, useState } from "react";
import { getAgency } from "../../../../../services/admin";
import { useParams } from "react-router";
const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const { id } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [agencyPaidDate, setAgencyPaidDate] = useState("");
  const [salesRep, setSalesRep] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [freeUsers, setFreeUsers] = useState("");
  const [minUsers, setMinUsers] = useState("");
  const [plan, setPlan] = useState("");
  const [planType, setPlanType] = useState("");
  const [subPausedUntil, setSubPausedUntil] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [whiteLabelDomain, setWhiteLabelDomain] = useState("");
  const [whiteLabelIconWidth, setWhiteLabelIconWidth] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [allowLinkedIn, setAllowLinkedIn] = useState(true);
  const [enableGroups, setEnableGroups] = useState(true);
  const [enablePremium, setEnablePremium] = useState(false);
  const [allowDeactivate, setAllowDeactivate] = useState(true);
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2026-12-14");
  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const data = await getAgency(id);
        setEmail(data.email || "");
        setEnablePremium(data.enabled || false);
        console.log("agency data...", data);
      } catch {
        console.log("Failed to fetch agency");
      }
    };
    if (id) {
      fetchAgency();
    }
  }, [id]);
  return (
    <EditContext.Provider
      value={{
        email,
        setEmail,
        password,
        setPassword,
        notificationEmail,
        setNotificationEmail,
        agencyPaidDate,
        setAgencyPaidDate,
        salesRep,
        setSalesRep,
        accountManager,
        setAccountManager,
        leadSource,
        setLeadSource,
        freeUsers,
        setFreeUsers,
        minUsers,
        setMinUsers,
        plan,
        setPlan,
        planType,
        setPlanType,
        subPausedUntil,
        setSubPausedUntil,
        couponCode,
        setCouponCode,
        whiteLabelDomain,
        setWhiteLabelDomain,
        whiteLabelIconWidth,
        setWhiteLabelIconWidth,
        stripeCustomerId,
        setStripeCustomerId,
        allowLinkedIn,
        setAllowLinkedIn,
        enableGroups,
        setEnableGroups,
        enablePremium,
        setEnablePremium,
        allowDeactivate,
        setAllowDeactivate,
        dateTo,
        setDateTo,
        dateFrom,
        setDateFrom,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};
export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within an EditProvider");
  }
  return context;
};
