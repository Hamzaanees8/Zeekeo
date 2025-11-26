import { pre } from "framer-motion/client";
import { predefinedCompanyHeadcountsList, predefinedIndustriesList, predefinedJobTitlesList, predefinedLocationsList } from "../data/filterPredefinedValues";

export const existingConnectionsFiltersSNConfig = [
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
    predefinedValues: predefinedIndustriesList,
    includeExclude: true,
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
    includeExclude: true,
    isAutoSearchEnabled: true,
    filterKey: "location",
    tags: ["default"],
  },
  {
    fieldKey: "network_distance",
    title: "Connection Degree",
    type: "multi",
    predefinedValues: [{ label: "1st", value: 1 }],
    isAutoSearchEnabled: false,
    tags: ["default"],
  },
];
