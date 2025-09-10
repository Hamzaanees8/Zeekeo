import "./index.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { api } from "../../services/api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Helmet } from "react-helmet";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendResetLink = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset", {
        method: "send-token",
        email,
      });

      // Reset form field
      setEmail("");

      toast.success("Reset link sent to your email");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send reset link";
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Forgot Password</title>
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
              Forgot Password
            </p>
          </div>

          <div className="flex flex-col gap-y-6 w-full">
            <div className="flex flex-col w-full">
              <Input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full rounded-[6px] h-[45px] px-4 py-2 border ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex flex-col gap-y-4 w-full">
              <Button
                className="w-full bg-[#0387FF] rounded-[6px] cursor-pointer text-white py-3 hover:bg-blue-700 transition font-medium text-sm"
                onClick={handleSendResetLink}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Password Link"}
              </Button>
            </div>
            <div className="flex self-center">
              <Link
                to="/login"
                className="text-[#6D6D6D] text-sm hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
