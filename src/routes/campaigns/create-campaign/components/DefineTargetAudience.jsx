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
import toast from "react-hot-toast";
import { getLinkedinProfiles } from "../../../../services/campaigns";

const DefineTargetAudience = ({ product, filterApi }) => {
  const {
    filterOptions,
    setFilterOptions,
    updateFilterOptions,
    filterFields,
    setFilterFields,
  } = useCampaignStore();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUser = getCurrentUser();
  const accountId = currentUser?.accounts?.linkedin?.id || null;
  const hasSNAccount =
    currentUser.accounts?.linkedin?.data?.sales_navigator?.owner_seat_id || null;

  const filterComponentMap = {
    classic: ClassicFilterBlock,
    sales_navigator: SalesNavigatorFilterBlock,
    guided: hasSNAccount ? SalesNavigatorFilterBlock : ClassicFilterBlock,
    existing_connections: hasSNAccount
      ? SalesNavigatorFilterBlock
      : ClassicFilterBlock,
  };
  console.log('filterApi', filterApi);

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
    [product]
  );

  const [showTable, setShowTable] = useState(false);
  console.log('filterFields', filterFields);

  useEffect(() => {
    const updatedOptions = { ...filterOptions };
    const updatedFields = { ...filterFields };

    filtersConfig.forEach((cfg) => {
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
    if (product === "existing_connections" && fieldKey === "network_distance") {
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

  const categories = [...new Set(filtersConfig.flatMap((f) => f.tags))];
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const showCategoryButtons = categories.length > 1;

  const visibleFilters = filtersConfig.filter((f) =>
    f.tags.includes(activeCategory)
  );

  const hasSelectedFilter = Object.values(filterFields).some((val) => {
    if (!val) return false;

    // Classic filters (arrays)
    if (Array.isArray(val)) return val.length > 0;

    // Sales Navigator style filters with include/exclude
    if (typeof val === "object") {
      return (
        (Array.isArray(val.include) && val.include.length > 0) ||
        (Array.isArray(val.exclude) && val.exclude.length > 0)
      );
    }

    // For single values (string, number, etc.)
    return Boolean(val);
  });

  // Static Data
  // const profiles = [
  //   {
  //     picture: "https://randomuser.me/api/portraits/men/1.jpg",
  //     name: "John Doe",
  //     title: "Marketing Manager",
  //     company: "TechCorp Ltd.",
  //     industry: "Information Technology",
  //     location: "New York, USA",
  //   },
  //   {
  //     picture: "https://randomuser.me/api/portraits/women/2.jpg",
  //     name: "Jane Smith",
  //     title: "HR Specialist",
  //     company: "PeopleFirst Inc.",
  //     industry: "Human Resources",
  //     location: "London, UK",
  //   },
  // ];

  const normalizeFiltersForUnipile = (filters) => {
    const normalized = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value?.include) {
        normalized[key] = {
          include: value.include.flat(),
        };
      }

      else if (key === "company_headcount" && Array.isArray(value)) {
        normalized[key] = value.map((range) => ({
          min: range.min,
          max: range.max,
        }));
      }

      else if (key === "network_distance" && Array.isArray(value)) {
        normalized[key] = value.flat();
      }

      else {
        normalized[key] = value;
      }
    }

    return normalized;
  };


  const handlePreviewProfiles = async () => {
    if (!hasSelectedFilter) {
      toast.success("Please select at least one filter before previewing.");
      return;
    }

    setLoading(true);
    try {
      const formattedFilters = normalizeFiltersForUnipile(filterFields);

      const response = await getLinkedinProfiles({
        filterApi: filterApi ?? 'classic',
        accountId,
        filters: formattedFilters,
        limit: 25,
      });

      setProfiles(response?.profiles);

      setShowTable(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch preview profiles.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full">
      {/* Category Buttons */}
      <div className="flex gap-2 mb-3">
        {showCategoryButtons &&
          categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-1 text-[16px] border border-[#7E7E7E] transition-all duration-150 rounded-[4px] cursor-pointer ${activeCategory === cat
                ? "bg-[#7E7E7E] text-white"
                : "bg-[#FFFFFF] text-[#7E7E7E]"
                }`}
            >
              {cat}
            </button>
          ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleFilters.map((filterProps) => (
          <FilterComponent
            key={filterProps.fieldKey}
            {...filterProps}
            options={filterOptions[filterProps.fieldKey] || []}
            value={
              filterProps.type === "multi"
                ? filterFields[filterProps.fieldKey] || []
                : filterFields[filterProps.fieldKey] || ""
            }
            fetchOptions={(keywords) =>
              searchFilterFields({
                accountId,
                type: filterProps.filterKey,
                keywords,
              })
            }
            onChange={(val) => handleFilterChange(filterProps.fieldKey, val)}
            onOptionsChange={(opts) =>
              handleOptionsChange(filterProps.fieldKey, opts)
            }
            disabled={
              product === "existing_connections" &&
              filterProps.fieldKey === "network_distance"
            }
          />
        ))}
      </div>

      {/* Validation Message or Button */}
      <div className="mt-8 text-center">
        {!hasSelectedFilter ? (
          <p className="text-red-500 text-[15px]">
            Please select at least one filter before proceeding.
          </p>
        ) : (
          <button
            onClick={handlePreviewProfiles}
            disabled={loading}
            className={`${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#5e5e5e]"
              } bg-[#7E7E7E] text-white font-semibold px-6 py-2 rounded-[6px] transition-all duration-200`}
          >
            {loading ? "Loading..." : "Preview Filtered Profiles"}
          </button>
        )}
      </div>

      {/* Table Section */}
      {(profiles?.length > 0 && showTable) && (
        <div>
          <p className="text-[#7E7E7E] px-4 py-3 font-semibold text-[14px]">Total: {profiles?.length >= 25 ? profiles?.length + "+" : profiles?.length}</p>
        </div>)
      }
      {showTable && hasSelectedFilter && (
        <div className="mt-2 overflow-x-auto">
          <div className="border border-[#7E7E7E] rounded-lg overflow-hidden mt-4">
            <table className="min-w-full">
              <thead className="bg-[#F9F9F9] text-[#7E7E7E] text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[14px]">Profile Picture</th>
                  <th className="px-4 py-3 font-semibold text-[14px]">Name</th>
                  <th className="px-4 py-3 font-semibold text-[14px]">Title</th>
                  <th className="px-4 py-3 font-semibold text-[14px]">Company</th>
                  <th className="px-4 py-3 font-semibold text-[14px]">Industry</th>
                  <th className="px-4 py-3 font-semibold text-[14px]">Location</th>
                </tr>
              </thead>
              <tbody>
                {profiles?.map((p, index) => (
                  <tr
                    key={index}
                    className="border-t border-[#7E7E7E] hover:bg-gray-50 transition-all duration-150"
                  >
                    <td className="px-4 py-3">
                      <img
                        src={p.profile_picture_url}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#333]">{p.name}</td>
                    <td className="px-4 py-3 text-[14px] text-[#333] w-[40%]">{p.headline}</td>
                    <td className="px-4 py-3 text-[14px] text-[#333]">
                      {Array.isArray(p?.current_positions) && p.current_positions.length > 0
                        ? p.current_positions[0]?.company
                        : p?.current_positions ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-[#333]">{p.industry ?? '-'}</td>
                    <td className="px-4 py-3 text-[14px] text-[#333] w-[15%]">{p.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default DefineTargetAudience;
