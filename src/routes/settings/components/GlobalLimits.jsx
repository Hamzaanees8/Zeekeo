import { useEffect, useState } from "react";
import { Alert } from "../../../components/Icons";

const limitsConfig = [
  {
    label: "Profile Views",
    displayLabel: "Maximum {{Profile Views}} within 24 hours",
    min: 0,
    max: 100,
    step: 10,
    recommended: 50,
    value: 0,
  },
  {
    label: "Invites",
    displayLabel: "Maximum {{Invites}} within 24 hours",
    min: 0,
    max: 100,
    step: 10,
    recommended: 50,
    value: 0,
  },
  {
    label: "Twitter Likes",
    displayLabel: "Maximum {{Twitter Likes}} within 24 hours",
    min: 0,
    max: 150,
    step: 25,
    recommended: 40,
    value: 0,
  },
  {
    label: "Follows",
    displayLabel: "Maximum {{Follows}} within 24 hours",
    min: 0,
    max: 100,
    step: 10,
    recommended: 40,
    value: 0,
  },
  {
    label: "Post Likes",
    displayLabel: "Maximum {{Post Likes}} within 24 hours",
    min: 0,
    max: 100,
    step: 10,
    recommended: 50,
    value: 0,
  },
  {
    label: "Endorsements",
    displayLabel: "Maximum {{Endorsements}} within 24 hours",
    min: 0,
    max: 150,
    step: 25,
    recommended: 40,
    value: 0,
  },
  {
    label: "InMails",
    displayLabel: "Maximum {{InMails}} within 24 hours",
    min: 0,
    max: 150,
    step: 25,
    recommended: 40,
    value: 0,
  },
  {
    label: "Sequence Messages",
    displayLabel: "Maximum {{Sequence Messages}} within 24 hours",
    min: 0,
    step: 50,
    max: 350,
    recommended: 40,
    value: 0,
  },
  {
    label: "Email Sequence Messages",
    displayLabel: "Maximum {{Email Sequence Messages}} within 24 hours",
    min: 0,
    max: 350,
    step: 50,
    recommended: 40,
    value: 0,
  },
  {
    label: "Withdraw Unaccepted Sent Invitations",
    displayLabel:
      "Automatically withdraw {{unaccepted sent invitations}} after 30 days",
    min: 0,
    max: 90,
    step: 10,
    recommended: 50,
    value: 0,
  },
];

const mergeLimitsWithDefaults = apiLimits => {
  return limitsConfig.map(defaultItem => {
    const matched = apiLimits?.find(item => item.label === defaultItem.label);
    return {
      ...defaultItem,
      value: matched?.value ?? defaultItem.recommended,
    };
  });
};

const GlobalLimits = ({
  apiLimits,
  onLimitsChange,
  enabled,
  setEnabled,
  handleSaveSettings,
}) => {
  const [limits, setLimits] = useState(limitsConfig);
  const toggle = () => {
    setEnabled(prev => !prev);
  };

  useEffect(() => {
    const merged = mergeLimitsWithDefaults(apiLimits);
    console.log("merged", merged);

    setLimits(merged);
  }, [apiLimits]);

  const handleValueChange = (index, newValue) => {
    const updatedLimits = [...limits];
    updatedLimits[index].value = newValue;
    setLimits(updatedLimits);

    // Notify parent with label/value only
    const simplifiedLimits = updatedLimits.map(({ label, value }) => ({
      label,
      value,
    }));
    onLimitsChange(simplifiedLimits);
  };
  // const updateLimit = (index, value) => {
  //   const updated = [...limits];
  //   updated[index].value = value;
  //   setLimits(updated);
  // };

  console.log("limits", limits);

  // Helper function to render label with highlighted parts
  const renderLabel = displayLabel => {
    const parts = displayLabel.split(/(\{\{.*?\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const text = part.slice(2, -2);
        return (
          <span key={i} className="text-[#0387FF] cursor-pointer">
            {text}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex gap-4 w-full">
      <div className="text-white p-6 space-y-6 w-full border border-[#7E7E7E] rounded-[10px] shadow-md bg-[#FFFFFF]">
        {limits.map((item, index) => (
          <div key={index} className="relative">
            <div className="mb-2 text-[16px] text-[#454545]">
              {renderLabel(item.displayLabel)}:{" "}
              <span className="text-[#0387FF] underline cursor-pointer">
                {item.value}
              </span>
            </div>

            <div className="relative w-full h-[50px] mt-2">
              {/* Tick Marks Layer (above slider track) */}
              <div className="absolute top-0 left-0 right-0 flex items-end h-full z-20 pointer-events-none">
                {(() => {
                  const min = item.min ?? 0;
                  const max = item.max;
                  const step = item.step;
                  const count = Math.floor((max - min) / step) + 1;

                  const stepValues = Array.from(
                    { length: count },
                    (_, i) => i * step + min,
                  );
                  const hasRecommendedInSteps = stepValues.includes(
                    item.recommended,
                  );

                  return (
                    <>
                      {/* Step Tick Lines */}
                      {stepValues.map(val => {
                        const percent = ((val - min) / (max - min)) * 100;
                        const isRecommended = val === item.recommended;

                        return (
                          <div
                            key={val}
                            className={`absolute flex flex-col items-center text-[10px] text-[#A0A0A0] ${
                              isRecommended
                                ? item.value > item.recommended
                                  ? "ToplRedLine"
                                  : "ToplGreenLine"
                                : ""
                            }`}
                            style={{
                              left: `${percent}%`,
                              transform: "translateX(-50%)",
                            }}
                          >
                            <div
                              className="bg-[#6D6D6D]"
                              style={{
                                height:
                                  val === min || val === max || isRecommended
                                    ? "14px"
                                    : "8px",
                                width: "1px",
                                marginBottom: "2px",
                              }}
                            />
                            {(val === min || val === max || isRecommended) && (
                              <span className="font-medium">{val}</span>
                            )}
                          </div>
                        );
                      })}

                      {/* Recommended Line (if not in step) */}
                      {!hasRecommendedInSteps && (
                        <div
                          className={`absolute flex flex-col items-center text-[10px] text-[#A0A0A0] ${
                            item.value > item.recommended
                              ? "ToplRedLine"
                              : "ToplGreenLine"
                          }`}
                          style={{
                            left: `${
                              ((item.recommended - min) / (max - min)) * 100
                            }%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div
                            className="bg-[#6D6D6D]"
                            style={{
                              height: "14px",
                              width: "1px",
                              marginBottom: "2px",
                            }}
                          />
                          <span className="font-medium">
                            {item.recommended}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Slider (under ticks) */}
              <input
                type="range"
                min={item.min ?? 0}
                max={item.max}
                value={item.value}
                onChange={e =>
                  handleValueChange(index, parseInt(e.target.value))
                }
                className={`w-full absolute top-[20px] appearance-none h-3 bg-[#E3E2E8] rounded z-10 ${
                  item.value > item.recommended
                    ? "slider-thumb-red"
                    : "slider-thumb-green"
                }`}
              />
            </div>

            {item.value > item.recommended && (
              <div className="text-red-500 text-xs mb-2 flex items-center gap-2">
                <span className="text-lg">
                  <Alert className="w-4 h-4" />
                </span>{" "}
                <span className="text-[#7E7E7E]">
                  Exceeded Default Recommended Values
                </span>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-8">
          <button className="bg-[#7E7E7E] px-6 py-1  text-white rounded-[4px]">
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            className="bg-[#0387FF] px-6 py-1  text-white cursor-pointer rounded-[4px]"
          >
            Save
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-[40%] p-3 border border-[#7E7E7E] rounded-[10px] shadow-md bg-[#FFFFFF]">
        <div className="flex gap-4  items-center ">
          <h2 className="text-[20px] text-black">Auto-scale Global Limits</h2>
          <button
            onClick={toggle}
            className={`w-[35.5px] h-4 flex items-center cursor-pointer rounded-full p-2 border-2 transition-all duration-300 ${
              enabled
                ? "bg-[#25C396] border-[#25C396]"
                : "bg-transparent border-[#7E7E7E]"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full shadow-md transition-all duration-300 ${
                enabled
                  ? "translate-x-[9px] bg-white"
                  : "translate-x-[-4px] bg-[#7E7E7E]"
              }`}
            />
          </button>
        </div>
        <div className="text-[#7e7e7e] text-[16px]">
          This option will ensure that your global limits will gradually
          increase every day, to better emulate human behavior. When this
          option is enabled, the limits will start at the predefined default
          values and automatically increase by 5 every day until it reaches the
          limits set on the sliders
        </div>
        <div className="text-[#7e7e7e] text-[16px] ">
          Daily global limit while the auto-scale options is enabled:
          <span className="text-[#0387FF] font-bold"> 250</span>
          {/* <span className="bg-[#0387FF]  rounded-[29px] text-white text-center">
            250
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default GlobalLimits;
