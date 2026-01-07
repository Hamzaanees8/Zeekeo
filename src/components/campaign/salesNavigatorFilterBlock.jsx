import React, { useState, useEffect } from "react";

const globalSearchCache = {};

const SalesNavigatorFilterBlock = ({
  fieldKey,
  title,
  type = "multi",
  options = [], 
  value, // SCHEMA FORMAT: ["id", "id"] OR { include: ["id"], exclude: ["id"] }
  includeExclude = false,
  isAutoSearchEnabled = false,
  fetchOptions,
  onOptionsChange, 
  onChange, 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // INTERNAL MEMORY: Maps IDs back to Labels so we can display them
  // even if the user clears the search or the option isn't currently visible.
  const [labelCache, setLabelCache] = useState({});

  // --- Helpers ---

  // 1. Comparison Helper: Handles primitives ("8" === "8") and objects ({min:1} === {min:1})
  const areValuesEqual = (v1, v2) => {
    if (typeof v1 === 'object' && v1 !== null && typeof v2 === 'object' && v2 !== null) {
      return JSON.stringify(v1) === JSON.stringify(v2);
    }
    return v1 === v2;
  };

  // 2. Cache Builder: Scans options/suggestions to remember Label <-> ID pairings
  useEffect(() => {
    const newCache = { ...labelCache };
    let hasUpdates = false;

    const processItem = (item) => {
      // Handle Category headers (e.g., "CEO/Founders")
      if (Array.isArray(item.value) && item.value.length > 0 && typeof item.value[0] === 'object' && !item.value[0].min) {
        item.value.forEach(sub => processItem(sub));
      } 
      // Handle Standard Items
      else {
        const key = typeof item.value === 'object' ? JSON.stringify(item.value) : item.value;
        if (!newCache[key]) {
          newCache[key] = item.label;
          hasUpdates = true;
        }
      }
    };

    options.forEach(processItem);
    suggestions.forEach(processItem);

    if (hasUpdates) {
      setLabelCache(newCache);
    }
  }, [options, suggestions]);

  // 3. Label Lookup
  const getLabel = (id) => {
    const key = typeof id === 'object' ? JSON.stringify(id) : id;
    // Return cached label, or formatted object, or raw ID as fallback
    return labelCache[key] || (typeof id === 'object' ? `${id.min}-${id.max || '+'}` : id);
  };

  // --- Core Logic ---

  const fetchWithCache = async (term) => {
    const cacheKey = `${fieldKey}-${term}`;
    if (globalSearchCache[cacheKey]) return globalSearchCache[cacheKey];
    setSuggestions([]);
    const result = await fetchOptions(term);
    globalSearchCache[cacheKey] = result;
    return result;
  };

  const isIdSelected = (id) => {
    // Safety for non-multi types
    if (type !== 'multi') return value === id; 

    // Safety fallback
    const safeValue = value || (includeExclude ? { include: [], exclude: [] } : []);

    if (includeExclude) {
      const inc = safeValue.include || [];
      const exc = safeValue.exclude || [];
      return inc.some(v => areValuesEqual(v, id)) || exc.some(v => areValuesEqual(v, id));
    } else {
      const arr = Array.isArray(safeValue) ? safeValue : [];
      return arr.some(v => areValuesEqual(v, id));
    }
  };

  /**
   * ADD SELECTION
   * Extracts ONLY the IDs from the selected option and updates the parent state.
   */
  const addSelection = (opt, typeKey) => {
    setSearchTerm("");
    let idsToAdd = [];

    // 1. Handle Nested Categories (e.g. User clicks "CEO/Founders")
    if (Array.isArray(opt.value) && opt.value.length > 0 && typeof opt.value[0] === "object" && !opt.value[0].min) {
      // We assume opt.value is: [{label: "CEO", value: "8"}, {label: "Founder", value: "35"}]
      opt.value.forEach((subItem) => {
        if (!isIdSelected(subItem.value)) {
          idsToAdd.push(subItem.value); // Add just "8"
        }
      });
    } 
    // 2. Handle Legacy Arrays (if any)
    else if (Array.isArray(opt.value) && !opt.value[0]?.min) {
      opt.value.forEach((singleId) => {
        if (!isIdSelected(singleId)) {
          idsToAdd.push(singleId);
        }
      });
    } 
    // 3. Handle Standard Single Option
    else {
      if (!isIdSelected(opt.value)) {
        idsToAdd.push(opt.value); // Add just the ID or Range Object
      }
    }

    if (idsToAdd.length === 0) return;

    // Update State (Schema Compliant: IDs only)
    if (includeExclude) {
      const currentObj = value || { include: [], exclude: [] };
      const currentArray = currentObj[typeKey] || [];
      
      onChange({
        ...currentObj,
        [typeKey]: [...currentArray, ...idsToAdd],
      });
    } else {
      const currentArray = Array.isArray(value) ? value : [];
      onChange([...currentArray, ...idsToAdd]);
    }
  };

  const addSuggestion = (opt, typeKey = null) => {
    if (onOptionsChange) onOptionsChange([...options, opt]);
    addSelection(opt, typeKey);
  };

  /**
   * REMOVE SELECTION
   * Receives the ID (not the object) and removes it from state.
   */
  const removeSelection = (idToRemove, typeKey) => {
    if (includeExclude) {
      const currentObj = value || { include: [], exclude: [] };
      const list = currentObj[typeKey] || [];
      
      const updatedList = list.filter(v => !areValuesEqual(v, idToRemove));

      const newState = {
        ...currentObj,
        [typeKey]: updatedList
      };

      // Clean up empty keys
      if (newState.include?.length === 0) delete newState.include;
      if (newState.exclude?.length === 0) delete newState.exclude;

      if (!newState.include && !newState.exclude) {
         onChange(undefined);
      } else {
         onChange(newState);
      }
    } else {
      const list = Array.isArray(value) ? value : [];
      const updatedList = list.filter(v => !areValuesEqual(v, idToRemove));
      onChange(updatedList.length > 0 ? updatedList : undefined);
    }
  };

  // --- Filtering ---

  const filterAvailableOptions = () => {
    if (type !== "multi") return [];

    return options.filter((opt) => {
      // Logic for Category Objects (Check if children are all selected)
      if (Array.isArray(opt.value) && opt.value.length > 0 && typeof opt.value[0] === "object" && !opt.value[0].min) {
         return !opt.value.every((subItem) => isIdSelected(subItem.value));
      }
      // Logic for Standard Items
      return !isIdSelected(opt.value);
    });
  };

  // --- Renderers ---

  const availableOptions = filterAvailableOptions();

  // Renders the tags by looking up the ID in our `labelCache`
  const renderSelectedTags = () => {
    if (type !== 'multi') return null;

    const renderTag = (id, typeKey) => (
      <span
        key={`${typeKey}-${typeof id === 'object' ? JSON.stringify(id) : id}`}
        className={`px-2 py-1 rounded-[4px] flex items-center gap-1 text-sm ${
          typeKey === "include" || typeKey === undefined
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {/* THIS IS THE MAGIC: Look up the label for the ID */}
        {getLabel(id)}
        <button
          className="ml-1 font-bold hover:text-black cursor-pointer"
          onClick={() => removeSelection(id, typeKey)}
        >
          ×
        </button>
      </span>
    );

    if (includeExclude) {
      const safeValue = value || {};
      return (
        <>
          {(safeValue.include || []).map(id => renderTag(id, 'include'))}
          {(safeValue.exclude || []).map(id => renderTag(id, 'exclude'))}
        </>
      );
    } 
    
    return (Array.isArray(value) ? value : []).map(id => renderTag(id, undefined));
  };

  // --- JSX ---

  const renderMulti = () => (
    <>
      <div className="flex flex-wrap gap-2 py-2 mb-2 min-h-[10px] max-h-50 overflow-y-auto pr-1 custom-scroll">
        {renderSelectedTags()}
      </div>

      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scroll">
        {availableOptions.map((opt, idx) => {
          const keyStr = typeof opt.value === "object" ? JSON.stringify(opt.value) : opt.value;
          const key = `${idx}-${keyStr}`;

          return includeExclude ? (
            <div key={key} className="flex items-center justify-between group">
              <span className="text-base text-[#6D6D6D] group-hover:text-black transition-colors">
                {opt.label}
              </span>
              <div className="flex gap-2 text-sm font-medium">
                <span
                  className="cursor-pointer text-gray-400 hover:text-green-800 transition-colors"
                  onClick={() => addSelection(opt, "include")}
                >
                  Include
                </span>
                <span className="text-gray-300">|</span>
                <span
                  className="cursor-pointer text-gray-400 hover:text-red-600 transition-colors"
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
        {availableOptions.length === 0 && !searchTerm && (
           <p className="text-gray-400 text-sm italic p-2">All options selected</p>
        )}
      </div>

      {isAutoSearchEnabled && (
        <div className="mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search to add..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 focus:outline-none text-[#7E7E7E] w-full border border-[#7E7E7E] rounded-[4px]"
            />
            {loading && (
               <div className="absolute right-3 top-1/2 -translate-y-1/2">
                 <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                 </svg>
               </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <ul className="border border-gray-300 bg-white max-h-40 overflow-y-auto mt-1 custom-scroll rounded-[4px] shadow-sm z-10 relative">
              {suggestions.map((s) => (
                <li key={s.value} className="px-3 py-2 flex justify-between hover:bg-gray-50">
                  {includeExclude ? (
                    <>
                      <span className="text-base text-[#6D6D6D]">{s.label}</span>
                      <div className="flex gap-2 text-sm">
                        <span className="cursor-pointer hover:text-green-800" onClick={() => addSuggestion(s, "include")}>Include</span>
                        <span className="text-gray-300">|</span>
                        <span className="cursor-pointer hover:text-red-600" onClick={() => addSuggestion(s, "exclude")}>Exclude</span>
                      </div>
                    </>
                  ) : (
                    <span className="cursor-pointer hover:text-green-800 w-full" onClick={() => addSuggestion(s)}>{s.label}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );

  const renderBoolean = () => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-[#04479C] transition-colors duration-200"></div>
        <div className="absolute left-0.5 top-0.5 bg-white border border-gray-300 h-5 w-5 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
      </label>
    </div>
  );

  const renderText = () => (
    <input
      type="text"
      placeholder={options.placeholder || ""}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-400 w-full rounded-[4px]"
    />
  );

  // --- Effects ---
  useEffect(() => {
    if (type !== "multi" || !isAutoSearchEnabled || !fetchOptions || searchTerm.length <= 1) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      setLoading(true);
      fetchWithCache(searchTerm)
        .then((newOptions) => {
           setSuggestions(newOptions.filter(n => !isIdSelected(n.value)));
        })
        .finally(() => setLoading(false));
    }, 100);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, value, fetchOptions, isAutoSearchEnabled, fieldKey, includeExclude, type]);

  return (
    <div className="flex flex-col gap-y-4 w-[320px] px-2 pt-3 pb-8 border border-[#7E7E7E] bg-[#FFFFFF] rounded-[8px] shadow-md">
      <div className="flex flex-col px-1.5">
        <h2 className="text-[20px] font-semibold text-[#04479C] font-urbanist">{title}</h2>
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