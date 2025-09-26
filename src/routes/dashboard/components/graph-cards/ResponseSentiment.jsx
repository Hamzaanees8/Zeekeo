// components/ResponseSentiment.jsx
import TooltipInfo from "../TooltipInfo.jsx";
import {
  FaceIcon,
  FaceIcon1,
  FaceIcon2,
  FaceIcon3,
  FilterProfile
} from "../../../../components/Icons.jsx";

const DEFAULT_SENTIMENTS = [
  { icon: FaceIcon, color: "bg-[#038D65]", fill: "fill-[#038D65]" },
  { icon: FaceIcon1, color: "bg-[#FFCB4D]", fill: "fill-[#FFCB4D]" },
  { icon: FaceIcon2, color: "bg-[#DE4B32]", fill: "fill-[#DE4B32]" },
  { icon: FilterProfile, color: "bg-[#28F0E6]", fill: "fill-[#28F0E6]" },
   { icon: FaceIcon3, color: "bg-[#00AAD9]", fill: "fill-[#00AAD9]" },
];

const ResponseSentiment = ({ data = [], tooltipText }) => {
  // Merge default sentiments with passed data
  const sentiments = data.map((item, index) => {
    const defaultSentiment = DEFAULT_SENTIMENTS[index] || {};
    return {
      label: item.label || `Sentiment ${index + 1}`,
      value: item.value || 0,
      icon: item.icon || defaultSentiment.icon,
      color: item.color || defaultSentiment.color,
      fill: item.fill || defaultSentiment.fill,
    };
  });

  const maxValue = Math.max(...sentiments.map(s => s.value, 0));

  return (
    <div className="bg-white shadow-md px-[12px] rounded-[8px] py-[12px] h-full flex flex-col justify-between relative">
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-2">{`Response Sentiment`}</div>

      <div className="flex flex-col gap-[14px] mt-2">
        {sentiments.map((s, index) => (
          <div key={index} className="flex items-center gap-1 w-[90%]">
            {s.icon && <s.icon className={`w-[15px] h-[15px] ${s.fill}`} />}
            <div className="flex-1 flex justify-between">
              <div className="w-full h-3 overflow-hidden flex gap-2 items-center">
                <div
                  className={`h-full rounded-[3px] ${s.color} text-white text-xs font-semibold text-right pr-2 flex items-center justify-end`}
                  style={{
                    width: `${maxValue ? (s.value / maxValue) * 100 : 0}%`,
                  }}
                ></div>
                <span className="text-[12px] text-grey">{s.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tooltipText && (
        <TooltipInfo text={tooltipText} className="justify-end" />
      )}
    </div>
  );
};

export default ResponseSentiment;
