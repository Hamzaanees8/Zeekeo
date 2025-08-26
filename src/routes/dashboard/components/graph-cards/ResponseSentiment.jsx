// components/ResponseSentiment.jsx
import {
  FaceIcon,
  FaceIcon1,
  FaceIcon2,
  FaceIcon3,
} from "../../../../components/Icons.jsx";
import TooltipInfo from "../TooltipInfo.jsx";

const ResponseSentiment = ({ value = "1124,596,150,20" }) => {
  // Convert the comma-separated string to an array of numbers
  const values = value.split(",").map(Number);

  const sentiments = [
    { icon: FaceIcon, color: "bg-[#038D65]", fill: "fill-[#038D65]" },
    { icon: FaceIcon1, color: "bg-[#12D7A8]", fill: "fill-[#FFCB4D]" },
    { icon: FaceIcon2, color: "bg-[#0077B6]", fill: "fill-[#DE4B32]" },
    { icon: FaceIcon3, color: "bg-[#03045E]", fill: "fill-[#00AAD9]" },
  ].map((sentiment, index) => ({
    ...sentiment,
    value: values[index] || 0, // Use 0 as fallback if value is missing
  }));

  // Find the maximum value for scaling
  const maxValue = Math.max(...sentiments.map(item => item.value));

  return (
    <div className="bg-[#F4F4F4] shadow-sm px-[12px] py-[12px] h-full flex flex-col justify-between relative">
      <div className="text-[16px] text-[#1E1D1D] font-normal">
        <div>Response Sentiment</div>
      </div>
      <div className="flex flex-col gap-[14px] mt-4">
        {sentiments.map((sentiment, index) => (
          <div key={index} className="flex items-center gap-1 w-[90%]">
            <sentiment.icon
              className={`w-[15px] h-[15px] ${sentiment.fill}`}
            />
            <div className="flex-1 flex justify-between ">
              <div className="w-full h-3 overflow-hidden flex gap-2 items-center">
                <div
                  className={`h-full rounded-[3px] ${sentiment.color} text-white text-xs font-semibold text-right pr-2 flex items-center justify-end`}
                  style={{
                    width: `${(sentiment.value / maxValue) * 100}%`,
                  }}
                ></div>
                <span className="text-[12px] text-grey">
                  {sentiment.value}
                </span>
              </div>
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

export default ResponseSentiment;
