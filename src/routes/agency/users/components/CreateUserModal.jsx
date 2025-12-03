import { useState, useEffect } from "react";
import { Cross } from "../../../../components/Icons";

const permissionsList = [
  "LinkedIn",
  "X",
  "Campaigns",
  "Inbox",
  // "Invitations",
  "Salesforce",
  "Hubspot",
  "Webhooks",
  "API Keys",
  "Email Integration",
  "Settings",
  "Templates",
  "Support",
  "Social Engagement",
  "Global blacklists",
  // "Global templates",
  // "Dashboard",
  "Logs",
  "Integrations",
  "Workflows",
  "Personas",
];

const permissionKeyMap = {
  LinkedIn: "linkedIn",
  X: "x",
  Campaigns: "campaigns",
  Inbox: "inbox",
  Invitations: "invitations",
  Salesforce: "salesforce",
  Hubspot: "hubspot",
  Webhooks: "webhooks",
  "API Keys": "api_keys",
  "Email Integration": "email_integration",
  Settings: "settings",
  Templates: "templates",
  Support: "support",
  "Social Engagement": "social_engagement",
  "Global blacklists": "global_blacklists",
  "Global templates": "global_templates",
  Dashboard: "dashboard",
  Logs: "logs",
  Integrations: "integrations",
  Workflows: "workflows",
  Personas: "personas",
};

const defaultSelected = [
  "LinkedIn",
  "Campaigns",
  "Templates",
  "Social Engagement",
  "Workflows",
  "Inbox",
  "Settings",
  "Global blacklists",
  "Personas",
];

const CreateUserModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    companyName: "",
  });

  const [permissions, setPermissions] = useState(
    Object.fromEntries(
      permissionsList.map(p => [p, defaultSelected.includes(p)]),
    ),
  );

  const [isAgencyAdmin, setIsAgencyAdmin] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    const allSelected = Object.values(permissions).every(v => v);
    if (allSelected && !isSelectAll) setIsSelectAll(true);
    if (!allSelected && isSelectAll) setIsSelectAll(false);
  }, [permissions]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = key => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllToggle = () => {
    const newValue = !isSelectAll;
    setIsSelectAll(newValue);
    setPermissions(
      Object.fromEntries(permissionsList.map(p => [p, newValue])),
    );
  };

  const handleSubmit = e => {
    e.preventDefault();

    const translatedPermissions = Object.fromEntries(
      Object.entries(permissions).map(([key, value]) => [
        permissionKeyMap[key],
        value,
      ]),
    );

    onSave({
      ...formData,
      agency_admin: isAgencyAdmin,
      enabled: isEnabled,
      agency_permissions: translatedPermissions,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[600px] p-6 rounded-[8px] shadow-md max-h-[90vh] overflow-y-auto overflow-hidden custom-scroll1">
        <div className="flex items-center justify-between mb-6 border-b border-[#7E7E7E]">
          <h2 className="text-[24px] font-semibold text-[#0387FF]">
            Add User
          </h2>
          <button onClick={onClose}>
            <Cross className="w-6 h-6 text-[#6D6D6D] cursor-pointer" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium text-[#6D6D6D]">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="border border-[#7E7E7E] text-sm rounded-[6px] px-3 py-2 outline-none focus:border-[#0387FF]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium text-[#6D6D6D]">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="border border-[#7E7E7E] text-sm rounded-[6px] px-3 py-2 outline-none focus:border-[#0387FF]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium text-[#6D6D6D]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-[#7E7E7E] rounded-[6px] text-sm px-3 py-2 outline-none focus:border-[#0387FF]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium text-[#6D6D6D]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="border border-[#7E7E7E] text-sm rounded-[6px] px-3 py-2 outline-none focus:border-[#0387FF]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-[16px] font-medium text-[#6D6D6D]">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="border border-[#7E7E7E] text-sm rounded-[6px] px-3 py-2 outline-none focus:border-[#0387FF]"
                required
              />
            </div>
            <div className="flex items-center gap-x-4 h-[42px]">
              <input
                type="checkbox"
                checked={isAgencyAdmin}
                onChange={e => setIsAgencyAdmin(e.target.checked)}
                className="w-5 h-5 accent-[#0387FF] cursor-pointer"
              />
              <p className="font-normal text-base text-[#6D6D6D]">
                Make it Agency Admin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-x-4">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={e => setIsEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#0387FF] cursor-pointer"
            />
            <p className="font-normal text-base text-[#6D6D6D]">Enable User</p>
          </div>

          <div className="mt-2 flex flex-col gap-4">
            <div>
              <p className="font-semibold text-base text-[#6D6D6D] mb-2">
                Allow access to specific menus
              </p>
              <hr className="border-[#7E7E7E] w-full mb-4" />

              <div className="flex items-center gap-x-4 mb-4">
                <input
                  type="checkbox"
                  checked={isSelectAll}
                  onChange={handleSelectAllToggle}
                  className="w-5 h-5 accent-[#0387FF] cursor-pointer"
                />
                <p className="font-normal text-base text-[#6D6D6D]">
                  Select All Permissions
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {permissionsList.map(item => (
                  <label
                    key={item}
                    className="flex items-center gap-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={permissions[item]}
                      onChange={() => handlePermissionChange(item)}
                      className="w-4 h-4 accent-[#0387FF]"
                    />
                    <span className="text-[14px] font-normal text-[#6D6D6D]">
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <hr />
          <div className="flex justify-end mt-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#7E7E7E] rounded-[6px] text-[#7E7E7E] font-medium hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0387FF] text-white rounded-[6px] font-medium hover:bg-[#0265BF] cursor-pointer"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
