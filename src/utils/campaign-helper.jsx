import {
  Filters,
  StepMessages,
  StepReview,
  StepRocket,
  StepSetting,
  TargetAudience,
  Upload,
} from "../components/Icons";
import CampaignSetting from "../routes/campaigns/create-campaign/components/CampaignSetting";
import CreateMessages from "../routes/campaigns/create-campaign/components/CreateMessages";
import CreateReview from "../routes/campaigns/create-campaign/components/CreateReview";
import Launch from "../routes/campaigns/create-campaign/components/Launch";

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

export const campaignStepsMap = {
  "sales-navigator": [
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "csv-upload": [
    { label: "Upload CSV", icon: <Upload /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "existing-connection": [
    { label: "Define Target Audience", icon: <TargetAudience /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "custom-setup-linkedin-sales-navigator": [
    { label: "Filters", icon: <Filters /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  "custom-setup-linkedin-premium": [
    { label: "Filters", icon: <Filters /> },
    { label: "Settings", icon: <StepSetting /> },
    { label: "Create Messages", icon: <StepMessages /> },
    { label: "Review", icon: <StepReview /> },
    { label: "Launch", icon: <StepRocket /> },
  ],
  guided: [
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
    key: "split_premium",
    label: "Split list into Premium (Open) and Non Premium Profiles",
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
    key: "import_premium_only",
    label: "Import only Premium (Open) Profiles",
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
      const template = node.properties?.template;
      return (
        template !== undefined &&
        template !== null &&
        typeof template === "object" &&
        Object.keys(template).length > 0
      );
    }
    return true;
  });
};
