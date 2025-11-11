const LinkedInSuccessView = ({ onClose }) => {
  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <div className="flex flex-col items-center">
          {/* Green Checkmark */}
          <div className="mb-6 w-20 h-20 rounded-full bg-[#16A37B] flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-4 text-center">
            Account connected successfully!
          </h2>

          <p className="text-[#7E7E7E] mb-8 text-[14px] text-center">
            Your LinkedIn account has been connected and is ready to use.
          </p>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-8 py-2 bg-[#0387FF] text-white cursor-pointer rounded-[6px] hover:bg-[#0370D9] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInSuccessView;
