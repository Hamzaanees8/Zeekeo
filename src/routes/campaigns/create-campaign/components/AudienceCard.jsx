import React, { useState, useEffect } from "react";
import { Add, Remove } from "../../../../components/Icons";

const AudienceCard = ({
  title = "Titles",
  options,
  type,
  description,
  values = {},
  onChange,
  radio = false,
  subOptions = {},
}) => {
  const [selectedOption, setSelectedOption] = useState(values.selectedOptions?.[0] || null);
  const [selectedSubOptions, setSelectedSubOptions] = useState(values.selectedSubOptions || []);
  const [customTitles, setCustomTitles] = useState(values.customOptions || []);
  const [input, setInput] = useState("");

  useEffect(() => {
    setSelectedOption(values.selectedOptions?.[0] || null);
    setCustomTitles(values.customOptions || []);
    setSelectedSubOptions(values.selectedSubOptions || []);
  }, []);

  useEffect(() => {
    onChange({
      selectedOptions: selectedOption ? [selectedOption] : [],
      customOptions: customTitles,
      selectedSubOptions,
    });
  }, [selectedOption, customTitles, selectedSubOptions]);

  const handleMainOptionChange = (option) => {
    setSelectedOption(option);
  };

  const toggleSubOption = (sub) => {
    setSelectedSubOptions((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [sub]
    );
  };

  const addCustomTitle = () => {
    const trimmed = input.trim();
    if (trimmed && !customTitles.includes(trimmed)) {
      setCustomTitles([...customTitles, trimmed]);
      setInput("");
    }
  };

  const removeCustomTitle = (title) => {
    setCustomTitles((prev) => prev.filter((t) => t !== title));
  };

  return (
    <div className="flex flex-col gap-y-4 w-[340px] px-2 pt-3 pb-8 border border-[#7E7E7E] bg-[#FFFFFF]">
      <div className="flex flex-col px-1.5">
        <h2 className="text-[20px] font-semibold text-[#04479C] font-urbanist">{title}</h2>
      </div>

      <div className="px-2">
        <div className="flex flex-col gap-y-5">
          {radio ? (
            options.map((option) => (
              <div key={option}>
                <label className="flex items-center gap-x-4">
                  <input
                    type="radio"
                    name={`radio-${title}`}
                    checked={selectedOption === option}
                    onChange={() => handleMainOptionChange(option)}
                    className="w-[20px] h-[20px] text-[#0387FF] border-2 border-[#0387FF] focus:outline-none"
                  />
                  <span className="text-base font-normal text-[#6D6D6D]">{option}</span>
                </label>

                {selectedOption === option && subOptions?.[option]?.length > 0 && (
                  <div className="pl-6 mt-2 flex flex-col gap-2">
                    {subOptions[option].map((sub) => (
                      <label key={sub} className="flex items-center gap-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSubOptions.includes(sub)}
                          onChange={() => toggleSubOption(sub)}
                          className="appearance-none w-4 h-4 border-2 border-[#0387FF] rounded-sm checked:bg-[#0387FF] focus:outline-none checked:relative checked:before:block checked:before:absolute checked:before:top-[0px] checked:before:left-[3px] checked:before:w-[6px] checked:before:h-[10px] checked:before:border-solid checked:before:border-white checked:before:border-r-2 checked:before:border-b-2 checked:before:rotate-45"
                        />
                        <span className="text-sm text-[#6D6D6D]">{sub}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            options.map((option) => (
              <label key={option} className="flex items-center gap-x-4">
                <input
                  type="checkbox"
                  checked={selectedOption === option}
                  onChange={() =>
                    setSelectedOption((prev) => (prev === option ? null : option))
                  }
                  className="shrink-0 appearance-none w-[20px] h-[20px] border-2 border-[#0387FF] rounded-sm checked:bg-[#0387FF] focus:outline-none checked:relative checked:before:block checked:before:absolute checked:before:top-1/3 checked:before:left-1/2 checked:before:translate-x-[-50%] checked:before:translate-y-[-50%] checked:before:w-[6px] checked:before:h-[10px] checked:before:border-solid checked:before:border-white checked:before:border-r-2 checked:before:border-b-2 checked:before:rotate-45"

                />
                <span className="text-base font-normal text-[#6D6D6D]">{option}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {type !== "connection" && (
        <div className="w-full px-2 text-base font-medium border border-[#7E7E7E] flex items-center justify-between">
          <input
            type="text"
            placeholder="Type and Select Other Titles"
            className="px-3 py-2 focus:outline-none text-[#7E7E7E] w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomTitle()}
          />
          <div className="cursor-pointer px-2" onClick={addCustomTitle}>
            <Add />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 px-2">
        {customTitles.map((title) => (
          <div
            key={title}
            className="flex items-center text-sm py-1 text-[#6D6D6D] font-normal"
          >
            {title}
            <div className="cursor-pointer ml-1" onClick={() => removeCustomTitle(title)}>
              <Remove />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudienceCard;
