const PeriodCard = ({ title, value }) => {
  const displayValue = value === "0" || value === 0 ? "~" : value;

  return (
    <div className="h-[100px]">
      <div className="mb-[10px] min-h-[36px]">
        <h2 className="text-[12px] text-[#1E1D1D] font-normal">{title}</h2>
      </div>
      <div className="text-[26px] font-normal text-[#04479C] text-center">
        {displayValue}
      </div>
    </div>
  );
};

export default PeriodCard;
