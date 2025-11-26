import { predefinedCompanyHeadcountsList, predefinedIndustriesList, predefinedJobTitlesList, predefinedLocationsList } from "../data/filterPredefinedValues";

export const guidedCampaignFiltersSNConfig = [
  {
    fieldKey: "role",
    title: "Titles",
    type: "multi",
    predefinedValues: predefinedJobTitlesList,
    includeExclude: true,
    isAutoSearchEnabled: true,
    filterKey: "job_title",
    tags: ["default"],
  },
  {
    fieldKey: "industry",
    title: "Industry",
    type: "multi",
    includeExclude: true,
    predefinedValues: predefinedIndustriesList,
    isAutoSearchEnabled: true,
    filterKey: "industry",
    tags: ["default"],
  },
  {
    fieldKey: "company_headcount",
    title: "Company Size",
    type: "multi",
    predefinedValues: predefinedCompanyHeadcountsList,
    isAutoSearchEnabled: false,
    tags: ["default"],
  },
  {
    fieldKey: "location",
    title: "Locations",
    type: "multi",
    includeExclude: true,
    predefinedValues: predefinedLocationsList,
    isAutoSearchEnabled: true,
    filterKey: "location",
    tags: ["default"],
  },
  {
    fieldKey: "network_distance",
    title: "Connection Degree",
    type: "multi",
    predefinedValues: [
      { label: "1st", value: 1 },
      { label: "2nd (Recommended)", value: 2 },
      { label: "3rd+", value: 3 },
    ],
    isAutoSearchEnabled: false,
    tags: ["default"],
  },
];
