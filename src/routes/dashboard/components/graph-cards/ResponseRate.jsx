import TooltipInfo from "../TooltipInfo.jsx";

const ResponseRate = ({ value = "75,45,55" }) => {
  // Convert comma-separated string to numbers
  const values = value.split(",").map(Number);

  // Define bars with their colors and labels
  const bars = [
    { label: "Reply Rate", color: "bg-[#03045E]" },
    { label: "Sequences", color: "bg-[#0096C7]" },
    { label: "InMail", color: "bg-[#00B4D8]" },
  ].map((bar, index) => ({
    ...bar,
    value: values[index] || 0,
  }));

  return (
    <div className="bg-[#FFFFFF] shadow-md px-[12px] rounded-[8px] py-[12px] h-full flex flex-col justify-between relative ">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        <div> Response Rate</div>
      </div>
      <div className="flex flex-col gap-[10px] mt-3 w-[85%]">
        {bars.map((bar, index) => (
          <div key={index} className="mb-0">
            <div className="text-[12px] text-[#1E1D1D] mb-1">{bar.label}</div>
            <div className="h-[10px] bg-[#DBDBDB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color}`}
                style={{ width: `${bar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="justify-end"
      />
    </div>
  );
};

export default ResponseRate;
