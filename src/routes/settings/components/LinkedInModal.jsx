import { allCountries, citiesByCountry } from "../../../utils/country-helper";

const LinkedInModal = ({
  onClose,
  onConnect,
  selectedOptions,
  setSelectedOptions,
}) => {
  const toggleOption = key => {
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const availableCities = selectedOptions?.country
    ? citiesByCountry[selectedOptions?.country] || []
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[550px] p-8 ">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Confirm Active LinkedIn Subscription
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>

        <p className="text-[#7E7E7E] mb-3 text-[10px]">
          Before connecting your LinkedIn account, please make sure that you
          have an active LinkedIn subscription on the account.
        </p>
        <p className="italic text-[#7E7E7E] mb-3 text-[10px]">
          In the absence of an active subscription, the account can risk to be
          disconnected and even temporarily banned by LinkedIn.
        </p>
        <p className="text-[#7E7E7E] mb-6 text-[10px]">
          Please select a proxy location to match or get as close as possible
          to your current location...
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 text-[10px]">
          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] text-urbanist mb-1">
              Country
            </label>
            <select
              value={selectedOptions?.country || ""}
              onChange={e => {
                setSelectedOptions(prev => ({
                  ...prev,
                  country: e.target.value,
                  city: "",
                }));
              }}
              className="border rounded p-2 w-60 text-sm"
            >
              <option value="">Select Country</option>
              {allCountries.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {/* <input
              value={selectedOptions.country || ""}
              onChange={(e) =>
                setSelectedOptions((prev) => ({
                  ...prev,
                  country: e.target.value
                }))
              }
              placeholder=""
              className="border border-[#7E7E7E] px-2 py-1 text-sm"
            /> */}
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] text-urbanist mb-1">
              Region/City
            </label>
            <select
              value={selectedOptions?.city || ""}
              onChange={e =>
                setSelectedOptions(prev => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              disabled={!selectedOptions?.country}
              className="border rounded p-2 w-60 text-sm"
            >
              <option value="">Select City</option>
              {availableCities.map((city, idx) => (
                <option key={idx} value={city}>
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>
            {/* <input
              value={selectedOptions.city || ""}
              onChange={e =>
                setSelectedOptions(prev => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              placeholder=""
              className="border border-[#7E7E7E] px-2 py-1 text-sm"
            /> */}
          </div>
        </div>

        <p className="text-[#6D6D6D] text-sm mb-2">
          Select your LinkedIn Subscriptions:
        </p>
        <div className="flex gap-4 mb-6 justify-between">
          {[
            { key: "premium", label: "LinkedIn Premium" },
            { key: "navigator", label: "Sales Navigator" },
            { key: "recruiter", label: "Recruiter" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleOption(key)}
            >
              <div className="w-[18px] h-[18px] border-2 border-[#6D6D6D] flex items-center justify-center rounded">
                {selectedOptions[key] && (
                  <div className="w-[10px] h-[10px] bg-[#0387FF]" />
                )}
              </div>
              <span className="text-sm text-[#6D6D6D]">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-[#6D6D6D] text-sm mb-2">Other Media to Login:</p>
        <div
          className="flex items-center gap-2 mb-6 cursor-pointer w-fit"
          onClick={() => toggleOption("twitter")}
        >
          <div className="w-[18px] h-[18px] border-2 border-[#6D6D6D] flex items-center justify-center rounded">
            {selectedOptions.twitter && (
              <div className="w-[10px] h-[10px] bg-[#0387FF]" />
            )}
          </div>
          <span className="text-sm text-[#6D6D6D]">Twitter</span>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConnect}
            className="px-6 py-1 bg-[#0387FF] text-white cursor-pointer"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInModal;
