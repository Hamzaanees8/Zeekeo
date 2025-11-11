import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { allCountries, citiesByCountry } from "../../../utils/country-helper";
import LinkedInValidationView from "./LinkedInValidationView";
import LinkedInInAppValidationView from "./LinkedInInAppValidationView";
import LinkedInTimeoutView from "./LinkedInTimeoutView";
import LinkedInSuccessView from "./LinkedInSuccessView";
import LinkedInPhoneRegistrationView from "./LinkedInPhoneRegistrationView";
import { connectLinkedInAccount, GetUser, solveLinkedInCheckpoint } from "../../../services/settings";
import { updateUserStore } from "../../../services/users";

const LinkedInAuthView = ({ onCancel, onConnect }) => {
  const [currentView, setCurrentView] = useState("auth"); // auth, validation, in-app, phone-register, success, timeout
  const [checkpointType, setCheckpointType] = useState(null);
  const [accountId, setAccountId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    country: "",
    city: "",
  });

  // Timeout tracking
  const checkpointStartTime = useRef(null);
  const timeoutCheckInterval = useRef(null);
  const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  const availableCities = formData.country
    ? citiesByCountry[formData.country] || []
    : [];

  // Check for timeout when in validation, in-app, or phone-register view
  useEffect(() => {
    if (currentView === "validation" || currentView === "in-app" || currentView === "phone-register") {
      // Start checking for timeout
      timeoutCheckInterval.current = setInterval(() => {
        if (checkpointStartTime.current) {
          const elapsed = Date.now() - checkpointStartTime.current;
          if (elapsed >= TIMEOUT_DURATION) {
            clearInterval(timeoutCheckInterval.current);
            setCurrentView("timeout");
          }
        }
      }, 1000); // Check every second

      return () => {
        if (timeoutCheckInterval.current) {
          clearInterval(timeoutCheckInterval.current);
        }
      };
    }
  }, [currentView, TIMEOUT_DURATION]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "country" && { city: "" }), // Reset city when country changes
    }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.password) {
      toast.error("Please enter your password");
      return;
    }
    if (!formData.country) {
      toast.error("Please select a country");
      return;
    }
    if (!formData.city) {
      toast.error("Please select a region/city");
      return;
    }

    setIsLoading(true);

    try {
      // Extract city name without country prefix (e.g., "eg-alexandria" -> "alexandria")
      const cityName = formData.city.includes("-")
        ? formData.city.split("-")[1]
        : formData.city;

      const response = await connectLinkedInAccount({
        ...formData,
        city: cityName,
      });

      // Handle successful connection
      if (response.connected) {
        setAccountId(response.accountId);
        setCurrentView("success");
        return;
      }

      // Handle checkpoint/validation required
      if (response.checkpointType) {
        setAccountId(response.accountId);
        setCheckpointType(response.checkpointType);

        // Handle CAPTCHA - cannot be solved automatically
        if (response.checkpointType === "CAPTCHA") {
          toast.error("CAPTCHA solving failed. Please try again later or contact customer support.");
          setIsLoading(false);
          return;
        }

        // Start timeout timer
        checkpointStartTime.current = Date.now();

        // Show appropriate validation view based on checkpoint type
        if (response.checkpointType === "IN_APP_VALIDATION") {
          setCurrentView("in-app");
        } else if (response.checkpointType === "PHONE_REGISTER") {
          setCurrentView("phone-register");
        } else if (response.checkpointType === "OTP" || response.checkpointType === "2FA") {
          setCurrentView("validation");
        } else {
          // Default to validation view for unknown checkpoint types
          setCurrentView("validation");
        }
      }
    } catch (error) {
      console.error("Error connecting LinkedIn account:", error);

      // Check if it's an invalid credentials error
      const errorData = error.response?.data;
      if (errorData?.error === "invalid_credentials") {
        toast.error("Invalid credentials. Please check your email and password.");
      } else {
        toast.error("Failed to connect account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationSubmit = async (code) => {
    try {
      const response = await solveLinkedInCheckpoint({
        accountId: accountId,
        code: code,
      });

      // Handle successful connection
      if (response.connected) {
        // Clear timeout tracking
        checkpointStartTime.current = null;
        if (timeoutCheckInterval.current) {
          clearInterval(timeoutCheckInterval.current);
        }
        setCurrentView("success");
      }
    } catch (error) {
      console.error("Error solving checkpoint:", error);

      // Check for invalid checkpoint solution (401)
      const errorData = error.response?.data;
      if (error.response?.status === 401 || errorData?.error === "invalid_checkpoint_solution") {
        toast.error("Invalid verification code. Please try again.");
      } else {
        toast.error("Failed to verify code. Please try again.");
      }
    }
  };

  const handleValidationCancel = () => {
    // Clear timeout tracking
    checkpointStartTime.current = null;
    if (timeoutCheckInterval.current) {
      clearInterval(timeoutCheckInterval.current);
    }
    // Go back to the auth form
    setCurrentView("auth");
  };

  const handlePhoneSubmit = async (phoneNumber) => {
    try {
      const response = await solveLinkedInCheckpoint({
        accountId: accountId,
        phoneNumber: phoneNumber,
      });

      // After submitting phone, show 2FA code verification
      setCheckpointType("2FA");
      setCurrentView("validation");
      toast.success("Please check your phone for the verification code");
    } catch (error) {
      console.error("Error submitting phone number:", error);

      const errorData = error.response?.data;
      if (error.response?.status === 401 || errorData?.error === "invalid_checkpoint_solution") {
        toast.error("Invalid phone number. Please try again.");
      } else {
        toast.error("Failed to submit phone number. Please try again.");
      }
    }
  };

  const handleChangeMethod = async () => {
    try {
      const response = await solveLinkedInCheckpoint({
        accountId: accountId,
        changeMethod: true,
      });

      // Switch to 2FA validation view
      setCheckpointType("2FA");
      setCurrentView("validation");
      toast.success("Please enter the verification code sent to you");
    } catch (error) {
      console.error("Error changing verification method:", error);
      toast.error("Failed to change verification method. Please try again.");
    }
  };

  const handleSuccessClose = async () => {
    // Refresh user data to show updated connection status
    try {
      const updatedUser = await GetUser();
      if (updatedUser) {
        updateUserStore(updatedUser);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }

    // Close the auth view and return to integrations
    onCancel();
  };

  // Render different views based on currentView state
  if (currentView === "success") {
    return <LinkedInSuccessView onClose={handleSuccessClose} />;
  }

  if (currentView === "timeout") {
    return (
      <LinkedInTimeoutView
        onRetry={() => setCurrentView("auth")}
        onCancel={onCancel}
      />
    );
  }

  if (currentView === "in-app") {
    return (
      <LinkedInInAppValidationView
        accountId={accountId}
        onCancel={handleValidationCancel}
        onSuccess={() => {
          // Clear timeout tracking
          checkpointStartTime.current = null;
          if (timeoutCheckInterval.current) {
            clearInterval(timeoutCheckInterval.current);
          }
          setCurrentView("success");
        }}
        onChangeMethod={handleChangeMethod}
      />
    );
  }

  if (currentView === "phone-register") {
    return (
      <LinkedInPhoneRegistrationView
        onCancel={handleValidationCancel}
        onSubmit={handlePhoneSubmit}
      />
    );
  }

  if (currentView === "validation") {
    return (
      <LinkedInValidationView
        onCancel={handleValidationCancel}
        onSubmit={handleValidationSubmit}
        validationType={checkpointType}
      />
    );
  }

  // Default: show auth form

  return (
    <div className="flex justify-center items-start pt-12">
      <div className="bg-white border border-[#7E7E7E] rounded-[8px] p-8 max-w-[550px] w-full">
        <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist mb-6">
          Sign in to LinkedIn
        </h2>

        <p className="text-[#7E7E7E] mb-6 text-[14px]">
          Connect your LinkedIn account to start automating your outreach
        </p>

        {/* Email and Password Fields */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] font-urbanist mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInputChange("email", e.target.value)}
              placeholder="Enter your LinkedIn email"
              className="border border-[#7E7E7E] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#0387FF]"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] font-urbanist mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => handleInputChange("password", e.target.value)}
              placeholder="Enter your LinkedIn password"
              className="border border-[#7E7E7E] rounded-[6px] px-3 py-2 text-sm focus:outline-none focus:border-[#0387FF]"
            />
          </div>
        </div>

        {/* Proxy Selection */}
        <p className="text-[#7E7E7E] mb-3 text-[14px]">
          Select a proxy location to match or get as close as possible to your
          current location:
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] font-urbanist mb-1">
              Country *
            </label>
            <select
              value={formData.country}
              onChange={e => handleInputChange("country", e.target.value)}
              className="border border-[#7E7E7E] rounded-[6px] p-2 text-sm focus:outline-none focus:border-[#0387FF]"
            >
              <option value="">Select Country</option>
              {allCountries
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-[#7E7E7E] font-urbanist mb-1">
              Region/City *
            </label>
            <select
              value={formData.city}
              onChange={e => handleInputChange("city", e.target.value)}
              disabled={!formData.country}
              className="border border-[#7E7E7E] rounded-[6px] p-2 text-sm focus:outline-none focus:border-[#0387FF] disabled:bg-[#F5F5F5] disabled:cursor-not-allowed"
            >
              <option value="">Select City</option>
              {availableCities.map((city, idx) => (
                <option key={idx} value={city.key}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
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
            disabled={isLoading}
            className="px-6 py-2 bg-[#0387FF] text-white cursor-pointer rounded-[6px] hover:bg-[#0370D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAuthView;
