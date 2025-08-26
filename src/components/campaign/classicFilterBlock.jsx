import React, { useState, useEffect, useRef } from "react";

const globalSearchCache = {};

const ClassicFilterBlock = ({
  fieldKey,
  title,
  type = "multi", // 'multi', 'single', 'text'
  options = [],
  value,
  isAutoSearchEnabled = false,
  fetchOptions,
  onChange,
  onOptionsChange,
  fields = [], // for text group: [{ label, placeholder }]
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]); // for auto-search dropdown
  const [loading, setLoading] = useState(false);

  const fetchWithCache = async term => {
    if (globalSearchCache[`${fieldKey}-${term}`]) {
      return globalSearchCache[`${fieldKey}-${term}`];
    }
    setSuggestions([]);
    const result = await fetchOptions(term);
    globalSearchCache[`${fieldKey}-${term}`] = result;
    return result;
  };

  console.log(options);
  // Auto-search suggestion logic
  useEffect(() => {
    if (
      isAutoSearchEnabled &&
      fetchOptions &&
      searchTerm.length > 1 &&
      type !== "text"
    ) {
      if (globalSearchCache[`${fieldKey}-${searchTerm}`]) {
        setSuggestions(
          globalSearchCache[`${fieldKey}-${searchTerm}`].filter(
            n => !options.some(p => p.value === n.value),
          ),
        );
        return;
      }

      const delayDebounce = setTimeout(() => {
        setLoading(true);
        fetchWithCache(searchTerm)
          .then(newOptions => {
            setSuggestions(
              newOptions.filter(n => !options.some(p => p.value === n.value)),
            );
          })
          .finally(() => {
            setLoading(false);
          });
      }, 100);
      return () => clearTimeout(delayDebounce);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, options, fetchOptions, isAutoSearchEnabled, type, fieldKey]);

  const handleMultiSelect = val => {
    const currentValues = Array.isArray(value) ? value : [];
    const updated = currentValues.includes(val)
      ? currentValues.filter(v => v !== val)
      : [...currentValues, val];

    onChange(updated);
  };

  const handleSingleSelect = val => {
    onChange(val);
  };

  const handleTextChange = (field, val) => {
    onChange({
      ...value,
      [field]: val,
    });
  };

  const addSuggestion = opt => {
    onOptionsChange([...options, opt]);

    if (type === "multi") {
      onChange([...value, opt.value]);
    } else if (type === "single") {
      onChange(opt.value);
    }

    setSuggestions(prev => prev.filter(s => s.value !== opt.value));
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-y-4 w-[340px] px-2 pt-3 pb-8 border border-[#7E7E7E] bg-[#FFFFFF]">
      <div className="flex flex-col px-1.5">
        <h2 className="text-[20px] font-semibold text-[#04479C] font-urbanist">
          {title}
        </h2>
      </div>

      <div className="px-2">
        <div className="flex flex-col gap-y-5">
          {type === "multi" &&
            options.map(opt => (
              <label key={opt.value} className="flex items-center gap-x-4">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(opt.value)}
                  onChange={() => handleMultiSelect(opt.value)}
                  className="shrink-0 appearance-none w-[20px] h-[20px] border-2 border-[#0387FF] rounded-sm checked:bg-[#0387FF] focus:outline-none checked:relative checked:before:block checked:before:absolute checked:before:top-1/3 checked:before:left-1/2 checked:before:translate-x-[-50%] checked:before:translate-y-[-50%] checked:before:w-[6px] checked:before:h-[10px] checked:before:border-solid checked:before:border-white checked:before:border-r-2 checked:before:border-b-2 checked:before:rotate-45"
                />
                <span className="text-base font-normal text-[#6D6D6D]">
                  {" "}
                  {opt.label}
                </span>
              </label>
            ))}

          {type === "single" &&
            options.map(opt => (
              <label key={opt.value} className="flex items-center gap-x-4">
                <input
                  type="radio"
                  name={title}
                  checked={value === opt.value}
                  onChange={() => handleSingleSelect(opt.value)}
                  className="w-[20px] h-[20px] text-[#0387FF] border-2 border-[#0387FF] focus:outline-none"
                />
                <span className="text-base font-normal text-[#6D6D6D]">
                  {" "}
                  {opt.label}
                </span>
              </label>
            ))}

          {type === "text" && (
            <div className="w-full px-2 text-base font-medium ">
              {fields.length &&
                fields.map(f => (
                  <div key={f.fieldKey} className="w-full px-3 py-2">
                    {f.label && (
                      <label className="text-base font-normal text-[#6D6D6D]">
                        {f.label}
                      </label>
                    )}
                    <input
                      type="text"
                      placeholder={f.placeholder || ""}
                      value={value?.[f.fieldKey] || ""}
                      onChange={e =>
                        handleTextChange(f.fieldKey, e.target.value)
                      }
                      className="px-3 py-2 focus:outline-none text-[#7E7E7E] w-full border border-[#7E7E7E]"
                    />
                  </div>
                ))}
            </div>
          )}

          {isAutoSearchEnabled && type !== "text" && (
            <div className="w-full px-2 text-base font-medium ">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search to add..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                  }}
                  className="px-3 py-2 focus:outline-none text-[#7E7E7E] w-full border border-[#7E7E7E]"
                />

                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
              </div>

              {suggestions.length > 0 && (
                <ul className="border border-gray-300 bg-white max-h-40 overflow-auto">
                  {suggestions.map(s => (
                    <li
                      key={s.value}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => addSuggestion(s)}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassicFilterBlock;
