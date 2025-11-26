import { predefinedCompanyHeadcountsList, predefinedIndustriesList, predefinedLocationsList } from "../data/filterPredefinedValues";

export const guidedCampaignFiltersConfig = [
 {
    fieldKey: "advanced_keywords",
    title: "Keywords",
    type: "text",
    fields: [
       {
        fieldKey: "first_name",
        label: "First Name",
        placeholder: "Enter first name",
      },
      {
        fieldKey: "last_name",
        label: "Last Name",
        placeholder: "Enter last name",
      },
      { fieldKey: "title", label: "Title", placeholder: "Enter job title" },
      { fieldKey: "company", label: "Company", placeholder: "Enter company" },
      { fieldKey: "school", label: "School", placeholder: "Enter school" },
    ],
    tags: ["default"],
  },
  {
    fieldKey: "industry",
    title: "Industry",
    type: "multi",
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
