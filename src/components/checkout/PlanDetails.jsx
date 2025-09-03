import { useState, useEffect } from "react";
import { planFeatures } from "../../utils/planFeatures";

export default function PlanDetails({ planType }) {
  const featuresConfig = planFeatures[planType];
  const [expandedSections, setExpandedSections] = useState({});

   // Expand all collapsible sections by default when planType changes
  useEffect(() => {
    if (featuresConfig) {
      const defaults = Object.keys(featuresConfig).reduce((acc, key) => {
        acc[key] = true; // everything open by default
        return acc;
      }, {});
      setExpandedSections(defaults);
    }
  }, [featuresConfig]);

  if (!featuresConfig) return null;

  const toggleSection = key => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="flex-1 space-y-6 text-white">
      {Object.entries(featuresConfig).map(([sectionKey, section]) => {
        const isCollapsible =
          sectionKey === "basic" ||
          sectionKey === "premiumAgency" ||
          sectionKey === "more" ||
          sectionKey === "pro";

        return (
          <div key={sectionKey} className="flex flex-col gap-y-4">
            {/* Section Header */}
            {section.label && (
              <div
                className={`flex items-center gap-x-[15px] ${
                  isCollapsible ? "cursor-pointer" : ""
                }`}
                onClick={() => isCollapsible && toggleSection(sectionKey)}
              >
                <h2 className="font-normal text-sm">{section.label}</h2>

                {isCollapsible && (
                  <div className="px-5 cursor-pointer">
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform duration-300 ${
                        expandedSections[sectionKey]
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    >
                      <path
                        d="M9.943 0.768C9.90056 0.687222 9.83687 0.619568 9.7588 0.572338C9.68073 0.525108 9.59124 0.500095 9.5 0.5H0.499999C0.408921 0.500376 0.319668 0.525573 0.241839 0.572881C0.16401 0.62019 0.10055 0.687819 0.0582832 0.768497C0.0160162 0.849174 -0.00345847 0.939848 0.00195351 1.03077C0.00736549 1.12168 0.0374594 1.20941 0.0889988 1.2845L4.589 7.7845C4.63487 7.85112 4.69625 7.90559 4.76784 7.94322C4.83944 7.98085 4.91911 8.00052 5 8.00052C5.08088 8.00052 5.16056 7.98085 5.23215 7.94322C5.30375 7.90559 5.36513 7.85112 5.411 7.7845L9.911 1.2845C9.96304 1.20956 9.99354 1.12179 9.99919 1.03072C10.0048 0.939659 9.98539 0.848791 9.943 0.768ZM5 6.6215L1.454 1.5H8.546L5 6.6215Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )}

            {/* Features List */}
            {(!isCollapsible || expandedSections[sectionKey]) && (
              <ul className="space-y-[5px] text-xs">
                {section.features.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <BlueCheck /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BlueCheck() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 17 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 16.4443C9.53416 16.4443 10.5582 16.2374 11.5136 15.8354C12.4691 15.4333 13.3372 14.8441 14.0685 14.1012C14.7997 13.3583 15.3798 12.4764 15.7756 11.5058C16.1713 10.5352 16.375 9.49491 16.375 8.44434C16.375 7.39376 16.1713 6.35347 15.7756 5.38287C15.3798 4.41226 14.7997 3.53035 14.0685 2.78748C13.3372 2.04461 12.4691 1.45534 11.5136 1.0533C10.5582 0.651262 9.53416 0.444336 8.5 0.444336C6.41142 0.444336 4.40838 1.28719 2.93153 2.78748C1.45469 4.28777 0.625 6.3226 0.625 8.44434C0.625 10.5661 1.45469 12.6009 2.93153 14.1012C4.40838 15.6015 6.41142 16.4443 8.5 16.4443ZM8.297 11.6799L12.672 6.34656L11.328 5.20878L7.5655 9.79456L5.61862 7.81589L4.38138 9.07278L7.00638 11.7394L7.68363 12.4274L8.297 11.6799Z"
        fill="#0387FF"
      />
    </svg>
  );
}
