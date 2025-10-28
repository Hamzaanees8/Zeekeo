import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  createHubSpotField,
  getHubSpotFields,
} from "../../../services/integrations";

const HubSpotCustomFieldModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [customFieldSource, setCustomFieldSource] = useState("create");
  const [customFieldName, setCustomFieldName] = useState(
    "",
  );
  const [customFieldNames, setCustomFieldNames] = useState([]);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const fields = await getHubSpotFields();
        setCustomFieldNames(fields);
      } catch (err) {
        console.error("Failed to fetch HubSpot fields", err);
        toast.error("Unable to fetch existing fields");
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!customFieldName)
        return toast.error("Select or enter the field first");

      const res = await createHubSpotField({
        name: customFieldName,
      });

      if (res.success) {
        toast.success("LinkedIn Profile field linked successfully!");
        onClose();
      } else {
        toast.error("Failed to create custom field");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-[400px] text-center">
          <p>Loading HubSpot fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Set LinkedIn Profile URL Field
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            ✕
          </button>
        </div>
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          Integration with HubSpot requires a contact field for storing
          LinkedIn profile URLs.
        </p>

        <div className="space-y-4 text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          {/* Create new field */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fieldSource"
                value="create"
                checked={customFieldSource === "create"}
                onChange={e => {
                  setCustomFieldSource(e.target.value);
                  setCustomFieldName("");
                }}
              />
              <span>Create new field</span>
            </label>
            {customFieldSource === "create" && (
              <input
                className="w-full mt-2 border rounded-md p-2 text-sm"
                value={customFieldName}
                onChange={e => setCustomFieldName(e.target.value)}
                placeholder="linkedin_profile_url"
              />
            )}
          </div>

          {/* Select existing field */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="fieldSource"
                value="select"
                checked={customFieldSource === "select"}
                onChange={e => {
                  setCustomFieldSource(e.target.value);
                  setCustomFieldName("");
                }}
              />
              <span>Select existing field</span>
            </label>
            {customFieldSource === "select" && (
              <select
                className="w-full mt-2 border rounded-md p-2 text-sm"
                value={customFieldName}
                onChange={e => setCustomFieldName(e.target.value)}
              >
                <option value="">-- Select a field --</option>
                {customFieldNames.map((field, idx) => (
                  <option key={idx} value={field.name}>
                    {field.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#16A37B] text-white rounded-md hover:bg-[#129366] cursor-pointer "
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotCustomFieldModal;
