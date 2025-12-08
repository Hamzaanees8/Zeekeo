const DeleteConfirmDialog = ({ group, onClose, onConfirm, loading }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-[400px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer disabled:opacity-50"
        >
          &times;
        </button>

        <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
          Delete Group
        </h2>

        <p className="text-[#6D6D6D] text-sm mb-6">
          Are you sure you want to delete "{group.name}"?
          {group.members?.length > 0 && (
            <span>
              {" "}
              This will remove all {group.members.length} member
              {group.members.length !== 1 ? "s" : ""} from this group.
            </span>
          )}
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
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
