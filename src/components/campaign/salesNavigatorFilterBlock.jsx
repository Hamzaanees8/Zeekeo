import React, { useState, useEffect } from "react";

const globalSearchCache = {};

const SalesNavigatorFilterBlock = ({
  fieldKey,
  title,
  label,
  placeholder,
  type = "multi",
  options = [],
  value,
  includeExclude = false,
  isAutoSearchEnabled = false,
  fetchOptions,
  onOptionsChange,
  onChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cache fetch
  const fetchWithCache = async term => {
    const cacheKey = `${fieldKey}-${term}`;
    if (globalSearchCache[cacheKey]) {
      return globalSearchCache[cacheKey];
    }
    setSuggestions([]);
    const result = await fetchOptions(term);
    globalSearchCache[cacheKey] = result;
    return result;
  };

  // Auto search
  useEffect(() => {
    if (type !== "multi") return;
    if (isAutoSearchEnabled && fetchOptions && searchTerm.length > 1) {
      const delayDebounce = setTimeout(() => {
        setLoading(true);
        fetchWithCache(searchTerm)
          .then(newOptions => {
            const selectedValues = includeExclude
              ? [...(value?.include || []), ...(value?.exclude || [])]
              : value || [];
            setSuggestions(
              newOptions.filter(n => !selectedValues.includes(n.value)),
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
  }, [
    searchTerm,
    value,
    fetchOptions,
    isAutoSearchEnabled,
    fieldKey,
    includeExclude,
    type,
  ]);

  const addSuggestion = (opt, typeKey = null) => {
    onOptionsChange([...options, opt]);
    addSelection(opt, typeKey);
    setSearchTerm("");
  };

  const addSelection = (opt, typeKey) => {
    if (includeExclude) {
      onChange({
        ...value,
        [typeKey]: [...(value?.[typeKey] || []), opt.value],
      });
    } else {
      const currentValues = Array.isArray(value) ? value : [];
      const updated = currentValues.includes(opt.value)
        ? currentValues.filter(v => v !== opt.value)
        : [...currentValues, opt.value];
      onChange(updated);
    }
  };

  const removeSelection = (val, typeKey) => {
    if (includeExclude) {
      let updated = {
        ...value,
        [typeKey]: (value?.[typeKey] || []).filter(v => v !== val),
      };

      console.log("after removal", updated);

      // Drop include if empty
      if (updated.include?.length === 0) {
        delete updated.include;
      }

      // Drop exclude if empty
      if (updated.exclude?.length === 0) {
        delete updated.exclude;
      }

      // If both are gone → remove filter entirely
      if (!updated.include && !updated.exclude) {
        onChange(undefined);
      } else {
        onChange(updated);
      }
    } else {
      const updated = (value || []).filter(v => v !== val);

      if (updated.length === 0) {
        onChange(undefined);
      } else {
        onChange(updated);
      }
    }
  };

  const getLabel = val => {
    const opt = options.find(o => o.value === val);
    return opt ? opt.label : val;
  };

  const filterAvailableOptions = () => {
    const selectedValues = includeExclude
      ? [...(value?.include || []), ...(value?.exclude || [])]
      : value || [];
    return options.filter(opt => !selectedValues.includes(opt.value));
  };

  const availableOptions = filterAvailableOptions();
  console.log("options..", availableOptions);
  // Render for multi type
  const renderMulti = () => (
    <>
      <div className="flex flex-wrap gap-2 py-2">{renderSelectedTags()}</div>
      <div className="flex flex-col gap-2">
        {availableOptions.map((opt, idx) => {
          const key =
            typeof opt.value === "object"
              ? `${idx}-${JSON.stringify(opt.value)}`
              : `${idx}-${opt.value}`;

          return includeExclude ? (
            <div key={key} className="flex items-center justify-between">
              <span className="text-base text-[#6D6D6D]">{opt.label}</span>
              <div className="flex gap-2">
                <span
                  className="cursor-pointer hover:text-green-800"
                  onClick={() => addSelection(opt, "include")}
                >
                  Include
                </span>
                |
                <span
                  className="cursor-pointer hover:text-red-600"
                  onClick={() => addSelection(opt, "exclude")}
                >
                  Exclude
                </span>
              </div>
            </div>
          ) : (
            <div
              key={key}
              className="px-3 py-1 cursor-pointer rounded hover:bg-[#e6e6e6]"
              onClick={() => addSelection(opt)}
            >
              <span className="text-base text-[#6D6D6D]">{opt.label}</span>
            </div>
          );
        })}
      </div>

      {isAutoSearchEnabled && (
        <div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search to add..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-400 w-full mt-3 rounded-[4px]"
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
            <ul className="border border-gray-300 bg-white max-h-40 overflow-auto mt-1">
              {suggestions.map(s => (
                <li
                  key={s.value}
                  className="px-3 py-2 flex justify-between hover:bg-gray-50"
                >
                  {includeExclude ? (
                    <>
                      <span className="text-base text-[#6D6D6D]">
                        {s.label}
                      </span>
                      <div className="flex gap-2">
                        <span
                          className="cursor-pointer hover:text-green-800"
                          onClick={() => addSuggestion(s, "include")}
                        >
                          Include
                        </span>
                        |
                        <span
                          className="cursor-pointer hover:text-red-600"
                          onClick={() => addSuggestion(s, "exclude")}
                        >
                          Exclude
                        </span>
                      </div>
                    </>
                  ) : (
                    <span
                      className="cursor-pointer hover:text-green-800"
                      onClick={() => addSuggestion(s)}
                    >
                      {s.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );

  // Render selected tags
  const renderSelectedTags = () => {
    console.log(title, "selected values..", value);
    return includeExclude ? (
      <>
        {value?.include?.map(val => {
          const key =
            typeof val === "object"
              ? `inc-${JSON.stringify(val)}`
              : `inc-${val}`;
          return (
            <span
              key={key}
              className="px-2 py-1 bg-green-100 text-green-800 rounded-[4px] flex items-center gap-1"
            >
              {getLabel(val)}
              <button onClick={() => removeSelection(val, "include")}>
                ×
              </button>
            </span>
          );
        })}
        {value?.exclude?.map(val => (
          <span
            key={`exc-${val}`}
            className="px-2 py-1 bg-red-100 text-red-800 rounded flex items-center gap-1"
          >
            {getLabel(val)}
            <button onClick={() => removeSelection(val, "exclude")}>×</button>
          </span>
        ))}
      </>
    ) : (
      (value || []).map(val => {
        const key =
          typeof val === "object"
            ? `val-${JSON.stringify(val)}`
            : `val-${val}`;
        console.log(key);
        return (
          <span
            key={key}
            className="px-2 py-1 bg-green-100 text-green-800 rounded flex items-center gap-1"
          >
            {getLabel(val)}
            <button onClick={() => removeSelection(val)}>×</button>
          </span>
        );
      })
    );
  };

  const renderBoolean = () => {
    return (
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
          <div
            className="w-11 h-6 bg-gray-200 peer-focus:outline-none 
                        peer-focus:ring-2 peer-focus:ring-offset-2 
                        peer-focus:ring-blue-500 rounded-full peer 
                        peer-checked:bg-[#04479C] transition-colors duration-200"
          ></div>
          <div
            className="absolute left-0.5 top-0.5 bg-white border border-gray-300
                        h-5 w-5 rounded-full transition-transform duration-200
                        peer-checked:translate-x-5"
          ></div>
        </label>
      </div>
    );
  };

  // Render text input
  const renderText = () => (
    <input
      type="text"
      placeholder={placeholder || ""}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-400 w-full rounded-[4px]"
    />
  );

  return (
    <div className="flex flex-col gap-y-4 w-[340px] px-2 pt-3 pb-8 border border-[#7E7E7E] bg-[#FFFFFF] rounded-[8px] shadow-md">
      <div className="flex flex-col px-1.5">
        <h2 className="text-[20px] font-semibold text-[#04479C] font-urbanist">
          {title}
        </h2>
        <div className="py-0.5">
          {type === "multi" && renderMulti()}
          {type === "boolean" && renderBoolean()}
          {type === "text" && renderText()}
        </div>
      </div>
    </div>
  );
};

export default SalesNavigatorFilterBlock;
