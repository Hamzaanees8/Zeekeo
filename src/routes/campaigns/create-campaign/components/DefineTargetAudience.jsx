import React, { useState, useEffect, useMemo } from "react";
import { classicFiltersConfig } from "../../../../utils/classicFiltersConfig";
import ClassicFilterBlock from "../../../../components/campaign/classicFilterBlock";
import { searchFilterFields } from "../../../../services/linkedinSearch";
import useCampaignStore from "../../../stores/useCampaignStore";
import SalesNavigatorFilterBlock from "../../../../components/campaign/salesNavigatorFilterBlock";
import { salesNavigatorFiltersConfig } from "../../../../utils/salesNavigatorFiltersConfig";
import { guidedCampaignFiltersConfig } from "../../../../utils/guidedCampaignFiltersConfig";
import { existingConnectionsFiltersConfig } from "../../../../utils/existingConnectionsFiltersConfig";
import { getCurrentUser } from "../../../../utils/user-helpers";
import { guidedCampaignFiltersSNConfig } from "../../../../utils/guidedCampaignFiltersSNConfig";
import { existingConnectionsFiltersSNConfig } from "../../../../utils/existingConnectionsFiltersSNConfig";

const DefineTargetAudience = ({ product }) => {
  const {
    filterOptions,
    setFilterOptions,
    updateFilterOptions,
    filterFields,
    setFilterFields,
  } = useCampaignStore();

  const currentUser = getCurrentUser();
  const accountId = currentUser?.accounts?.linkedin?.id || null;
  const hasSNAccount =
    currentUser.accounts?.linkedin?.data?.sales_navigator?.owner_seat_id ||
    null;

  const filterComponentMap = {
    classic: ClassicFilterBlock,
    sales_navigator: SalesNavigatorFilterBlock,
    guided: hasSNAccount ? SalesNavigatorFilterBlock : ClassicFilterBlock,
    existing_connections: hasSNAccount
      ? SalesNavigatorFilterBlock
      : ClassicFilterBlock,
  };

  const filterConfigMap = {
    classic: classicFiltersConfig,
    sales_navigator: salesNavigatorFiltersConfig,
    guided: hasSNAccount
      ? guidedCampaignFiltersSNConfig
      : guidedCampaignFiltersConfig,
    existing_connections: hasSNAccount
      ? existingConnectionsFiltersSNConfig
      : existingConnectionsFiltersConfig,
  };

  const FilterComponent = filterComponentMap[product] || ClassicFilterBlock;

  const filtersConfig = useMemo(
    () => filterConfigMap[product] || classicFiltersConfig,
    [product],
  );

  useEffect(() => {
    const updatedOptions = { ...filterOptions };
    const updatedFields = { ...filterFields };

    filtersConfig.forEach(cfg => {
      if (
        !updatedOptions[cfg.fieldKey] ||
        updatedOptions[cfg.fieldKey].length === 0
      ) {
        updatedOptions[cfg.fieldKey] = cfg.predefinedValues || [];
      }

      if (
        product === "existing_connections" &&
        cfg.fieldKey === "network_distance"
      ) {
        const defaultOption = { label: "1st", value: 1 };
        updatedOptions[cfg.fieldKey] = [defaultOption];
        updatedFields[cfg.fieldKey] = [defaultOption.value];
      }
    });

    setFilterOptions(updatedOptions);
    setFilterFields(updatedFields);
  }, [filtersConfig, setFilterOptions, setFilterFields, product]);

  const handleFilterChange = (fieldKey, newValue) => {
    if (
      product === "existing_connections" &&
      fieldKey === "network_distance"
    ) {
      if (!newValue || newValue.length === 0) {
        setFilterFields({ [fieldKey]: [1] });
        return;
      }
    }

    setFilterFields({ [fieldKey]: newValue });
  };

  const handleOptionsChange = (fieldKey, newOptions) => {
    setFilterOptions({ [fieldKey]: newOptions });
  };

  const categories = [...new Set(filtersConfig.flatMap(f => f.tags))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const showCategoryButtons = categories.length > 1;

  // Filter config for the active product & category
  const visibleFilters = filtersConfig.filter(f =>
    f.tags.includes(activeCategory),
  );
  console.log("filterFields", filterFields);
  return (
    <div className="w-full">
      <div>
        <div className="flex gap-2 mb-3">
          {showCategoryButtons &&
            categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 text-[16px] border border-[#7E7E7E] transition-all duration-150 rounded-[4px] cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#7E7E7E] text-white"
                    : "bg-[#FFFFFF] text-[#7E7E7E]"
                }`}
              >
                {cat}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleFilters.map((filterProps, idx) => (
          <FilterComponent
            key={filterProps.fieldKey}
            {...filterProps}
            options={filterOptions[filterProps.fieldKey] || []}
            value={
              filterProps.type === "multi"
                ? filterFields[filterProps.fieldKey] || []
                : filterFields[filterProps.fieldKey] || ""
            }
            fetchOptions={keywords =>
              searchFilterFields({
                accountId,
                type: filterProps.filterKey,
                keywords,
              })
            }
            onChange={val => handleFilterChange(filterProps.fieldKey, val)}
            onOptionsChange={opts =>
              handleOptionsChange(filterProps.fieldKey, opts)
            }
            disabled={
              product === "existing_connections" &&
              filterProps.fieldKey === "network_distance"
            }
          />
        ))}
      </div>
    </div>
  );
};

export default DefineTargetAudience;
