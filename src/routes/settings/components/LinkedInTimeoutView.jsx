const LinkedInTimeoutView = ({ onRetry, onCancel }) => {
  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <div className="flex flex-col items-center">
          {/* Red/Orange Warning Icon */}
          <div className="mb-6 w-20 h-20 rounded-full bg-[#D62828] flex items-center justify-center">
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
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Timeout Message */}
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-4 text-center">
            Validation Timeout
          </h2>

          <p className="text-[#7E7E7E] mb-8 text-[14px] text-center">
            The validation process has timed out. Please try again to connect
            your LinkedIn account.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[6px] hover:bg-[#6D6D6D] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-[#0387FF] text-white cursor-pointer rounded-[6px] hover:bg-[#0370D9] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInTimeoutView;
