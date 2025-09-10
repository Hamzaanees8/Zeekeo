import { useState } from "react";

const Modal = ({
  onClose,
  onClick,
  title,
  text,
  actionButton,
  subscribedUsers,
  premiumFee,
  interval,
  price,
}) => {
  const [usersToAdd, setUsersToAdd] = useState(1);
  const [isPremiumSelected, setIsPremiumSelected] = useState(true);
  let planTotal = 0;
  planTotal = price * usersToAdd * (interval === "monthly" ? 1 : 3);
  if (isPremiumSelected) {
    planTotal += premiumFee;
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
        {title === "Add Users" && (
          <div className="flex flex-col gap-y-[10px] font-[500] font-urbanist text-[16px] text-[#6D6D6D]">
            <div className="text-[#04479C] font-[600]">
              ${price}{" "}
              <span className="text-[#6D6D6D] font-[500]">
                {" "}
                / User / Month
              </span>
            </div>
            <p>
              Already Added Users:{" "}
              <span className="text-[#04479C] font-[600]">
                {subscribedUsers}
              </span>
            </p>
            <div className="flex items-center gap-x-4 w-full">
              <span className="flex w-auto">Number of Users to Add:</span>
              <input
                type="number"
                min={1}
                className="max-w-[100px] border border-gray-300 p-1 rounded"
                value={usersToAdd}
                onChange={e => {
                  if (Number(e.target.value) < 1) {
                    setUsersToAdd(1);
                  } else {
                    setUsersToAdd(Number(e.target.value));
                  }
                }}
              />
            </div>
            <div>
              SubTotal:{" "}
              <span className="text-[#04479C] font-[600]">
                ${price * (interval === "monthly" ? 1 : 3)}
              </span>{" "}
              X{" "}
              <span className="text-[#04479C] font-[600]">
                {usersToAdd} {usersToAdd === 1 ? "User" : "Users"}
              </span>{" "}
              = <span> </span>
              <span className="text-[#04479C] font-[600]">
                ${price * usersToAdd * (interval === "monthly" ? 1 : 3)}
              </span>{" "}
              Billed {interval === "monthly" ? "Monthly" : "Quarterly"}
            </div>
            <div>
              <div>
                Premium Agency:{" "}
                <span className="text-[#04479C] font-[600]">
                  ${premiumFee}
                </span>
              </div>
              <p>One-Time Fee</p>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPremiumSelected}
                  className="border border-gray-300 accent-blue-500"
                  onChange={() => setIsPremiumSelected(!isPremiumSelected)}
                />
                Include Premium Agency
              </label>
            </div>
            <p className="font-[600]">
              Total:{" "}
              <span className="text-[#04479C] font-[600]">${planTotal}</span>
            </p>
          </div>
        )}
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          {text}
        </p>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <button
            onClick={() => onClick(usersToAdd)}
            className={`px-4 py-1 bg-white cursor-pointer border rounded-[4px] ${
              actionButton === "Delete"
                ? "text-[#DE4B32] border-[#DE4B32]"
                : actionButton === "Switch Plan"
                ? "text-[#04479C] border-[#04479C]"
                : "text-[#04479C] border-[#04479C]"
            }`}
          >
            {actionButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
