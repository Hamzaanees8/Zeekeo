const DisableUserModal = ({ onClose, onClick, userEmail, action = "disable" }) => {
  const isEnable = action === "enable";
  const isDelete = action === "delete";

  const actionColor = isDelete ? "#D62828" : isEnable ? "#038D65" : "#D62828";
  const actionText = isDelete ? "Delete User" : isEnable ? "Enable User" : "Disable User";

  const confirmMessage = isDelete
    ? `This is a permanent action and cannot be undone. Are you sure you want to permanently delete this user (${userEmail})?`
    : isEnable
    ? `Are you sure you want to enable this user (${userEmail})?`
    : `Are you sure you want to disable this user (${userEmail})? You can re-enable the user later.`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Confirmation
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
          {confirmMessage}
        </p>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <div className="flex items-center gap-x-5">
            <button
              onClick={onClick}
              style={ isDelete ? { backgroundColor: actionColor, color: '#FFFFFF' } : { borderColor: actionColor, color: actionColor } }
              className={`${isDelete ? 'px-4 py-1 rounded-[4px] border-0' : 'px-4 py-1 bg-white cursor-pointer border rounded-[4px]'}`}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisableUserModal;
