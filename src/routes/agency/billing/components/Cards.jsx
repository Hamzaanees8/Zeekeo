import { useState } from "react";
import SelectDropdown from "../../../../components/Select";
import { DeleteIcon, GreyAdd, Tooltip } from "../../../../components/Icons";
import DeleteModal from "./DeleteModal";

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

const cards = [
  {
    id: "card_1",
    card: {
      brand: "visa",
      last4: "1234",
    },
  },
  {
    id: "card_2",
    card: {
      brand: "mastercard",
      last4: "5678",
    },
  },
];

const Cards = () => {
  //const [cards, setCards] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
  const [formDataErrors, setFormDataErrors] = useState({});
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: 50 }, (_, i) => {
    const year = CURRENT_YEAR - i;
    return { label: `${year}`, value: `${year}` };
  });
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
  return (
    <div className="mt-4 px-[290px]">
      <div className="w-full flex flex-col gap-y-7 text-[#6D6D6D]">
        <p className="text-[20px] font-medium font-urbanist">Cards</p>
        <div className="flex flex-col gap-y-2.5 bg-white border border-[#6D6D6D] p-3">
          {cards.map(card => (
            <label
              key={card.id}
              className="flex items-center justify-between text-[#6D6D6D] text-[16px] font-normal"
            >
              <div className="text-[#6D6D6D] text-[16px] font-normal flex items-center gap-2">
                <p>
                  {card.card.brand.charAt(0).toUpperCase() +
                    card.card.brand.slice(1)}
                  :{" "}
                </p>
                <p>**** **** **** {card.card.last4}</p>
              </div>
              <div
                className="cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                <DeleteIcon />
              </div>
            </label>
          ))}
        </div>
        <div
          className="w-full h-[24px] flex items-center justify-end gap-x-4 cursor-pointer"
          onClick={() => setShowCard(!showCard)}
        >
          <GreyAdd />
          <p className="text-[#7E7E7E] font-normal text-[16px]">
            Add New Card
          </p>
        </div>
        {showCard && (
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
                  className={`placeholder:text-[#7E7E7E] w-full focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
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
                  className={`placeholder:text-[#7E7E7E] text-[14px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
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
                  className={`placeholder:text-[#7E7E7E] text-[14px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
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
                  className={`placeholder:text-[#7E7E7E] w-full focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
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
        )}
        {showCard && (
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
                  className={`placeholder:text-[#7E7E7E] text-[14px] focus:outline-none font-normal border border-[#7E7E7E] h-[40px] px-2 py-[9.5px] ${
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
                    className={`placeholder:text-[#7E7E7E] w-full focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal pr-10 ${
                      formDataErrors.vatNumber ? "border-red-500" : ""
                    }`}
                  />
                  <div className="absolute top-1/2 right-3 -translate-y-1/2">
                    <div className="relative inline-block">
                      <Tooltip />
                      <div className="absolute bottom-full right-0 mb-1 w-56 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 peer-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-normal pointer-events-none">
                        Enter your official VAT number issued by your local tax
                        authority.
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
                  className={`placeholder:text-[#7E7E7E] w-full focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
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
                  className={`placeholder:text-[#7E7E7E] w-full focus:outline-none h-[40px] px-3 py-[9.5px] border border-[#7E7E7E] text-[14px] font-normal md:col-span-2 ${
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
        )}
        {showCard && (
          <button
            onClick={handleSubmit}
            className="w-full cursor-pointer h-[40px] bg-[#0387ff] text-sm font-normal text-[#FFFFFF]"
          >
            Add Card
          </button>
        )}
      </div>
      {showModal && (
        <DeleteModal
          onClose={() => setShowModal(false)}
          onClick={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Cards;
