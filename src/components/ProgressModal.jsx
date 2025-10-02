const ProgressModal = ({ onClose, title, action, progress }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
        <div className="flex justify-between items-start">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            {title}
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden my-[30px]">
          <div
            className="bg-[#04479C] h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-sm text-[#04479C] font-medium">
          {progress === 0 ? "Initializing..." : `${progress}%`}
        </p>
        <div className="flex justify-end gap-4 font-medium text-base font-urbanist">
          <button
            onClick={onClose}
            className="px-4 py-1 text-[#7E7E7E] bg-white cursor-pointer border border-[#7E7E7E] rounded-[4px]"
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProgressModal;
