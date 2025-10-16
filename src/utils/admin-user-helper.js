export const convertToCSV = data => {
  if (!data || data.length === 0) return "";

  const columns = [
    "Email",
    "First Name",
    "Last Name",
    "Company",
    "Agency",
    "Country",
    "Paid Until",
    "Version",
    "LinkedIn Connected",
    "Email Connected",
    "LinkedIn Premium",
    "Status",
    "Created At",
    "Last Updated",
  ];

  const headers = columns.join(",");

  const rows = data.map(user => {
    const linkedinAccount = user.accounts?.linkedin;
    const emailAccount = user.accounts?.email;

    const rowData = [
      `"${user.email || ""}"`,
      `"${user.first_name || ""}"`,
      `"${user.last_name || ""}"`,
      `"${user.company || ""}"`,
      `"${user.agency_username || ""}"`,
      `"${user.country || ""}"`,
      `"${user.paid_until || ""}"`,
      `"${user.version || ""}"`,
      `"${linkedinAccount ? "Yes" : "No"}"`,
      `"${emailAccount ? "Yes" : "No"}"`,
      `"${linkedinAccount?.data?.premium ? "Yes" : "No"}"`,
      `"${user.enabled ? "Active" : "Inactive"}"`,
      `"${new Date(user.created_at).toLocaleDateString()}"`,
      `"${new Date(user.updated_at).toLocaleDateString()}"`,
    ];

    return rowData.join(",");
  });

  return [headers, ...rows].join("\n");
};

export const downloadCSV = (csvContent, filename = "users.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
