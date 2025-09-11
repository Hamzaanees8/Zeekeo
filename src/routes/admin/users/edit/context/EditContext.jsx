import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { getUser } from "../../../../../services/admin";

const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const { id } = useParams();
  const [editId, setEditId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [stripe, setStripe] = useState("");
  const [agency, setAgency] = useState("");

  const [plan, setPlan] = useState("");
  const [planType, setPlanType] = useState("");
  const [paidUntil, setPaidUntil] = useState("");
  const [subPausedUntil, setSubPausedUntil] = useState("");

  const [dockerVersion, setDockerVersion] = useState("");
  const [devDockerName, setDevDockerName] = useState("");

  const [profileViews, setProfileViews] = useState("");
  const [invites, setInvites] = useState("");
  const [twitterLikes, setTwitterLikes] = useState("");
  const [inMails, setInMails] = useState("");
  const [sequenceMsgs, setSequenceMsgs] = useState("");
  const [globalEnrich, setGlobalEnrich] = useState("");

  const [proxyCountry, setProxyCountry] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2026-12-14");

  //modals state
  const [admin, setAdmin] = useState("");
  const [userCreated, setUserCreated] = useState("");
  const [address, setAddress] = useState("");
  const [vat, setVat] = useState("");
  const [linkedinEmail, setLinkedinEmail] = useState("");
  const [linkedinName, setLinkedinName] = useState("");
  const [linkedinDate, setLinkedinDate] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinCookiesUpdate, setLinkedinCookiesUpdate] = useState("");
  const [linkedinCredUpdate, setLinkedinCredUpdate] = useState("");
  const [twitterCookiesUpdate, setTwitterCookiesUpdate] = useState("");
  const [twitterCredUpdate, setTwitterCredUpdate] = useState("");
  

  useEffect(() => {
  const fetchUser = async () => {
   try {
    const data = await getUser(id);
    console.log("User data...", data);
    setEmail(data.email || "");
    setPassword(data.password || "");
    setFirstName(data.first_name || "");
    setLastName(data.last_name || "");
    setCompany(data.company || "");
    setStripe(data.stripe_customer_id || "");
    setAgency(data.agency || "");
    setPlan(data.plan || "");
    setPlanType(data.plan_type || "Basic");
    setPaidUntil(data.paid_until || "");
    setSubPausedUntil(data.sub_paused_until || "");
    setDockerVersion(data.docker_version || "");
    setDevDockerName(data.dev_docker_name || "");
    setProfileViews(data.settings.limits.linkedin_view || "");
    setInvites(data.settings.limits.linkedin_invite || "");
    setTwitterLikes(data.twitter_likes || "");
    setInMails(data.settings.limits.linkedin_inmail || "");
    setSequenceMsgs(data.settings.limits.linkedin_message || "");
    setGlobalEnrich(data.global_enrich || "");
    setProxyCountry(data.country || "");
    setRegion(data.region || "");
    setCity(data.city || "");

    //modals data
    setAdmin(data.is_admin || false);
    const createdAt = data.created_at
      ? new Date(Number(data.created_at))
          .toISOString() 
          .slice(0, 16)  
          .replace("T", " ") 
      : "";

    setUserCreated(createdAt);
    setAddress(data.address || "");
    setVat(data.vat || "");
    setLinkedinEmail(data.linkedin?.data?.email || "");
    setLinkedinName([data.linkedin?.data?.first_name, data.linkedin?.data?.last_name]
      .filter(Boolean)
      .join(" "));
    setLinkedinDate(data.linkedin?.connected_at
      ? new Date(Number(data.linkedin.connected_at)).toLocaleDateString("en-US", { 
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "");
    setLinkedinUrl(data.linkedin?.data?.public_profile_url || "");
    setLinkedinCookiesUpdate(data.linkedin_cookies || "");
    setLinkedinCredUpdate(data.linkedin_password || "");
    setTwitterCookiesUpdate(data.twitter_cookies || "");
    setTwitterCredUpdate(data.twitter_password || "");
    console.log("User data...", data);
   } catch {
    console.log("Failed to fetch User");
   }
   console.log("id", id);
  };

  if (id) {
   fetchUser();
  }
 }, [id]);
 

  return (
    <EditContext.Provider
      value={{
        editId,
        setEditId,
        email,
        setEmail,
        password,
        setPassword,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        company,
        setCompany,
        stripe,
        setStripe,
        agency,
        setAgency,
        plan,
        setPlan,
        planType,
        setPlanType,
        paidUntil,
        setPaidUntil,
        subPausedUntil,
        setSubPausedUntil,
        dockerVersion,
        setDockerVersion,
        devDockerName,
        setDevDockerName,
        profileViews,
        setProfileViews,
        invites,
        setInvites,
        twitterLikes,
        setTwitterLikes,
        inMails,
        setInMails,
        sequenceMsgs,
        setSequenceMsgs,
        globalEnrich,
        setGlobalEnrich,
        proxyCountry,
        setProxyCountry,
        city,
        setCity,
        region,
        setRegion,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        //modals state
        admin,
        setAdmin,
        userCreated,
        setUserCreated,
        address,
        setAddress,
        vat,
        setVat,
        linkedinEmail,
        setLinkedinEmail,
        linkedinName,
        setLinkedinName,
        linkedinDate,
        setLinkedinDate,
        linkedinUrl,
        setLinkedinUrl,
        linkedinCookiesUpdate,
        setLinkedinCookiesUpdate,
        linkedinCredUpdate,
        setLinkedinCredUpdate,
        twitterCookiesUpdate,
        setTwitterCookiesUpdate,
        twitterCredUpdate,
        setTwitterCredUpdate,

        
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
