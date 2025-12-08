import { useState } from "react";
import { DropArrowIcon } from "../../../../components/Icons";

const RemoveMemberConfirmDialog = ({ email, onClose, onConfirm, loading }) => (
  <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/40">
    <div className="bg-white w-[400px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
      <button
        onClick={onClose}
        disabled={loading}
        className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer disabled:opacity-50"
      >
        &times;
      </button>

      <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
        Remove Member
      </h2>

      <p className="text-[#6D6D6D] text-sm mb-6">
        Are you sure you want to remove <strong>{email}</strong> from this group?
      </p>

      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 h-[36px] py-1 bg-[#7E7E7E] text-white rounded-[6px] cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-6 h-[36px] py-1 text-white bg-red-500 rounded-[6px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Removing..." : "Remove"}
        </button>
      </div>
    </div>
  </div>
);

const ManageMembersDialog = ({
  group,
  availableUsers,
  onClose,
  onAddMember,
  onRemoveMember,
  loading,
}) => {
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);

  const handleAddMember = async () => {
    if (selectedUser) {
      await onAddMember(selectedUser);
      setSelectedUser("");
      setShowUserPicker(false);
    }
  };

  const handleRemoveClick = (email) => {
    setMemberToRemove(email);
  };

  const handleRemoveConfirm = async () => {
    if (memberToRemove) {
      await onRemoveMember(memberToRemove);
      setMemberToRemove(null);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-[500px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer disabled:opacity-50"
        >
          &times;
        </button>

        <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
          Manage Members - {group.name}
        </h2>

        {/* Add Member Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-[#6D6D6D] text-sm">
              Members ({group.members?.length || 0})
            </span>
            {!showUserPicker && availableUsers.length > 0 && (
              <button
                onClick={() => setShowUserPicker(true)}
                disabled={loading}
                className="text-[#0387FF] text-sm cursor-pointer hover:underline disabled:opacity-50"
              >
                + Add Member
              </button>
            )}
          </div>

          {/* User Picker Dropdown */}
          {showUserPicker && (
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  disabled={loading}
                  className="appearance-none w-full border border-[#7E7E7E] rounded-[6px] px-4 py-2 text-sm bg-white text-[#6D6D6D] focus:outline-none pr-10 cursor-pointer disabled:bg-gray-100"
                >
                  <option value="">Select a user...</option>
                  {availableUsers.map((user) => (
                    <option key={user.email} value={user.email}>
                      {user.name || user.email} ({user.email})
                    </option>
                  ))}
                </select>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                  <DropArrowIcon />
                </div>
              </div>
              <button
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
                className={`px-4 py-2 text-sm rounded-[6px] text-white ${
                  selectedUser && !loading
                    ? "bg-[#0387FF] cursor-pointer"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Adding..." : "Add"}
              </button>
              <button
                onClick={() => {
                  setShowUserPicker(false);
                  setSelectedUser("");
                }}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-[6px] text-[#6D6D6D] border border-[#7E7E7E] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="border border-[#7E7E7E] rounded-[6px] max-h-[300px] overflow-y-auto">
            {group.members?.length === 0 ? (
              <div className="px-4 py-4 text-gray-500 text-center text-sm">
                No members yet
              </div>
            ) : (
              group.members?.map((email) => (
                <div
                  key={email}
                  className="flex justify-between items-center px-4 py-3 border-b border-[#CCCCCC] last:border-b-0"
                >
                  <span className="text-[#6D6D6D] text-sm">{email}</span>
                  <button
                    onClick={() => handleRemoveClick(email)}
                    disabled={loading}
                    className="text-red-500 text-sm cursor-pointer hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 h-[36px] py-1 bg-[#7E7E7E] text-white rounded-[6px] cursor-pointer disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      {memberToRemove && (
        <RemoveMemberConfirmDialog
          email={memberToRemove}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleRemoveConfirm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default ManageMembersDialog;
