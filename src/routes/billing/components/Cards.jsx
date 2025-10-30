import { useEffect, useState } from "react";
import SelectDropdown from "../../../components/Select";
import {
  BillingIcon,
  CalenderIcon,
  Cycle,
  DeleteIcon,
  GreyAdd,
  TagIcon,
  TemplatesIcon,
  Tooltip,
} from "../../../components/Icons";
import Modal from "./Modal";
import zeekeo_logo from "../../../assets/zeekeo_pink.png";
import toast from "react-hot-toast";
import { DeleteSavedCard } from "../../../services/billings";
const COUNTRIES = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "au", label: "Australia" },
  { value: "jp", label: "Japan" },
  { value: "in", label: "India" },
  { value: "br", label: "Brazil" },
  { value: "za", label: "South Africa" },
];
const MONTHS = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];
const planMap = {
  price_individual_basic_monthly: "Basic",
  price_individual_basic_quarterly: "Basic",
  price_individual_pro_monthly: "Pro",
  price_individual_pro_quarterly: "Pro",
  price_agency_basic_monthly: "Agency Basic",
  price_agency_basic_quarterly: "Agency Basic",
  price_agency_pro_monthly: "Agency Pro",
  price_agency_pro_quarterly: "Agency Pro",
};
const validPlans = [
  "price_agency_basic_monthly",
  "price_agency_basic_quarterly",
  "price_agency_pro_monthly",
  "price_agency_pro_quarterly",
];
const Cards = ({
  cards,
  subscription,
  subscribedPlanId,
  setActiveTab,
  subscribedUsers,
}) => {
  const allowedUsers = 60;
  const [renewSubscription, setRenewSubscription] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: "",
    month: "",
    year: "",
    securityCode: "",
    country: "",
    vatNumber: "",
    company: "",
    address: "",
  });
  function getPlanTitle(planId) {
    return planMap[planId] || "Unknown Plan";
  }
  const [formDataErrors, setFormDataErrors] = useState({});
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: 50 }, (_, i) => {
    const year = CURRENT_YEAR - i;
    return { label: `${year}`, value: `${year}` };
  });
  useEffect(() => {
    if (subscription) {
      const now = Math.floor(Date.now() / 1000);
      const currentPeriodEnd =
        subscription.items?.data?.[0]?.current_period_end || 0;
      setRenewSubscription(currentPeriodEnd <= now);
    }
  }, [subscription]);
  function formatUnixTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = date.toLocaleDateString("en-GB", options);
    return formattedDate.replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");
  }
  const handleSubmit = () => {
    const errors = {};
    if (!formData.cardNumber.trim())
      errors.cardNumber = "Card number is required";
    if (!formData.month.trim()) errors.month = "Month is required";
    if (!formData.year.trim()) errors.year = "Year is required";
    if (!formData.country.trim()) errors.country = "Country is required";
    if (!formData.vatNumber.trim())
      errors.vatNumber = "VAT number is required";
    if (!formData.company.trim()) errors.company = "Company is required";
    if (!formData.address.trim()) errors.address = "Address is required";

    setFormDataErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log("Form submitted", formData);
      setShowCard(false);
      setFormData({
        cardNumber: "",
        month: "",
        year: "",
        securityCode: "",
        country: "",
        vatNumber: "",
        company: "",
        address: "",
      });
    }
  };
  const handleDelete = async () => {
    if (!selectedCardId) return;
    try {
      await DeleteSavedCard(selectedCardId);
      setCards(prev => prev.filter(card => card.id !== selectedCardId));
      setShowModal(false);
      toast.success("Card deleted successfully");
      setSelectedCardId(null);
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };
  return (
    <div className="mt-4 px-[30px]">
      <div className="w-full flex items-start justify-between text-[#6D6D6D] gap-x-[20px]">
        <div className="w-full flex flex-col gap-y-7 text-[#6D6D6D]">
          <div className="flex flex-col gap-y-2.5 bg-white border border-[#6D6D6D] p-4 rounded-[8px] shadow-md h-[410px]">
            <p className="text-[20px] font-semibold font-urbanist">
              Payment Methods
            </p>
            <div className="custom-scroll1 overflow-y-auto">
              {cards?.map(card => (
                <label
                  key={card.id}
                  style={{ gridTemplateColumns: "60% 30% 10%" }}
                  className="grid grid-cols-3 text-[#6D6D6D] text-[16px] font-normal border-b border-[#CCCCCC] py-2.5"
                >
                  <div className="text-[#6D6D6D] text-[16px] font-normal flex items-center gap-2 px-1">
                    <BillingIcon className="text-[#0387ff]" />
                    <p>
                      {card.card.brand.charAt(0).toUpperCase() +
                        card.card.brand.slice(1)}
                      :{" "}
                    </p>
                    <p>**** **** **** {card.card.last4}</p>
                  </div>
                  <div className="flex items-center gap-x-2 text-[#0387ff] text-sm">
                    <p>Expiry:</p>
                    <p>
                      <p>
                        {card.card.exp_month}/{card.card.exp_year}
                      </p>
                    </p>
                  </div>
                  <div
                    className="cursor-pointer px-1 ml-auto"
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setShowModal(true);
                    }}
                  >
                    <DeleteIcon />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div
            className="flex items-center justify-end"
            onClick={() => setShowCard(!showCard)}
          >
            <div className="flex items-center bg-white rounded-[6px] border border-[#6D6D6D] cursor-pointer gap-x-4 h-[30px] p-3">
              <GreyAdd />
              <p className="text-[#7E7E7E] font-normal text-[16px]">
                Add New Card
              </p>
            </div>
          </div>
          {showCard && (
            <div className="flex flex-col gap-y-7 border border-[#6D6D6D] rounded-[8px] shadow-md p-4 bg-[white]">
              <div className="flex flex-col items-start gap-y-3 w-full">
                <p className="text-[#6D6D6D] text-[16px] font-normal">
                  Card Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-9 gap-3 w-full text-[#454545]">
                  <div className="flex flex-col gap-y-1 col-span-9">
                    <input
                      name="Card Number"
                      type="text"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          cardNumber: e.target.value,
                        })
                      }
                      className={`placeholder:text-[#7E7E7E] w-full rounded-[6px] focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
                        formDataErrors.cardNumber ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.cardNumber && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.cardNumber}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-1 col-span-2">
                    <SelectDropdown
                      id="month"
                      name="month"
                      value={formData.month}
                      onChange={e =>
                        setFormData({ ...formData, month: e.target.value })
                      }
                      options={MONTHS}
                      placeholder="Month*"
                      className={`placeholder:text-[#7E7E7E] text-[14px] rounded-[6px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
                        formDataErrors.month ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.month && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.month}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <SelectDropdown
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={e =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      options={YEARS}
                      placeholder="Year*"
                      className={`placeholder:text-[#7E7E7E] text-[14px] rounded-[6px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
                        formDataErrors.year ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.year && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.year}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <input
                      name="securityCode"
                      type="text"
                      value={formData.securityCode}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          securityCode: e.target.value,
                        })
                      }
                      className={`placeholder:text-[#7E7E7E] w-full rounded-[6px] focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
                        formDataErrors.securityCode ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.securityCode && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.securityCode}
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-start col-span-3 text-center mt-2">
                    <p className="text-[#6D6D6D] text-[14px] font-normal text-center">
                      Security Code
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-y-3 w-full">
                <p className="text-[#6D6D6D] text-[16px] font-normal">
                  Billing Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full text-[#454545]">
                  <div className="flex flex-col gap-y-1">
                    <SelectDropdown
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={e =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      options={COUNTRIES}
                      placeholder="Country*"
                      className={`placeholder:text-[#7E7E7E] text-[14px] rounded-[6px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
                        formDataErrors.country ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.country && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.country}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <div className="relative w-full">
                      <input
                        name="vatNumber"
                        type="text"
                        placeholder="VAT*"
                        value={formData.vatNumber}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            vatNumber: e.target.value,
                          })
                        }
                        className={`placeholder:text-[#7E7E7E] w-full rounded-[6px] focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal pr-10 ${
                          formDataErrors.vatNumber ? "border-red-500" : ""
                        }`}
                      />
                      <div className="absolute top-1/2 right-3 -translate-y-1/2">
                        <div className="relative inline-block">
                          <Tooltip />
                          <div className="absolute bottom-full right-0 mb-1 w-56 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 peer-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-normal pointer-events-none">
                            Enter your official VAT number issued by your local
                            tax authority.
                          </div>
                        </div>
                      </div>
                    </div>
                    {formDataErrors.vatNumber && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.vatNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <input
                      name="company"
                      type="text"
                      placeholder="Company*"
                      value={formData.company}
                      onChange={e =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className={`placeholder:text-[#7E7E7E] w-full rounded-[6px] focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
                        formDataErrors.company ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.company && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.company}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-y-1 col-span-2">
                    <input
                      name="address"
                      type="text"
                      placeholder="Address*"
                      value={formData.address}
                      onChange={e =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className={`placeholder:text-[#7E7E7E] w-full rounded-[6px] focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
                        formDataErrors.address ? "border-red-500" : ""
                      }`}
                    />
                    {formDataErrors.address && (
                      <div className="text-[#FF0000] text-[14px] font-normal">
                        {formDataErrors.address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full cursor-pointer h-[40px] rounded-[6px] bg-[#0387ff] text-sm font-normal text-[#FFFFFF]"
              >
                Add Card
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-5 w-full">
          <div className="bg-[#FFFFFF] border border-[#6D6D6D] pt-4 pb-5 px-3 rounded-[8px] shadow-md flex flex-col gap-y-[20px]">
            <div className="flex items-center gap-x-[20px]">
              <p className="text-[20px] font-semibold font-urbanist leading-[20px]">
                Current Subscription
              </p>
              {subscribedPlanId && (
                <p className="px-4 py-1 rounded-[6px] bg-[#0387FF] text-white">
                  {subscription.status === "trialing" ? "Trial" : "Active"}
                </p>
              )}
            </div>
            {subscribedPlanId ? (
              <>
                {renewSubscription ? (
                  <div
                    className="flex items-center justify-center"
                    onClick={() => setActiveTab("Subscription")}
                  >
                    <button className="border cursor-pointer border-[#16A37B] px-[14.5px] py-[3px] text-[18px] text-[#16A37B] bg-white font-normal font-urbanist w-[220px] rounded-[6px]">
                      Renew Subscription
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-y-1.5">
                    <div className="flex items-center gap-x-1.5">
                      <TemplatesIcon className="w-4 h-4" />
                      <p className="font-normal text-[16px] text-[#6D6D6D]">
                        Subscribed Plan:
                      </p>
                      <p className="text-[16px] text-[#6D6D6D] font-semibold">
                        {getPlanTitle(subscribedPlanId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-1.5">
                      <CalenderIcon className="w-4 h-4" />
                      <p className="font-normal text-[16px] text-[#6D6D6D]">
                        Subscription Renews:
                      </p>
                      <p className="text-[16px] text-[#6D6D6D] font-semibold">
                        {formatUnixTimestamp(
                          subscription?.items?.data[0]?.current_period_end,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-1.5">
                      <Cycle className="w-5 h-5" />
                      <p className="font-normal text-[16px] text-[#6D6D6D]">
                        Billing Cycle
                      </p>
                      <p className="text-[16px] text-[#6D6D6D] font-semibold">
                        {subscription?.items?.data[0]?.plan?.interval ===
                          "month" &&
                        subscription?.items?.data[0]?.plan?.interval_count ===
                          1
                          ? "Monthly"
                          : "Quarterly"}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-1.5">
                      <TagIcon className="w-5 h-5" />
                      <p className="font-normal text-[16px] text-[#6D6D6D]">
                        Coupon:
                      </p>
                      <p className="text-[16px] text-[#6D6D6D] font-semibold">
                        Active
                      </p>
                      <p className="text-[15px] text-[#6D6D6D] font-normal">
                        (Percentage Off: 35%, Duration: forever)
                      </p>
                    </div>
                    {validPlans.includes(subscribedPlanId) && (
                      <>
                        <div className="flex items-center gap-x-4 mt-1">
                          <div className="flex flex-col rounded-[6px] border border-[#7E7E7E] overflow-hidden w-[170px]">
                            <p className="text-[16px] text-[#6D6D6D] font-semibold bg-[#EFEFEF] p-2">
                              User 1 to 60
                            </p>
                            <p className="text-[16px] text-[#6D6D6D] font-normal bg-[#FFFFFF] p-2">
                              $50/user
                            </p>
                          </div>
                          <div className="flex flex-col rounded-[6px] border border-[#7E7E7E] overflow-hidden w-[170px]">
                            <p className="text-[16px] text-[#6D6D6D] font-semibold bg-[#EFEFEF] p-2">
                              User 61 or more
                            </p>
                            <p className="text-[16px] text-[#6D6D6D] font-normal bg-[#FFFFFF] p-2">
                              $40/user
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-y-1.5 w-[350px]">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-[16px] text-[#6D6D6D]">
                              Current Users
                            </p>
                            <p className="text-[16px] text-[#6D6D6D] font-semibold">
                              {subscribedUsers} of {allowedUsers}
                            </p>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-3 bg-[#0387FF] rounded-full"
                              style={{
                                width: `${
                                  (subscribedUsers / allowedUsers) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-[14px] text-[#6D6D6D] font-normal">
                            57 billed users and 5 free users
                          </p>
                        </div>
                        <div className="flex items-center justify-between w-[350px]">
                          <button
                            onClick={() => setActiveTab("Subscription")}
                            className="border cursor-pointer border-[#6D6D6D] px-[10.5px] py-[3px] text-[18px] text-[#6D6D6D] bg-white font-normal font-urbanist w-[170px] rounded-[6px]"
                          >
                            Switch Plan
                          </button>
                          <button
                            onClick={() => setActiveTab("Subscription")}
                            className="border cursor-pointer border-[#0387FF] px-[10.5px] py-[3px] text-[18px] text-[#0387FF] bg-white font-normal font-urbanist w-[170px] rounded-[6px]"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setActiveTab("Subscription")}
                  className="border cursor-pointer border-[#0387FF] px-[14.5px] py-[3px] text-[18px] text-[#0387FF] bg-white font-normal font-urbanist w-[220px] rounded-[6px]"
                >
                  Add Subscription
                </button>
              </div>
            )}
          </div>
          <div className="bg-[#FFFFFF] border border-[#6D6D6D] p-3.5 rounded-[8px] shadow-md flex flex-col gap-y-[20px] min-h-[260px] justify-center">
            <p className="text-[#7E7E7E] font-medium font-urbanist leading-[130%] text-[20px]">
              Want your Outbound Fully Managed?
            </p>
            <div className="flex items-center gap-3 justify-start">
              <div className="h-[150px]">
                <img src={zeekeo_logo} alt="Logo" className="h-[150px]" />
              </div>
              <div className="flex flex-col gap-2 w-[70%]">
                <p className="text-[#7E7E7E] font-normal text-[14px] leading-[130%]">
                  Step up to Zeekeo our done-for-you growth platform that
                  combines AI-powered outreach with expert strategy and
                  execution.
                </p>
                <p className="text-[#7E7E7E] font-normal text-[14px] leading-[130%]">
                  Get 3 months of Appointment Setting for{" "}
                  <span className="font-bold">FREE</span> when purchasing
                  LinkedIn or Email Outreach.
                </p>
                <a
                  href="https://calendly.com/d/cwjh-rjk-z7t/level-up-with-zeekeo"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="border h-[34px] cursor-pointer border-[#0387FF] px-[14.5px] py-[3px] text-[16px] text-[#0387FF] bg-white font-normal font-urbanist w-[170px] rounded-[6px]">
                    Book a Call
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal
          title="Delete Item"
          text="Are you sure you would like delete this item? This action cannot be undone."
          actionButton="Delete"
          onClose={() => setShowModal(false)}
          onClick={handleDelete}
        />
      )}
    </div>
  );
};

export default Cards;
