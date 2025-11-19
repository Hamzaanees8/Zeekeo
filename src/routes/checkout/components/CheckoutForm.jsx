import { useState } from "react";
import { Link } from "react-router";
import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import trustlogo from "../../../assets/trustpilot.png";
import capterralogo from "../../../assets/capterra.png";
import ratings from "../../../assets/ratings.png";
import SelectDropdown from "../../../components/Select";
import { allCountries } from "../../../utils/country-helper";

const COUNTRIES = allCountries.map(country => ({
  value: country.code,
  label: country.name,
}));

const COUPON_CODE_ERRORS = {
  max_redemptions_reached:
    "Coupon has reached the maximum number of redemptions",
  invalid_promotion_code: "Invalid coupon code",
  expired_promotion_code: "Coupon has expired",
  inactive_promotion_code: "Coupon is disabled",
};

export default function CheckoutForm({
  plans,
  planLookupKey,
  coupon,
  setCoupon,
  usersCount,
}) {
  const elements = useElements();
  const stripe = useStripe();

  // TODO: Empty the form data
  const [formData, setFormData] = useState({
    // firstName: "Ahmed",
    // lastName: "Hamdy",
    // email: "ahmed@example.com",
    // phoneNumber: "+1234567890",
    // password: "password",
    // confirmPassword: "password",
    // country: "us",
    // vatNumber: "1234567890",
    // company: "Company",
    // address: "123 Main St",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    country: "",
    vatNumber: "",
    company: "",
    address: "",
  });
  const [formDataErrors, setFormDataErrors] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [signingUp, setSigningUp] = useState(false);
  const [signingUpMessage, setSigningUpMessage] = useState("");
  const [signingUpError, setSigningUpError] = useState(null);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponError("Coupon code is required");
      return;
    }

    setCouponError();
    setValidatingCoupon(true);
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/billing/coupons?promotionCode=${couponCode}`,
    );

    const data = await response.json();

    if (response.ok) {
      setCoupon(data);
      setCouponError();
    } else {
      setCouponError(COUPON_CODE_ERRORS[data.error]);
    }

    setValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponError();
  };

  const handlePaymentFieldsChange = () => {
    setSigningUpError(null);
  };

  const validateForm = async () => {
    // Validate form
    const formDataErrors = {};

    if (!formData.firstName) {
      formDataErrors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      formDataErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      formDataErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        formDataErrors.email = "Invalid email address";
      }
    }

    if (!formData.phoneNumber) {
      formDataErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        formDataErrors.phoneNumber = "Invalid phone number";
      }
    }

    if (!formData.password) {
      formDataErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      formDataErrors.password = "Password must be at least 8 characters long";
    }

    if (!formData.confirmPassword) {
      formDataErrors.confirmPassword = "Confirm password is required";
    } else if (formData.confirmPassword.length < 8) {
      formDataErrors.confirmPassword =
        "Password must be at least 8 characters long";
    }

    if (
      !formDataErrors.password &&
      !formDataErrors.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      formDataErrors.password = "Passwords do not match";
      formDataErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.country) {
      formDataErrors.country = "Country is required";
    }

    if (!formData.vatNumber) {
      formDataErrors.vatNumber = "VAT number is required";
    }

    if (!formData.company) {
      formDataErrors.company = "Company is required";
    }

    if (!formData.address) {
      formDataErrors.address = "Address is required";
    }

    // Set form data errors
    setFormDataErrors(formDataErrors);

    // Validate payment element
    const { error: paymentElementError } = await elements.submit();

    // If there are any errors, return false
    if (Object.keys(formDataErrors).length > 0 || paymentElementError) {
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!(await validateForm())) return;

    setSigningUp(true);
    setSigningUpMessage("Creating your account...");
    setSigningUpError(null);

    try {
      const plan = plans.find(p =>
        p.prices.some(price => price.lookupKey === planLookupKey),
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/billing/checkout`,
        {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            plan: planLookupKey,
            count: plan.type === "agency" ? usersCount : 1,
            promoCode: coupon ? couponCode : null,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSigningUpMessage("Setting up your subscription...");
        let confirmIntent;
        if (data.type === "setup") confirmIntent = stripe.confirmSetup;
        else confirmIntent = stripe.confirmPayment;

        const { error } = await confirmIntent({
          elements,
          clientSecret: data.clientSecret,
          confirmParams: {
            return_url: `${import.meta.env.VITE_APP_URL}/checkout/redirect`,
            payment_method_data: {
              billing_details: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phoneNumber,
                address: {
                  country: formData.country,
                  state: "",
                  city: "",
                  line1: formData.address,
                  line2: "",
                  postal_code: "",
                },
              },
            },
          },
        });

        if (error) {
          setSigningUp(false);
          setSigningUpMessage("");

          if (error.type === "invalid_request_error") {
            setSigningUpError(
              "Failed to authenticate payment method, please try again.",
            );
          } else {
            setSigningUpError(error.message);
          }

          console.log("error", error);
        }
      } else {
        setSigningUp(false);
        setSigningUpMessage("");
        setSigningUpError(data.message ? data.message : data.error);
        console.log("error", data);
      }
    } catch (error) {
      setSigningUp(false);
      setSigningUpMessage("");
      setSigningUpError(error.message);
      console.error("Error during signup:", error);
    }
  };

  const validateField = (name, value, formData) => {
    switch (name) {
      case "firstName":
        if (!value) return "First name is required";
        break;
      case "lastName":
        if (!value) return "Last name is required";
        break;
      case "email":
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Invalid email address";
        break;
      case "phoneNumber":
        if (!value) return "Phone number is required";
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(value)) return "Invalid phone number";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          return "Passwords do not match";
        }
        break;
      case "confirmPassword":
        if (!value) return "Confirm password is required";
        if (value.length < 8)
          return "Password must be at least 8 characters long";
        if (formData.password && value !== formData.password) {
          return "Passwords do not match";
        }
        break;
      case "country":
        if (!value) return "Country is required";
        break;
      case "vatNumber":
        if (!value) return "VAT number is required";
        break;
      case "company":
        if (!value) return "Company is required";
        break;
      case "address":
        if (!value) return "Address is required";
        break;
      default:
        return "";
    }
    return "";
  };

  return (
    <form>
      <div className="flex flex-col py-[20px] px-[15px] gap-y-[10px] sm:gap-y-[20px] sm:py-[40px] sm:px-[25px] md:gap-y-[25px] md:py-[86px] md:px-[76px] lg:px-[50px]">
        <h1 className="text-left font-medium text-[32px] text-[#454545]">
          Sign Up
        </h1>
        <div className="flex flex-col items-start gap-y-3 w-full">
          <p className="text-[#1E1D1D] text-[14px] font-semibold">
            Create New Account
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="flex flex-col gap-y-1">
              <input
                name="firstName"
                type="text"
                placeholder="First Name*"
                className={`w-full h-[40px] px-3 py-[9.5px] border border-gray-300 text-[14px] rounded-[6px] font-normal ${
                  formDataErrors.firstName ? "border-red-500" : ""
                }`}
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "firstName",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, firstName: error }));
                }}
              />
              {formDataErrors.firstName && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.firstName}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <input
                name="lastName"
                type="text"
                placeholder="Last Name*"
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  formDataErrors.lastName ? "border-red-500" : ""
                }`}
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "lastName",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, lastName: error }));
                }}
              />
              {formDataErrors.lastName && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.lastName}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <input
                name="email"
                type="email"
                placeholder="Email*"
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  formDataErrors.email ? "border-red-500" : ""
                }`}
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "email",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, email: error }));
                }}
              />
              {formDataErrors.email && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.email}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <input
                name="phoneNumber"
                type="tel"
                placeholder="Phone Number*"
                autoComplete="tel"
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  formDataErrors.phoneNumber ? "border-red-500" : ""
                }`}
                value={formData.phoneNumber}
                onChange={e =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "phoneNumber",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, phoneNumber: error }));
                }}
              />
              {formDataErrors.phoneNumber && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.phoneNumber}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <input
                name="password"
                type="password"
                placeholder="Password*"
                autoComplete="new-password"
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  formDataErrors.password ? "border-red-500" : ""
                }`}
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "password",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, password: error }));
                }}
              />
              {formDataErrors.password && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.password}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password*"
                autoComplete="new-password"
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  formDataErrors.confirmPassword ? "border-red-500" : ""
                }`}
                value={formData.confirmPassword}
                onChange={e =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                onBlur={e => {
                  const error = validateField(
                    "confirmPassword",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({
                    ...prev,
                    confirmPassword: error,
                  }));
                }}
              />
              {formDataErrors.confirmPassword && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-y-3 w-full">
          <p className="text-[#1E1D1D] text-[14px] font-semibold">
            Billing Details
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="flex flex-col gap-y-1">
              <SelectDropdown
                id="country"
                name="country"
                value={formData.country}
                onChange={e => {
                  setFormData({ ...formData, country: e.target.value });
                  const error = validateField(
                    "country",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, country: error }));
                }}
                options={COUNTRIES}
                placeholder="Country*"
                className={`placeholder:text-[#7E7E7E] text-[14px] rounded-[6px] font-normal border border-gray-300 h-[40px] px-2 py-[9.5px] ${
                  formDataErrors.country ? "border-red-500" : ""
                }`}
              />
              {formDataErrors.country && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.country}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-y-1">
              <div className="relative w-full">
                <input
                  name="vatNumber"
                  type="text"
                  placeholder="VAT*"
                  value={formData.vatNumber}
                  onChange={e =>
                    setFormData({ ...formData, vatNumber: e.target.value })
                  }
                  className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal pr-10 ${
                    formDataErrors.vatNumber ? "border-red-500" : ""
                  }`}
                  onBlur={e => {
                    const error = validateField(
                      "vatNumber",
                      e.target.value,
                      formData,
                    );
                    setFormDataErrors(prev => ({ ...prev, vatNumber: error }));
                  }}
                />
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <div className="relative inline-block">
                    <svg
                      className="text-gray-500 cursor-pointer peer"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.99999 2.49984C5.39159 2.50061 4.80834 2.74263 4.37815 3.17283C3.94795 3.60303 3.70592 4.18628 3.70515 4.79467H4.87182C4.87182 4.17225 5.37815 3.6665 5.99999 3.6665C6.62182 3.6665 7.12815 4.17225 7.12815 4.79467C7.12815 5.1435 6.84757 5.39667 6.41882 5.74317C6.27875 5.85289 6.14423 5.96951 6.01574 6.09259C5.43357 6.67417 5.41665 7.29192 5.41665 7.36075V7.74984H6.58332L6.58273 7.38059C6.58332 7.37125 6.60198 7.15542 6.83998 6.918C6.92748 6.8305 7.03773 6.743 7.15207 6.65084C7.60649 6.28275 8.29423 5.72684 8.29423 4.79467C8.29377 4.18629 8.05193 3.60294 7.62179 3.1727C7.19165 2.74245 6.60837 2.50046 5.99999 2.49984ZM5.41665 8.33317H6.58332V9.49984H5.41665V8.33317Z"
                        fill="black"
                      />
                      <path
                        d="M6 0.166504C2.7835 0.166504 0.166664 2.78334 0.166664 5.99984C0.166664 9.21634 2.7835 11.8332 6 11.8332C9.2165 11.8332 11.8333 9.21634 11.8333 5.99984C11.8333 2.78334 9.2165 0.166504 6 0.166504ZM6 10.6665C3.42691 10.6665 1.33333 8.57292 1.33333 5.99984C1.33333 3.42675 3.42691 1.33317 6 1.33317C8.57308 1.33317 10.6667 3.42675 10.6667 5.99984C10.6667 8.57292 8.57308 10.6665 6 10.6665Z"
                        fill="black"
                      />
                    </svg>
                    <div className="absolute bottom-full right-0 mb-1 w-56 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 peer-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-normal pointer-events-none">
                      Enter your official VAT number issued by your local tax
                      authority.
                    </div>
                  </div>
                </div>
              </div>
              {formDataErrors.vatNumber && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.vatNumber}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-y-1">
              <input
                name="company"
                type="text"
                placeholder="Company*"
                value={formData.company}
                onChange={e =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal md:col-span-2 ${
                  formDataErrors.company ? "border-red-500" : ""
                }`}
                onBlur={e => {
                  const error = validateField(
                    "company",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, company: error }));
                }}
              />
              {formDataErrors.company && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.company}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-y-1">
              <input
                name="address"
                type="text"
                placeholder="Address*"
                value={formData.address}
                onChange={e =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className={`w-full h-[40px] px-3 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal md:col-span-2 ${
                  formDataErrors.address ? "border-red-500" : ""
                }`}
                onBlur={e => {
                  const error = validateField(
                    "address",
                    e.target.value,
                    formData,
                  );
                  setFormDataErrors(prev => ({ ...prev, address: error }));
                }}
              />
              {formDataErrors.address && (
                <div className="text-[#FF0000] text-[14px] font-normal">
                  {formDataErrors.address}
                </div>
              )}
            </div>
          </div>
        </div>
        <PaymentElement
          options={{
            fields: { billingDetails: "never" },
          }}
          onChange={handlePaymentFieldsChange}
        />
        <div className="flex flex-col items-start gap-y-3 w-full">
          <div className="relative w-full md:col-span-4">
            <div className="absolute top-2.5 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.76637 0.996853C8.04775 0.682597 8.39224 0.431212 8.77735 0.259107C9.16247 0.0870025 9.57955 -0.00195312 10.0014 -0.00195312C10.4232 -0.00195312 10.8403 0.0870025 11.2254 0.259107C11.6105 0.431212 11.955 0.682597 12.2364 0.996853L12.9364 1.77885C13.0364 1.89076 13.1603 1.97871 13.299 2.03618C13.4377 2.09366 13.5875 2.11918 13.7374 2.11085L14.7874 2.05285C15.2084 2.02973 15.6296 2.09563 16.0235 2.24625C16.4173 2.39688 16.775 2.62884 17.0732 2.92702C17.3714 3.22519 17.6033 3.58288 17.754 3.97675C17.9046 4.37061 17.9705 4.7918 17.9474 5.21285L17.8894 6.26285C17.8812 6.41256 17.9068 6.56219 17.9643 6.70066C18.0217 6.83914 18.1096 6.96292 18.2214 7.06285L19.0044 7.76285C19.3188 8.04424 19.5703 8.38879 19.7425 8.774C19.9147 9.1592 20.0037 9.57641 20.0037 9.99835C20.0037 10.4203 19.9147 10.8375 19.7425 11.2227C19.5703 11.6079 19.3188 11.9525 19.0044 12.2339L18.2214 12.9339C18.1095 13.0339 18.0215 13.1578 17.964 13.2965C17.9066 13.4352 17.881 13.585 17.8894 13.7349L17.9474 14.7849C17.9705 15.2059 17.9046 15.6271 17.754 16.021C17.6033 16.4148 17.3714 16.7725 17.0732 17.0707C16.775 17.3689 16.4173 17.6008 16.0235 17.7515C15.6296 17.9021 15.2084 17.968 14.7874 17.9449L13.7374 17.8869C13.5877 17.8787 13.438 17.9043 13.2996 17.9617C13.1611 18.0192 13.0373 18.1071 12.9374 18.2189L12.2374 19.0019C11.956 19.3163 11.6114 19.5678 11.2262 19.74C10.841 19.9122 10.4238 20.0012 10.0019 20.0012C9.57992 20.0012 9.16272 19.9122 8.77751 19.74C8.3923 19.5678 8.04775 19.3163 7.76637 19.0019L7.06636 18.2189C6.96633 18.1069 6.84238 18.019 6.70372 17.9615C6.56506 17.9041 6.41524 17.8785 6.26537 17.8869L5.21537 17.9449C4.79432 17.968 4.37312 17.9021 3.97926 17.7515C3.58539 17.6008 3.22771 17.3689 2.92953 17.0707C2.63136 16.7725 2.39939 16.4148 2.24876 16.021C2.09814 15.6271 2.03224 15.2059 2.05537 14.7849L2.11337 13.7349C2.12154 13.5851 2.09594 13.4355 2.03847 13.297C1.98101 13.1586 1.89314 13.0348 1.78137 12.9349L0.999365 12.2349C0.684944 11.9535 0.433418 11.6089 0.261213 11.2237C0.0890088 10.8385 0 10.4213 0 9.99935C0 9.57741 0.0890088 9.16021 0.261213 8.775C0.433418 8.38979 0.684944 8.04524 0.999365 7.76385L1.78137 7.06385C1.89327 6.96382 1.98122 6.83987 2.0387 6.70121C2.09617 6.56255 2.12169 6.41272 2.11337 6.26285L2.05537 5.21285C2.03224 4.7918 2.09814 4.37061 2.24876 3.97675C2.39939 3.58288 2.63136 3.22519 2.92953 2.92702C3.22771 2.62884 3.58539 2.39688 3.97926 2.24625C4.37312 2.09563 4.79432 2.02973 5.21537 2.05285L6.26537 2.11085C6.41507 2.11903 6.5647 2.09343 6.70318 2.03596C6.84165 1.97849 6.96544 1.89062 7.06537 1.77885L7.76637 0.996853ZM13.7084 6.29185C13.8958 6.47938 14.0012 6.73369 14.0012 6.99885C14.0012 7.26402 13.8958 7.51833 13.7084 7.70585L7.70836 13.7059C7.51976 13.888 7.26716 13.9888 7.00496 13.9865C6.74277 13.9842 6.49195 13.8791 6.30655 13.6937C6.12114 13.5083 6.01597 13.2575 6.01369 12.9953C6.01141 12.7331 6.11221 12.4805 6.29437 12.2919L12.2944 6.29185C12.4819 6.10438 12.7362 5.99907 13.0014 5.99907C13.2665 5.99907 13.5208 6.10438 13.7084 6.29185ZM7.50137 5.99885C7.10354 5.99885 6.72201 6.15689 6.4407 6.43819C6.1594 6.7195 6.00137 7.10103 6.00137 7.49885V7.50885C6.00137 7.90668 6.1594 8.28821 6.4407 8.56951C6.72201 8.85082 7.10354 9.00885 7.50137 9.00885H7.51137C7.90919 9.00885 8.29072 8.85082 8.57203 8.56951C8.85333 8.28821 9.01137 7.90668 9.01137 7.50885V7.49885C9.01137 7.10103 8.85333 6.7195 8.57203 6.43819C8.29072 6.15689 7.90919 5.99885 7.51137 5.99885H7.50137ZM12.5014 10.9989C12.1035 10.9989 11.722 11.1569 11.4407 11.4382C11.1594 11.7195 11.0014 12.101 11.0014 12.4989V12.5089C11.0014 12.9067 11.1594 13.2882 11.4407 13.5695C11.722 13.8508 12.1035 14.0089 12.5014 14.0089H12.5114C12.9092 14.0089 13.2907 13.8508 13.572 13.5695C13.8533 13.2882 14.0114 12.9067 14.0114 12.5089V12.4989C14.0114 12.101 13.8533 11.7195 13.572 11.4382C13.2907 11.1569 12.9092 10.9989 12.5114 10.9989H12.5014Z"
                  fill="#0387FF"
                />
              </svg>
            </div>
            <div className="flex">
              <input
                name="CouponCode"
                type="text"
                placeholder="Coupon Code"
                className={`w-full h-[40px] pr-[100px] px-9 py-[9.5px] rounded-[6px] border border-gray-300 text-[14px] font-normal ${
                  couponError ? "text-[#FF0000]" : ""
                } ${coupon ? "text-[#25AE9D]" : ""}`}
                disabled={coupon || validatingCoupon}
                value={couponCode}
                onChange={e => setCouponCode(e.target.value)}
              />
              {!coupon ? (
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="ml-2 px-2 sm:px-4 py-1 rounded-[6px] bg-[#0387FF] hover:bg-[#0374db] text-white text-xs sm:text-[14px] h-[40px] min-w-[120px] sm:w-[200px] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                  disabled={validatingCoupon || coupon}
                >
                  {validatingCoupon ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    "Apply Coupon"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="ml-2 px-2 sm:px-4 py-1 bg-[#dd0000] hover:bg-[#c00000] text-white text-xs sm:text-[14px] rounded-[3px] h-[40px] min-w-[120px] sm:w-[200px] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Remove Coupon
                </button>
              )}
            </div>
            <div className="flex items-center justify-start gap-1">
              {coupon && (
                <>
                  <div className="ml-2 mt-1 flex items-center text-[#25AE9D] text-[14px] font-normal whitespace-nowrap">
                    Coupon Applied Successfully - {coupon.name}
                  </div>
                </>
              )}
              {couponError && (
                <div className="ml-2 mt-1 flex items-center text-[#FF0000] text-[14px] font-normal whitespace-nowrap">
                  {couponError}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-start gap-1 sm:pt-1">
            <p className="text-[11px] font-normal sm:text-[14px] text-[#696B6B]">
              By clicking on sign up you agree to our
            </p>
            <p className="text-[#0387FF] text-[11px] font-normal sm:text-[14px] cursor-pointer">
              Terms & Conditions
            </p>
          </div>
        </div>
        {signingUpError && (
          <div className="text-[#FF0000] text-[14px] font-normal w-full text-center">
            {signingUpError}
          </div>
        )}
        <button
          type="button"
          className="bg-stone-900 hover:bg-black text-[16px] rounded-[6px] font-semibold text-white cursor-pointer h-[40px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={handleSignUp}
          disabled={signingUp}
        >
          {signingUp && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          )}
          {signingUp ? signingUpMessage : "Sign Up"}
        </button>
        <div className="flex items-center justify-start gap-1">
          <p className="font-normal text-[14px] text-[#696B6B]">
            Already have an account?
          </p>
          <Link to="/login" className="text-[#0387FF] font-normal text-[14px]">
            Login
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-x-1">
            <p className="text-[14px] font-semibold text-[#1E1D1D]">
              Trusted by 42,070+ users
            </p>
            <p className="hidden sm:block text-[14px] font-normal text-[#1E1D1D]">
              from 87 countries around the globe
            </p>
          </div>
          <div className="flex flex-col gap-x-[1px]">
            <img src={trustlogo} alt="trust logo" />
            <img src={ratings} alt="ratings" />
          </div>
          <div className="flex flex-col gap-x-[1px]">
            <img src={capterralogo} alt="capterra logo" />
            <img src={ratings} alt="ratings" />
          </div>
        </div>
      </div>
    </form>
  );
}
