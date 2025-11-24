import { useState } from "react";
import { ValidatePromotionCode } from "../../../services/billings";
import toast from "react-hot-toast";
import { TagIcon } from "../../../components/Icons";

const ApplyCoupon = ({ activeCoupons = [] }) => {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    try {
      const response = await ValidatePromotionCode(couponCode);

      if (response && response.valid) {
        toast.success("Coupon applied successfully!");
        setCouponCode("");
        // TODO: Refresh subscription data to show new discount
      } else {
        toast.error("Invalid or expired coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleApplyCoupon();
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#6D6D6D] p-3.5 rounded-[8px] shadow-md flex flex-col gap-y-[16px] h-full">
      <p className="text-[20px] font-semibold font-urbanist leading-[20px] text-[#6D6D6D]">
        Apply Coupon
      </p>

      <div className="flex flex-col gap-y-3">
        <div className="flex flex-col gap-y-2">
          <label className="text-[14px] font-medium text-[#6D6D6D]">
            Promotion Code:
          </label>
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter code here"
            disabled={isValidating}
            className="border border-[#6D6D6D] rounded-[6px] px-3 py-2 text-[14px] text-[#6D6D6D] focus:outline-none focus:border-[#0387FF] disabled:bg-gray-100"
          />
        </div>

        <button
          onClick={handleApplyCoupon}
          disabled={isValidating || !couponCode.trim()}
          className={`w-full border rounded-[6px] px-4 py-2 text-[14px] font-medium font-urbanist transition-colors ${
            isValidating || !couponCode.trim()
              ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#0387FF] border-[#0387FF] text-white hover:bg-[#0270D9] cursor-pointer"
          }`}
        >
          {isValidating ? "Validating..." : "Apply"}
        </button>

        {activeCoupons && activeCoupons.length > 0 && (
          <div className="flex flex-col gap-y-2 pt-2 border-t border-[#E0E0E0]">
            <p className="text-[14px] font-semibold text-[#6D6D6D]">
              Active Coupons:
            </p>
            {activeCoupons.map((discount, index) => (
              <div
                key={index}
                className="flex items-start gap-x-2 text-[13px]"
              >
                <TagIcon className="w-4 h-4 text-[#16A37B] mt-0.5" />
                <div className="flex flex-col gap-y-0.5">
                  <span className="font-semibold text-[#16A37B]">
                    {discount.coupon?.name || discount.promotion_code || "Active Discount"}
                  </span>
                  <span className="text-[#6D6D6D] text-[12px]">
                    {discount.coupon?.percent_off
                      ? `${discount.coupon.percent_off}% off`
                      : discount.coupon?.amount_off
                      ? `$${(discount.coupon.amount_off / 100).toFixed(2)} off`
                      : "Discount Applied"}
                    {" • "}
                    {discount.coupon?.duration === "forever"
                      ? "Forever"
                      : discount.coupon?.duration === "once"
                      ? "One-time"
                      : discount.coupon?.duration === "repeating"
                      ? `${discount.coupon.duration_in_months || ""} months`
                      : discount.coupon?.duration || "Active"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyCoupon;
