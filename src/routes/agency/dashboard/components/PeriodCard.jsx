import { Decrease, Increase, Meeting } from "../../../../components/Icons.jsx";

const PeriodCard = ({ title, change, value }) => {
  return (
    <div className="flex flex-col items-center justify-enter w-[170px] gap-y-3 border border-[#7E7E7E] bg-white py-[16px]">
      <p className="text-[15px] font-normal text-[#454545]">{title}</p>
      <div className="flex items-center gap-x-2">
        {value &&
          title !== "Reply Rate (avg)" &&
          title !== "Invite Accepts (avg)" && (
            <p className="text-[#0387FF] font-[300] text-[28px]">{value}</p>
          )}
        {(title === "Reply Rate (avg)" ||
          title === "Invite Accepts (avg)") && (
          <p className="text-[#0387FF] font-[300] text-[28px]">
            {change?.replace("+", "").replace("-", "")}
          </p>
        )}
        {title !== "Meetings" && (
          <>
            {change?.includes("+") && <Increase />}
            {change?.includes("-") && <Decrease />}
          </>
        )}
        {title === "Meetings" && <Meeting />}
      </div>
    </div>
  );
};

export default PeriodCard;
