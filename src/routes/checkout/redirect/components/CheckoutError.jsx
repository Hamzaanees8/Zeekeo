import React from "react";

// Error icon component
const ErrorIcon = ({ className = "" }) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle
      cx="30"
      cy="30"
      r="25"
      stroke="#EF4444"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 20V35"
      stroke="#EF4444"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="30" cy="42" r="2" fill="#EF4444" />
  </svg>
);

// Warning icon component for requires_action
const WarningIcon = ({ className = "" }) => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M30 5L55 50H5L30 5Z"
      stroke="#F59E0B"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 20V35"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="30" cy="42" r="2" fill="#F59E0B" />
  </svg>
);

export default function CheckoutError({ error }) {
  const handleTryAgain = () => {
    window.location.href = "/checkout";
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:support@zeekoip.com";
  };

  const getErrorContent = () => {
    switch (error) {
      case "canceled":
        return {
          icon: <ErrorIcon />,
          title: "Payment Canceled",
          description:
            "Your payment was canceled. You can try again at any time.",
          showRetry: true,
        };
      case "requires_action":
        return {
          icon: <WarningIcon />,
          title: "Additional Authentication Required",
          description:
            "Your payment requires additional authentication. Please complete the verification process to continue.",
          showRetry: true,
        };
      case "requires_payment_method":
        return {
          icon: <ErrorIcon />,
          title: "Payment Failed",
          description:
            "There was an issue with your payment method. Please try with a different payment method.",
          showRetry: true,
        };
      case "requires_confirmation":
        return {
          icon: <ErrorIcon />,
          title: "Payment Confirmation Required",
          description: "Your payment requires confirmation. Please try again.",
          showRetry: true,
        };
      case "processing_error":
        return {
          icon: <ErrorIcon />,
          title: "Processing Error",
          description:
            "There was an error processing your payment. Please try again or contact support.",
          showRetry: true,
        };
      case "network_error":
        return {
          icon: <ErrorIcon />,
          title: "Connection Error",
          description:
            "Unable to verify payment status. Please check your connection and try again.",
          showRetry: true,
        };
      default:
        return {
          icon: <ErrorIcon />,
          title: "Payment Error",
          description:
            "There was an issue processing your payment. Please try again or contact support.",
          showRetry: true,
        };
    }
  };

  const { icon, title, description, showRetry } = getErrorContent();

  return (
    <div className="min-h-screen bg-[#1E1D1D] flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full p-12 rounded-lg">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">{icon}</div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-[#232E33] mb-6">{title}</h1>
          <p className="text-[#232E33] opacity-75 text-base leading-relaxed max-w-lg mx-auto">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          {showRetry && (
            <button
              onClick={handleTryAgain}
              className="px-6 py-3 bg-[#0387FF] text-white rounded-lg hover:bg-[#0277DD] transition-colors font-medium font-['Poppins']"
            >
              Try Again
            </button>
          )}
          <button
            onClick={handleContactSupport}
            className="px-6 py-3 border border-[#0387FF] text-[#0387FF] rounded-lg hover:bg-[#0387FF] hover:text-white transition-colors font-medium font-['Poppins']"
          >
            Contact Support
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-[#696B6B] text-sm font-['Poppins'] mb-2 font-semibold">
            Need help?
          </p>
          <p className="text-[#696B6B] text-sm font-['Poppins']">
            Please reach out to us:{" "}
            <a
              href="mailto:support@zeekoip.com"
              className="text-[#0387FF] hover:text-secondary transition-colors"
            >
              support@zeekoip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
