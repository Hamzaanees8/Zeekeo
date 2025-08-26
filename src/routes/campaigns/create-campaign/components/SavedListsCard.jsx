import React, { useState, useEffect } from "react";

const SavedListsCard = ({
  title,
  options,
  subOptions = {},
  values = {},
  onChange,
}) => {
  const [selectedMain, setSelectedMain] = useState(values.selectedMain || null);
  const [selectedSub, setSelectedSub] = useState(values.selectedSub || []);

  useEffect(() => {
    onChange({
      selectedMain,
      selectedSub,
    });
  }, [selectedMain, selectedSub]);

  const toggleMain = (option) => {
    setSelectedMain(prev => (prev === option ? null : option));
    // reset sub-options if changing main
    if (option !== selectedMain) setSelectedSub([]);
  };

  const toggleSub = (sub) => {
    setSelectedSub(prev =>
      prev.includes(sub)
        ? prev.filter(item => item !== sub)
        : [...prev, sub]
    );
  };

  return (
    <div className="flex flex-col gap-y-4 w-[340px] px-2 pt-3 pb-8 border border-[#7E7E7E] bg-[#FFFFFF]">
      <div className="flex flex-col px-1.5">
        <h2 className="text-[20px] font-semibold text-[#04479C] font-urbanist">{title}</h2>
      </div>

      <div className="px-4 flex flex-col gap-y-4">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-x-4">
            <input
              type="checkbox"
              checked={selectedMain === option}
              onChange={() => toggleMain(option)}
              className="w-4 h-4 border-2 border-[#0387FF] rounded-sm checked:bg-[#0387FF]"
            />
            <span className="text-base font-normal text-[#6D6D6D]">{option}</span>
          </label>
        ))}
      </div>

      {/* Sub options for "Leads" */}
      {selectedMain && subOptions[selectedMain] && (
        <div className="px-4 pt-2 border-t border-[#E0E0E0] flex flex-col gap-y-3">
          {subOptions[selectedMain].map((sub) => (
            <label key={sub} className="flex items-center gap-x-4 pl-4">
              <input
                type="checkbox"
                checked={selectedSub.includes(sub)}
                onChange={() => toggleSub(sub)}
                className="w-4 h-4 border-2 border-[#5C9EFF] rounded-sm checked:bg-[#5C9EFF]"
              />
              <span className="text-sm text-[#4A4A4A]">{sub}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedListsCard;
