import {
  Filters,
  StepMessages,
  StepReview,
  StepRocket,
  StepSetting,
  StepWorkFlow,
  TargetAudience,
  Upload,
} from "../components/Icons";

export const campaignOptions = [
  {
    id: "sales-navigator",
    title: "Import from Sales Navigator or LinkedIn Search",
    description:
      "Start a campaign using a Sales Navigator list or LinkedIn search with full access to all setup options.",
  },
  {
    id: "guided",
    title: "Quick List Builder",
    description:
      "Set up a simple campaign with guided steps and smart criteria suggestions.",
  },

  {
    id: "csv-upload",
    title: "Upload LinkedIn Profile URLs",
    description:
      "Add LinkedIn profile URLs by uploading a CSV or pasting them into the field.",
  },
  {
    id: "custom-setup",
    title: "Built-In Search Filters",
    description:
      "Set up your campaign using built-in search filters without leaving the platform. Choose filters based on your subscription.",
    subOptions: [
      { id: "custom-setup-linkedin-premium", label: "LinkedIn Premium" },
      {
        id: "custom-setup-linkedin-sales-navigator",
        label: "LinkedIn Sales Navigator",
      },
    ],
  },
  {
    id: "existing-connections",
    title: "Existing Connections Campaign",
    description:
      "Create a campaign targeting your current LinkedIn connections directly from the platform.",
  },
];

export const campaignSteps = {
  default: [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "sales-navigator": [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "csv-upload": [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Upload CSV", icon: <Upload /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "existing-connections": [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Define Target Audience", icon: <TargetAudience /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "custom-setup-linkedin-sales-navigator": [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Filters", icon: <Filters /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "custom-setup-linkedin-premium": [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Filters", icon: <Filters /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  guided: [
    { label: "Select Workflow", icon: <StepWorkFlow /> },
    { label: "Select Source", icon: <StepSetting /> },
    { label: "Define Target Audience", icon: <TargetAudience /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
};

export const campaignSettingsToggleOptions = [
  {
    key: "include_first_degree_connections_only",
    label: "Include 1st-Degree Connections only",
    show: ["existing-connections"],
    readOnly: true,
  },
  {
    key: "exclude_first_degree_connections",
    label: "Exclude 1st-Degree Connections",
    show: [
      "sales-navigator",
      "guided",
      "csv-upload",
      "custom-setup-linkedin-premium",
      "custom-setup-linkedin-sales-navigator",
    ],
  },
  {
    key: "exclude_past_campaigns_targets",
    label: "Exclude Past Campaign Targets",
    show: [
      "sales-navigator",
      "guided",
      "csv-upload",
      "custom-setup-linkedin-premium",
      "custom-setup-linkedin-sales-navigator",
      "existing-connections",
    ],
  },
  {
    key: "exclude_replied_profiles",
    label: "Exclude Prospects Who Have Replied to you in the Past",
    show: [
      "sales-navigator",
      "guided",
      "csv-upload",
      "custom-setup-linkedin-premium",
      "custom-setup-linkedin-sales-navigator",
      "existing-connections",
    ],
  },
  {
    key: "split_open",
    label: "Split list into open and non-open profiles",
    show: [
      "sales-navigator",
      "guided",
      "csv-upload",
      "custom-setup-linkedin-premium",
      "custom-setup-linkedin-sales-navigator",
      "existing-connections",
    ],
  },
  {
    key: "import_open_only",
    label: "Import open profiles only",
    show: [
      "sales-navigator",
      "guided",
      "csv-upload",
      "custom-setup-linkedin-premium",
      "custom-setup-linkedin-sales-navigator",
      "existing-connections",
    ],
  },
];
export const proOnlyKeys = [
  {
    key: "enable_inbox_autopilot",
    label: "Enable inbox autopilot",
  },
  {
    key: "enable_sentiment_analysis",
    label: "Enable sentiment analysis",
  },
];

export const isValidURL = url => {
  try {
    const parsed = new URL(url);
    //console.log('parsed URL', parsed)
    return ["http:", "https:"].includes(parsed.protocol);
  } catch (e) {
    return false;
  }
};

export const templateNodeTypes = [
  "linkedin_invite",
  "linkedin_inmail",
  "email_message",
  "linkedin_message",
];

export const templateNodeConfig = {
  linkedin_invite: { requiresTemplate: false },
  linkedin_inmail: { requiresTemplate: true },
  email_message: { requiresTemplate: true },
  linkedin_message: { requiresTemplate: true }, // optional
};

export const areAllTemplatesAssigned = workflow => {
  return workflow.workflow.nodes.every(node => {
    const config = templateNodeConfig[node.type];

    if (config?.requiresTemplate) {
      // Check for template_id instead of template object
      const templateId = node.properties?.template_id;
      return templateId !== undefined && templateId !== null && templateId !== "";
    }
    return true;
  });
};
