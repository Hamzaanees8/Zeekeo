import { useState, useRef, useEffect } from "react";
import { DropArrowIcon } from "../Icons";
import useInboxStore from "../../routes/stores/useInboxStore";
import { sentimentOptions } from "../../utils/inbox-helper";

export default function SentimentFilter() {
  const { filters, setFilters } = useInboxStore();

  const [showSentiment, setShowSentiment] = useState(false);
  const sentimentRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        sentimentRef.current &&
        !sentimentRef.current.contains(event.target)
      ) {
        setShowSentiment(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = sentimentOptions.find(s => s.value === filters.sentiment);
  const SelectedIcon = selected?.icon;

  return (
    <div className="relative h-[35px]" ref={sentimentRef}>
      {/* Dropdown button */}
      <div
        className="cursor-pointer h-[35px] min-w-[180px] justify-between border border-[#7E7E7E] px-2 text-base font-medium bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
        onClick={() => setShowSentiment(prev => !prev)}
      >
        {SelectedIcon && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center">
            <SelectedIcon className={`w-6 h-6 ${selected.fill}`} />
          </span>
        )}
        <span>{selected ? selected.label : "Sentiment"}</span>
        <DropArrowIcon className="h-[14px] w-[12px]" />
      </div>

      {/* Dropdown list */}
      {showSentiment && (
        <div className="absolute top-[40px] left-0 w-[220px] bg-white border border-[#7E7E7E] z-50 shadow-md text-urbanist text-[#7E7E7E]">
          {sentimentOptions.map(({ label, value, icon: Icon, fill }) => (
            <div
              key={value}
              className="flex items-center gap-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                setShowSentiment(false);
                setFilters("sentiment", value);
              }}
            >
              {Icon && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${fill}`} />
                </span>
              )}
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
