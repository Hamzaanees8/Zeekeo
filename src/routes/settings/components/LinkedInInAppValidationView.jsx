import { useEffect, useRef } from "react";
import { checkLinkedInAccountStatus } from "../../../services/settings";

const LinkedInInAppValidationView = ({ accountId, onCancel, onSuccess, onChangeMethod }) => {
  const pollingInterval = useRef(null);

  useEffect(() => {
    // Start polling for account status
    const pollStatus = async () => {
      try {
        const response = await checkLinkedInAccountStatus(accountId);

        if (response.connected) {
          // Account successfully connected
          clearInterval(pollingInterval.current);
          onSuccess();
        }
      } catch (error) {
        console.error("Error checking account status:", error);
      }
    };

    // Poll immediately on mount
    pollStatus();

    // Then poll every 5 seconds
    pollingInterval.current = setInterval(pollStatus, 5000);

    // Cleanup on unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [accountId, onSuccess]);

  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-6">
          In-App Verification
        </h2>

        <p className="text-[#7E7E7E] mb-6 text-[14px]">
          Please check your LinkedIn mobile app for a validation notification
          for the login attempt.
        </p>

        <p className="text-[#7E7E7E] mb-6 text-[14px]">
          Once you approve the notification on your mobile device, we'll
          continue with the connection process.
        </p>

        {/* Loading Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0387FF]"></div>
        </div>

        <p className="text-center text-[#7E7E7E] mb-6 text-[12px] italic">
          Waiting for confirmation...
        </p>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[6px] hover:bg-[#6D6D6D] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onChangeMethod}
            className="px-6 py-2 border border-[#0387FF] text-[#0387FF] cursor-pointer rounded-[6px] hover:bg-[#0387FF] hover:text-white transition-colors"
          >
            Try Another Method
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInInAppValidationView;
