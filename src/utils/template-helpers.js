export const groupTemplatesByType = templates => {
  return templates.reduce((groups, template) => {
    const type = template.type || "unknown";
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(template);
    return groups;
  }, {});
};

export const variableOptions = [
  { label: "First Name", value: "{{FIRST_NAME}}" },
  { label: "Last Name", value: "{{LAST_NAME}}" },
  { label: "Industry", value: "{{INDUSTRY}}" },
  { label: "Company", value: "{{COMPANY}}" },
  { label: "Role", value: "{{ROLE}}" },
  { label: "Location", value: "{{LOCATION}}" },
  { label: "Custom Field 1", value: "{{CUSTOM_FIELD_1}}" },
  { label: "Custom Field 2", value: "{{CUSTOM_FIELD_2}}" },
  { label: "Custom Field 3", value: "{{CUSTOM_FIELD_3}}" },
];

export const templateCategories = {
  linkedin_invite: "LinkedIn Invite",
  linkedin_message: "LinkedIn Message",
  linkedin_inmail: "LinkedIn Inmail",
  email_message: "Email Message",
  inbox: "Inbox Response",
};

// Character limits for template body by type
export const TEMPLATE_BODY_LENGTH = {
  linkedin_invite: 275,
  linkedin_message: 1950,
  linkedin_inmail: 1900,
  email_message: 10000,
  inbox: 1950,
};

// Helper to get character limit for a category
export const getBodyCharLimit = (category) => {
  return TEMPLATE_BODY_LENGTH[category] || null;
};

// Helper to get plain text length from HTML content (for email editor)
export const getPlainTextLength = (html) => {
  if (!html) return 0;
  // Create a temporary element to extract text
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent?.length || 0;
};

export const insertTextAtCursor = ({
  fieldRef,
  valueToInsert,
  currentText,
}) => {
  const textarea = fieldRef?.current;
  if (!textarea) return;

  console.log(currentText);

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const before = currentText.substring(0, start);
  const after = currentText.substring(end);
  const updated = before + valueToInsert + after;

  // Move cursor after inserted value
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd =
      start + valueToInsert.length;
  }, 0);

  return updated;
};
