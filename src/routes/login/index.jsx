import "./index.css";
import logo from "../../assets/logo.png";
import google from "../../assets/googlelogo.png";
import { Link } from "react-router";
import { useState } from "react";
import { useNavigate } from "react-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { toast } from "react-hot-toast";
import { api } from "../../services/api";
import { Helmet } from "react-helmet";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const handleLogin = async () => {

    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    if (!password.trim()) {
      setErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);

    try {
      const { sessionToken, refreshToken } = await api.post("/auth/login", {
        username: email,
        password,
      });

      localStorage.setItem("sessionToken", sessionToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Fetch user details
      const userInfo = await api.get("/users");
      const user = userInfo.user;

      localStorage.setItem("userInfo", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Login</title>
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
              Log In
            </p>
          </div>

          <div className="flex flex-col gap-y-6 w-full">
            {/* Email Field */}
            <div className="flex flex-col w-full">
              <Input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full h-[45px] px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative w-full flex flex-col">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full h-[45px] px-4 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"
                  }`}
              />
              <span>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </span>
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

              <div className="mt-2 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[#6D6D6D] text-sm hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Login Buttons */}
            <div className="flex flex-col gap-y-4 w-full">
              <Button
                onClick={handleLogin}
                type="button"
                disabled={loading}
                className="w-full bg-[#0387FF] cursor-pointer text-white py-3 hover:bg-blue-700 transition font-medium text-sm"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>

              <Button className="w-full border border-[#6D6D6D] bg-white cursor-pointer text-[#6D6D6D] flex py-3 items-center justify-center gap-3 hover:bg-gray-100 transition font-medium text-sm">
                <img src={google} className="w-5 h-5" alt="Google logo" />
                <span className="text-[#6D6D6D] font-medium text-sm">
                  Log In with Google
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
