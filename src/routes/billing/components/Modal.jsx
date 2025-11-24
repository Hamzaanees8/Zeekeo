import { useState } from "react";

const Modal = ({
  onClose,
  onClick,
  title,
  text,
  actionButton,
  isLoading,
  selectedPlanId,
  isAgencyPlan,
  userEmail,
}) => {
  const [seatCount, setSeatCount] = useState(2);
  const [isPremiumSelected, setIsPremiumSelected] = useState(false);
  const [agencyUsername, setAgencyUsername] = useState(
    userEmail ? userEmail.replace(/@/g, "_") : "",
  );

  // Calculate price per user based on selected plan
  const getPricePerUser = () => {
    if (!selectedPlanId) return 0;

    const priceMap = {
      price_agency_basic_monthly: 156,
      price_agency_basic_quarterly: 125,
      price_agency_pro_monthly: 237,
      price_agency_pro_quarterly: 190,
    };

    return priceMap[selectedPlanId] || 0;
  };

  // Determine interval from selected plan
  const getInterval = () => {
    if (!selectedPlanId) return "monthly";
    return selectedPlanId.includes("monthly") ? "monthly" : "quarterly";
  };

  const pricePerUser = getPricePerUser();
  const planInterval = getInterval();

  let planTotal = 0;

  if (isAgencyPlan) {
    // Calculate total for agency plan
    planTotal =
      pricePerUser * seatCount * (planInterval === "monthly" ? 1 : 3);
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            {title}
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        {isAgencyPlan && (
          <div className="flex flex-col gap-y-[10px] font-[500] font-urbanist text-[16px] text-[#6D6D6D] mb-[21px]">
            <div className="text-[#04479C] font-[600]">
              ${pricePerUser}{" "}
              <span className="text-[#6D6D6D] font-[500]">/ User / Month</span>
            </div>
            <div className="flex items-center gap-x-4">
              <span className="whitespace-nowrap">Number of Seats:</span>
              <input
                type="number"
                min={2}
                className="flex-shrink-0 border border-gray-300 p-1 rounded"
                value={seatCount}
                style={{ width: "80px" }}
                onChange={e => {
                  const val = Number(e.target.value);
                  if (val < 2) {
                    setSeatCount(2);
                  } else {
                    setSeatCount(val);
                  }
                }}
              />
            </div>
            <div>
              SubTotal:{" "}
              <span className="text-[#04479C] font-[600]">
                ${pricePerUser * (planInterval === "monthly" ? 1 : 3)}
              </span>{" "}
              X{" "}
              <span className="text-[#04479C] font-[600]">
                {seatCount} {seatCount === 1 ? "Seat" : "Seats"}
              </span>{" "}
              ={" "}
              <span className="text-[#04479C] font-[600]">
                $
                {pricePerUser *
                  seatCount *
                  (planInterval === "monthly" ? 1 : 3)}
              </span>{" "}
              Billed {planInterval === "monthly" ? "Monthly" : "Quarterly"}
            </div>
            {title === "Confirmation" && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremiumSelected}
                    className="border border-gray-300 accent-blue-500 cursor-pointer flex-shrink-0"
                    onChange={() => setIsPremiumSelected(!isPremiumSelected)}
                  />
                  <span>
                    Premium Agency (One-Time Fee):{" "}
                    <span className="text-[#04479C] font-[600]">$997</span>
                  </span>
                </label>
              </div>
            )}
            <p className="font-[600] mt-[10px]">
              Total:{" "}
              <span className="text-[#04479C] font-[600]">${planTotal}</span>
            </p>
            <hr className="my-4 border-t border-gray-300" />
            <div>
              <div className="flex items-center gap-x-2 mb-1">
                <label className="whitespace-nowrap">Agency Username:</label>
                <input
                  type="text"
                  className={`flex-1 border p-2 rounded ${
                    agencyUsername.length > 0 &&
                    (agencyUsername.length < 8 || agencyUsername.length > 32)
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={agencyUsername}
                  maxLength={32}
                  onChange={e => setAgencyUsername(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-start mt-1">
                {agencyUsername.length > 0 && agencyUsername.length < 8 ? (
                  <p className="text-red-500 text-sm">
                    Username must be at least 8 characters
                  </p>
                ) : (
                  <span></span>
                )}
                {agencyUsername.length > 0 && (
                  <p className="text-gray-500 text-sm">
                    {agencyUsername.length}/32 characters
                  </p>
                )}
              </div>
            </div>
            {text && (
              <p className="text-[#7E7E7E] mt-4 font-[500] font-urbanist text-[14px]">
                {text}
              </p>
            )}
          </div>
        )}
        {!isAgencyPlan && (
          <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
            {text}
          </p>
        )}
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isAgencyPlan) {
                onClick(seatCount, isPremiumSelected, agencyUsername);
              } else {
                onClick();
              }
            }}
            disabled={
              isLoading ||
              (isAgencyPlan &&
                (agencyUsername.length < 8 || agencyUsername.length > 32))
            }
            className={`px-4 py-1 bg-white border rounded-[4px] flex items-center justify-center min-w-[120px] ${
              isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            } ${
              actionButton === "Delete"
                ? "text-[#DE4B32] border-[#DE4B32]"
                : actionButton === "Switch Plan"
                ? "text-[#04479C] border-[#04479C]"
                : "text-[#04479C] border-[#04479C]"
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              actionButton
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
