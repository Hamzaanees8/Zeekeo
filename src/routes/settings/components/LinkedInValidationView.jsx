import { useState } from "react";
import toast from "react-hot-toast";

const LinkedInValidationView = ({
  onCancel,
  onSubmit,
  validationType = "OTP",
}) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-6">
          {validationType === "OTP"
            ? "Enter OTP Code"
            : "Two-Factor Authentication"}
        </h2>

        <p className="text-[#7E7E7E] mb-6 text-[14px]">
          {validationType === "OTP"
            ? "An OTP code has been sent to the email or phone number registered with your LinkedIn account."
            : "A verification code has been sent to the email or phone number registered with your LinkedIn account."}
        </p>

        <p className="text-[#7E7E7E] mb-4 text-[14px]">
          Please enter the code below to continue:
        </p>

        {/* Code Input */}
        <div className="mb-6">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter verification code"
            className="w-full border border-[#7E7E7E] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#0387FF]"
            maxLength={6}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[6px] hover:bg-[#6D6D6D] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#0387FF] text-white cursor-pointer rounded-[6px] hover:bg-[#0370D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInValidationView;
