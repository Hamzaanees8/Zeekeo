export const guidedCampaignFiltersConfig = [
  {
    fieldKey: "advanced_keywords",
    title: "Keywords",
    type: "text",
    fields: [
      /*  {
        fieldKey: "first_name",
        label: "First Name",
        placeholder: "Enter first name",
      },
      { fieldKey: "last_name", label: "Last Name", placeholder: "Enter last name" },
       */
      {
        fieldKey: "title",
        label: "Title",
        placeholder: "Enter job title",
      },
      /*    
      { fieldKey: "company", label: "Company", placeholder: "Enter company" },
      { fieldKey: "school", label: "School", placeholder: "Enter school" }, */
    ],
    tags: ["default"],
  },
  {
    fieldKey: "industry",
    title: "Industry",
    type: "multi",
      predefinedValues: [
      {
        label: "Technology / IT / Software / Information Services",
        value: [
          "6",
          "4",
          "84",
          "96",
          "1855",
          "3102",
          "3128",
          "1285",
          "3127",
          "3101",
          "3099",
          "3100",
          "3130",
        ],
      },
      {
        label: "Professional Services",
        value: ["1810", "105", "96", "80", "11", "99", "70", "43", "1862"],
      },
      {
        label: "Financial Services",
        value: ["43", "41", "45", "42", "1725", "1737"],
      },
      {
        label: "Manufacturing",
        value: ["25", "53", "112", "135", "15", "54", "23", "55", "17", "1"],
      },
      {
        label: "Education",
        value: ["68", "132", "67", "1999", "105"],
      },
    ],
    isAutoSearchEnabled: true,

    filterKey: "industry",
    tags: ["default"],
  },
  {
    fieldKey: "company_headcount",
    title: "Company Size",
    type: "multi",
    predefinedValues: [
      { label: "1-10", value: { min: 1, max: 10 } },
      { label: "51-200", value: { min: 51, max: 200 } },
      { label: "501 - 1000", value: { min: 501, max: 1000 } },
      { label: "1001-5000", value: { min: 1001, max: 5000 } },
      { label: "5001-10,000", value: { min: 5001, max: 10000 } },
      { label: "10,000+", value: { min: 10001 } },
    ],
    isAutoSearchEnabled: false,
    tags: ["default"],
  },
  {
    fieldKey: "location",
    title: "Locations",
    type: "multi",
    predefinedValues: [
      { label: "United States", value: "103644278" },
      { label: "North America (US + CA)", value: ["103644278", "101174742"] },
      { label: "United Kingdom", value: "101165590" },
      {
        label: "Western Europe",
        value: [
          "101165590",
          "103883259",
          "100565514",
          "105015875",
          "101282230",
          "104738515",
          "100878084",
          "104042105",
          "101352147",
          "102890719",
          "106693272",
        ],
      },
      {
        label: "Nordics",
        value: [
          "104514075",
          "100456013",
          "105238872",
          "103819153",
          "105117694",
        ],
      },
    ],
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
