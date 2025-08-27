import { useState } from "react";
import { BackButton } from "../../../../components/Icons";
import { useNavigate, useParams } from "react-router";
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
const AgencyUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [formData, setFormData] = useState(
    Object.fromEntries(permissions.map(p => [p, false])),
  );

  const handleChange = item => {
    setFormData({
      ...formData,
      [item]: !formData[item],
    });
  };
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
              className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled
            />
          </label>
          <label>
            <span>Change Password</span>
            <input
              type="password"
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <label>
            <span>First Name</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </label>
          <label>
            <span>Last Name</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <label>
            <span>Company</span>
            <input
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={company}
              onChange={e => setCompany(e.target.value)}
            />
          </label>
          <label>
            <span>Proxy Country</span>
            <select
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="" disabled hidden>
                Select a country
              </option>
              <option>Canada</option>
              <option>America</option>
            </select>
          </label>
          <label>
            <span>Proxy City</span>
            <select
              className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E]"
              value={city}
              onChange={e => setCity(e.target.value)}
            >
              <option value="" disabled hidden>
                Select a city
              </option>
              <option>Ontario</option>
              <option>New York</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-x-4">
          <input
            type="checkbox"
            checked={isSuperAdmin}
            onChange={() => setIsSuperAdmin(!isSuperAdmin)}
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
        <button className="px-4 py-1 text-[#FFFFFF] border border-[#0387FF] bg-[#0387FF] cursor-pointer w-[130px]">
          Update
        </button>
      </div>
    </div>
  );
};

export default AgencyUserEdit;
