import { useEffect, useRef, useState } from "react";
import { BackButton, DropArrowIcon } from "../../../../components/Icons";
import { useNavigate, useParams } from "react-router";
import { getAgencyUsers, updateAgencyUser } from "../../../../services/agency";
import toast from "react-hot-toast";
const permissions = [
  "LinkedIn, X, FB, My Profile",
  "Campaigns",
  "Inbox",
  "Invitations",
  "Salesforce",
  "Hubspot",
  "Webhooks",
  "API Keys",
  "Email Integration",
  "Settings",
  "Templates",
  "Support",
  "Posts",
  "Global blacklists",
  "Global templates",
  "Dashboard",
  "Logs",
  "Integrations",
  "Workflows",
  "Personas",
];

const permissionKeyMap = {
  "LinkedIn, X, FB, My Profile": "linkedin_x_fb_my_profile",
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
  Posts: "posts",
  "Global blacklists": "global_blacklists",
  "Global templates": "global_templates",
  Dashboard: "dashboard",
  Logs: "logs",
  Integrations: "integrations",
  Workflows: "workflows",
  Personas: "personas",
};

const optionsCity = ["Ontario", "New York"];
const optionsCountry = ["Canada", "USA"];
const AgencyUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const dropdownRef = useRef(null);
  const dropdownRefCountry = useRef(null);
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [formData, setFormData] = useState(
    Object.fromEntries(permissions.map(p => [p, false])),
  );
  const handleSelectCity = opt => {
    setCity(opt);
    setOpenCity(false);
  };
  const handleSelectCountry = opt => {
    setCountry(opt);
    setOpenCountry(false);
  };
  const handleChange = item => {
    setFormData({
      ...formData,
      [item]: !formData[item],
    });
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenCity(false);
      }
      if (
        dropdownRefCountry.current &&
        !dropdownRefCountry.current.contains(event.target)
      ) {
        setOpenCountry(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenCity, setOpenCountry]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getAgencyUsers({ email: id });
        const user = response?.user;
        console.log("user data", user);
        if (user) {
          setEmail(user?.email);
          setFirstName(user?.first_name);
          setPassword(user?.password || "");
          setLastName(user?.last_name);
          setCompany(user?.company);
          setCountry(user?.country);
          setCity(user?.city);
          if (user.agency_permissions) {
            const updatedFormData = {};
            for (const label of permissions) {
              const key = permissionKeyMap[label];
              updatedFormData[label] = Boolean(user.agency_permissions[key]);
            }
            setFormData(updatedFormData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);
  const handleSubmit = async () => {
    const translatedPermissions = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        permissionKeyMap[key], // translate label to backend field
        value,
      ]),
    );

    const updates = {
      first_name: firstName,
      last_name: lastName,
      company: company,
      agency_permissions: translatedPermissions,
    };

    try {
      await updateAgencyUser(id, updates);
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  const handleSuperAdminToggle = () => {
    const newValue = !isSuperAdmin;
    setIsSuperAdmin(newValue);
    setFormData(Object.fromEntries(permissions.map(p => [p, newValue])));
  };
  useEffect(() => {
    const allSelected = Object.values(formData).every(v => v);
    if (allSelected && !isSuperAdmin) setIsSuperAdmin(true);
    if (!allSelected && isSuperAdmin) setIsSuperAdmin(false);
  }, [formData]);
  return (
    <div className="flex flex-col gap-y-[56px] bg-[#EFEFEF] px-[26px] pt-[45px] pb-[200px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div
            className="cursor-pointer"
            onClick={() => navigate("/agency/users")}
          >
            <BackButton />
          </div>
          <h1 className="text-[#6D6D6D] text-[44px] font-[300]">{id}</h1>
        </div>
      </div>
      <div className="flex flex-col px-[175px] text-[#7E7E7E] gap-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label>
            <span>Email</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled
            />
          </label>
          <label>
            <span>Change Password</span>
            <input
              type="password"
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <label>
            <span>First Name</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </label>
          <label>
            <span>Last Name</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label>
            <span>Company</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </label>
          {/* <label>
            <span>Proxy Country</span>
            <div className="relative w-full" ref={dropdownRefCountry}>
              <button
                onClick={() => setOpenCountry(prev => !prev)}
                className={`w-full p-2 border border-[#6D6D6D] bg-white cursor-pointer rounded-[6px] text-left flex justify-between items-center ${
                  country ? "text-[#7E7E7E]" : "text-gray-400"
                }`}
              >
                {country || "Select a country"}
                <DropArrowIcon className="h-[16px] w-[14px]" />
              </button>

              {openCountry && (
                <ul className="absolute left-0 mt-1 w-full overflow-hidden bg-white border border-[#6D6D6D] rounded-[6px] shadow-md z-10">
                  {optionsCountry.map(opt => (
                    <li
                      key={opt}
                      onClick={() => handleSelectCountry(opt)}
                      className="px-3 py-2 text-[#7E7E7E] hover:bg-gray-100 cursor-pointer"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label>
          <label>
            <span>Proxy City</span>
            <div className="relative w-full" ref={dropdownRef}>
              <button
                onClick={() => setOpenCity(prev => !prev)}
                className={`w-full p-2 border border-[#6D6D6D] bg-white cursor-pointer rounded-[6px] text-left flex justify-between items-center ${
                  city ? "text-[#7E7E7E]" : "text-gray-400"
                }`}
              >
                {city || "Select a city"}
                <DropArrowIcon className="h-[16px] w-[14px]" />
              </button>

              {openCity && (
                <ul className="absolute left-0 mt-1 w-full overflow-hidden bg-white border border-[#6D6D6D] rounded-[6px] shadow-md z-10">
                  {optionsCity.map(opt => (
                    <li
                      key={opt}
                      onClick={() => handleSelectCity(opt)}
                      className="px-3 py-2 text-[#7E7E7E] hover:bg-gray-100 cursor-pointer"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </label> */}
        </div>
        <div className="flex items-center gap-x-4">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={handleSuperAdminToggle}
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <p className="font-normal text-base">
            Provide Super Admin privileges (full access to Agency dashboard)
          </p>
        </div>
        <hr className="border-[#6D6D6D] w-full" />
        <p className="font-semibold text-base">
          Allow access to specific menus
        </p>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          {permissions.map(item => (
            <label key={item} className="flex items-center gap-x-3">
              <input
                type="checkbox"
                checked={formData[item]}
                onChange={() => handleChange(item)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-base font-normal">{item}</span>
            </label>
          ))}
        </div>
        <hr className="border-[#6D6D6D] w-full" />
        <button
          className="px-4 py-1 text-[#FFFFFF] border border-[#0387FF] bg-[#0387FF] cursor-pointer w-[130px] rounded-[4px]"
          onClick={handleSubmit}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default AgencyUserEdit;
