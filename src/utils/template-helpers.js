export const groupTemplatesByType = (templates) => {
  return templates.reduce((groups, template) => {
    const type = template.type || 'unknown';
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
];

export const templateCategories = {
  linkedin_invite: "InVite",
  linkedin_message: "Sequence Message",
  linkedin_inmail: "InMail",
  email_message: "Email Sequence",
};


export const insertTextAtCursor = ({
  fieldRef,
  valueToInsert,
  currentText
}) => {
  const textarea = fieldRef?.current;
  if (!textarea) return;

  console.log(currentText)

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const before = currentText.substring(0, start);
  const after = currentText.substring(end);
  const updated = before + valueToInsert + after;

  // Move cursor after inserted value
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + valueToInsert.length;
  }, 0);

  return updated;

};
