import { useState } from "react";

const CreateGroupDialog = ({ onClose, onCreate, loading }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }
    onCreate(name.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-[455px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer disabled:opacity-50"
        >
          &times;
        </button>

        <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
          Create Group
        </h2>

        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Group Name"
            disabled={loading}
            className="w-full border border-[#7E7E7E] px-4 py-2 text-sm rounded-[6px] text-[#6D6D6D] focus:outline-none disabled:bg-gray-100"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-4">
          <button
            className="px-6 h-[36px] py-1 bg-[#7E7E7E] text-white rounded-[6px] cursor-pointer disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-6 h-[36px] py-1 text-white bg-[#0387FF] rounded-[6px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupDialog;
