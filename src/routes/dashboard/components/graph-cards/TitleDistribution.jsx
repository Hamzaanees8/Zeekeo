import TooltipInfo from "../TooltipInfo.jsx";

const TitleDistribution = ({ value = "1,2,3,4,5,6,7,8" }) => {
  // Convert comma-separated string to numbers
  const values = value.split(",").map(Number);

  // Define bars with their colors and labels
  const bars = [
    { label: "Others", color: "bg-[#03045E]" },
    { label: "Founder & CEO", color: "bg-[#04479C]" },
    { label: "CEO", color: "bg-[#0077B6]" },
    { label: "Founder & CEO", color: "bg-[#0096C7]" },
    { label: "CEO", color: "bg-[#00B4D8]" },
    { label: "Co-Founder & CEO", color: "bg-[#28F0E6]" },
    { label: "Co-Founder", color: "bg-[#12D7A8]" },
    { label: "Co-Founder", color: "bg-[#25C396]" },
  ].map((bar, index) => ({
    ...bar,
    value: values[index] || 0,
  }));

  return (
    <div className="bg-[#F4F4F4] shadow-sm px-[12px] py-[12px] flex flex-col justify-between relative h-full">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        <div> Title Distribution</div>
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

export default TitleDistribution;
