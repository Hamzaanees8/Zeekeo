import { useState } from "react";
import toast from "react-hot-toast";

const LinkedInPhoneRegistrationView = ({ onCancel, onSubmit }) => {
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    // Format phone number: (+XX)XXXXXXXXX
    const formattedPhone = `(${countryCode})${phoneNumber.replace(/\s+/g, "")}`;

    setIsSubmitting(true);
    try {
      await onSubmit(formattedPhone);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-6">
          Phone Number Verification
        </h2>

        <p className="text-[#7E7E7E] mb-6 text-[14px]">
          LinkedIn requires a phone number to verify your account. Please enter
          your phone number below.
        </p>

        <p className="text-[#7E7E7E] mb-4 text-[14px]">
          You will receive a verification code via SMS.
        </p>

        {/* Phone Number Input */}
        <div className="mb-6">
          <label className="text-sm text-[#7E7E7E] font-urbanist mb-1 block">
            Phone Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={countryCode}
              onChange={e => setCountryCode(e.target.value)}
              placeholder="+1"
              className="w-20 border border-[#7E7E7E] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#0387FF]"
            />
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="1234567890"
              className="flex-1 border border-[#7E7E7E] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#0387FF]"
            />
          </div>
          <p className="text-[#7E7E7E] text-[12px] mt-1 italic">
            Format: Country code (+33) and phone number (0612345678)
          </p>
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
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPhoneRegistrationView;
