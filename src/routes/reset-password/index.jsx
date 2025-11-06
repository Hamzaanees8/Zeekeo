import "./index.css";
import logo from "../../assets/logo.png";
import { useMemo, useState } from "react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { api } from "../../services/api";
import { Helmet } from "react-helmet";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  // const email = searchParams.get("email");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    password: false,
    confirmPassword: false,
  });

  const checkStrength = pass => {
    const requirements = [/.{8,}/, /[0-9]/, /[a-z]/, /[A-Z]/, /[^A-Za-z0-9]/];
    return requirements.filter(regex => regex.test(pass)).length;
  };

  const strengthScore = useMemo(() => checkStrength(password), [password]);

  const getSegmentColor = (index, score) => {
    if (score === 0) return "bg-gray-200";
    if (score <= 2) return index === 0 ? "bg-red-500" : "bg-gray-200";
    if (score <= 4) return index < 2 ? "bg-amber-500" : "bg-gray-200";
    return "bg-emerald-500";
  };

  const handleReset = async () => {
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    const newErrors = {};

    if (!trimmedPassword) newErrors.password = "Password is required";
    else if (trimmedPassword.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!trimmedConfirm)
      newErrors.confirmPassword = "Confirm password is required";
    else if (trimmedConfirm !== trimmedPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!token) {
      toast.error("Invalid or expired link. Please try again.");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.post("/auth/reset", {
        method: "reset-password",
        token,
        password: trimmedPassword,
      });

      toast.success("Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Failed to reset password.";
      toast.error(msg);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Reset Password</title>
      </Helmet>
      <div className="bg-black w-full min-h-screen flex justify-center items-center px-4">
        <div className="w-full max-w-[530px] sm:max-w-lg md:max-w-xl bg-white p-6 sm:p-10 flex flex-col gap-y-8 items-center rounded-md">
          <div className="flex flex-col gap-y-6 items-center">
            <img
              src={logo}
              alt="Logo"
              className="w-[180px] sm:w-[220px] h-auto"
            />
            <p className="text-2xl sm:text-[32px] font-medium text-[#454545]">
              Reset Password
            </p>
          </div>

          <div className="flex flex-col gap-y-6 w-full">
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter New Password"
                className={`w-full h-[45px] rounded-[6px] px-4 py-2 border border-gray-300 ${errors.password ? "border-red-500" : "border-[#BBBBBB]"
                  }`}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password && e.target.value.trim() !== "") {
                    setErrors(prev => ({ ...prev, password: false }));
                  }
                }}
                aria-label="Password"
                aria-invalid={strengthScore < 5}
                aria-describedby="password-strength"
                required
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.password}
                </span>
              )}
              <span
                className="absolute right-3 top-2.5 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* Eye Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.00004 13.25C8.70954 13.25 9.35754 13.1727 9.94854 13.0392L8.63079 11.7215C8.42604 11.7372 8.21829 11.75 8.00004 11.75C3.9868 11.75 2.43204 8.86548 2.05554 7.99998C2.33825 7.36908 2.72008 6.78748 3.18654 6.27723L2.13804 5.22873C0.984545 6.47898 0.547295 7.73823 0.539045 7.76298C0.48731 7.917 0.48731 8.0837 0.539045 8.23773C0.554795 8.28723 2.2753 13.25 8.00004 13.25ZM8.00004 2.74998C6.62229 2.74998 5.49054 3.04698 4.54704 3.48573L1.7803 0.719727L0.719795 1.78023L14.2198 15.2802L15.2803 14.2197L12.791 11.7305C14.7515 10.2672 15.4513 8.26923 15.4618 8.23773C15.5135 8.0837 15.5135 7.917 15.4618 7.76298C15.4453 7.71273 13.7248 2.74998 8.00004 2.74998ZM11.729 10.6685L10.019 8.95848C10.1615 8.66598 10.25 8.34423 10.25 7.99998C10.25 6.76923 9.23079 5.74998 8.00004 5.74998C7.65579 5.74998 7.33404 5.83848 7.04229 5.98173L5.6863 4.62573C6.43068 4.37029 7.21308 4.24323 8.00004 4.24998C12.0133 4.24998 13.568 7.13448 13.9445 7.99998C13.718 8.51898 13.07 9.75648 11.729 10.6685Z"
                    fill="#7E7E7E"
                  />
                </svg>
              </span>
            </div>
            <div className="relative w-full mt-0">
              <Input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                className={`w-full h-[45px] rounded-[6px] px-4 py-2 border ${errors.confirmPassword
                  ? "border-red-500"
                  : "border-[#BBBBBB]"
                  }`}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword && e.target.value === password) {
                    setErrors(prev => ({ ...prev, confirmPassword: false }));
                  }
                }}
                value={confirmPassword}
                required
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {" "}
                  {errors.confirmPassword}
                </span>
              )}
            </div>
            <div
              className="flex h-1.5 w-full rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={strengthScore}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-label="Password strength"
            >
              {[0, 1, 2].map(index => (
                <div
                  key={index}
                  className={`flex-1 transition-all duration-500 ease-out ${index !== 2 ? "mr-1" : ""
                    } ${getSegmentColor(index, strengthScore)}`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-y-4 w-full">
              <Button
                onClick={handleReset}
                className="w-full bg-[#0387FF] rounded-[6px] cursor-pointer text-white py-3 hover:bg-blue-700 transition font-medium text-sm"
              >
                Reset Password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
