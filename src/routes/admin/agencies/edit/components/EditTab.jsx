import { useState } from "react";
import { LoginIcon } from "../../../../../components/Icons";
import Modal from "../../components/Modal";
import { useParams } from "react-router";
import { updateAgency } from "../../../../../services/admin";
import { useEditContext } from "../context/EditContext";
import toast from "react-hot-toast";

const EditTab = () => {
  const { id } = useParams();
  const {
    email,
    password,
    setPassword,
    notificationEmail,
    setNotificationEmail,
    paidUntil,
    setPaidUntil,
    salesRep,
    setSalesRep,
    accountManager,
    setAccountManager,
    leadSource,
    setLeadSource,
    freeUsers,
    setFreeUsers,
    minUsers,
    setMinUsers,
    plan,
    setPlan,
    planType,
    setPlanType,
    subPausedUntil,
    setSubPausedUntil,
    couponCode,
    setCouponCode,
    whiteLabelDomain,
    setWhiteLabelDomain,
    whiteLabelIconWidth,
    setWhiteLabelIconWidth,
    stripeCustomerId,
    setStripeCustomerId,
    allowLinkedIn,
    setAllowLinkedIn,
    enableGroups,
    setEnableGroups,
    enablePremium,
    setEnablePremium,
    allowDeactivate,
    setAllowDeactivate,
  } = useEditContext();
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handleSave = async () => {
    const payload = {
      email: email,
      paid_until: paidUntil,
      enabled: enablePremium,
    };

    // Only include password if user entered a new one
    if (password && password.trim()) {
      payload.password = password;
    }

    try {
      await updateAgency(id, payload);
      toast.success("Agency updated successfully");
      // Clear password field after successful save
      if (password) {
        setPassword("");
      }
    } catch {
      console.log("error");
      toast.error("Failed to update agency");
    }
  };
  return (
    <div className="w-[80%] mx-auto text-sm text-[#6D6D6D]">
      {/* Top Buttons */}

      <div className="flex gap-2 mb-6 justify-end">
        <button
          className="bg-[#0077B6] text-white px-4 py-2 cursor-pointer rounded-[6px]"
          onClick={() => setShowInvoiceModal(true)}
        >
          Add Invoice
        </button>
        <button
          className="bg-[#0077B6] text-white px-4 py-2 cursor-pointer rounded-[6px]"
          onClick={() => setShowCouponModal(true)}
        >
          Coupon
        </button>
        <button className="w-9 h-9 border border-[#6D6D6D] rounded-full flex items-center justify-center bg-white">
          <LoginIcon className="w-4 h-4 text-[#7E7E7E]" />
        </button>
      </div>

      {/* Grid Form */}
      <div className="grid grid-cols-2 gap-4">
        <label>
          <span>ID</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            value={id}
            disabled
          />
        </label>
        <label>
          <span>Change Password</span>
          <input
            type="password"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            value={email}
            disabled
          />
        </label>
        <label>
          <span>Notification Email</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
          />
        </label>
        <label>
          <span>Paid Until</span>
          <input
            type="text"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={paidUntil}
            onChange={e => setPaidUntil(e.target.value)}
          />
        </label>
        <label>
          <span>Sales Representative</span>
          <select
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={salesRep}
            onChange={e => setSalesRep(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a Sales Representative
            </option>
            <option>Janet Jonaston</option>
            <option>Other Rep</option>
          </select>
        </label>
        <label>
          <span>Account Manager</span>
          <select
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={accountManager}
            onChange={e => setAccountManager(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a Account Manager
            </option>
            <option>Fred Fredrick</option>
            <option>Other Manager</option>
          </select>
        </label>
        <label>
          <span>Lead Source</span>
          <select
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={leadSource}
            onChange={e => setLeadSource(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a Lead Source
            </option>
            <option>Referral</option>
            <option>Website</option>
          </select>
        </label>
        <label>
          <span>Free Users</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={freeUsers}
            onChange={e => setFreeUsers(e.target.value)}
          />
        </label>
        <label>
          <span>Minimum Users</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={minUsers}
            onChange={e => setMinUsers(e.target.value)}
          />
        </label>
        <label>
          <span>Plan</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-[#EFEFEF] text-[#7E7E7E] rounded-[6px]"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            disabled
          />
        </label>
        <label>
          <span>Plan Type</span>
          <select
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px] "
            value={planType}
            onChange={e => setPlanType(e.target.value)}
          >
            <option value="" disabled hidden>
              Select a plan
            </option>
            <option>Pro</option>
            <option>Basic</option>
          </select>
        </label>
        <label>
          <span>Subscription Paused Until</span>
          <input
            type="date"
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={subPausedUntil}
            onChange={e => setSubPausedUntil(e.target.value)}
          />
        </label>
        <label>
          <span>Coupon Code For Master Agency</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            placeholder="insert coupon code"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
          />
        </label>
        <label>
          <span>White label domain</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={whiteLabelDomain}
            onChange={e => setWhiteLabelDomain(e.target.value)}
          />
        </label>
        <label>
          <span>White label Icon Width</span>
          <input
            className="w-full p-2 border border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-[6px]"
            value={whiteLabelIconWidth}
            onChange={e => setWhiteLabelIconWidth(e.target.value)}
          />
        </label>
        <label className="col-span-2">
          <span>Stripe Customer ID</span>
          <div className="flex">
            <input
              className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] rounded-tl-[6px] rounded-bl-[6px]"
              value={stripeCustomerId}
              onChange={e => setStripeCustomerId(e.target.value)}
            />
            <button className="bg-[#6D6D6D] text-white px-4 rounded-tr-[6px] rounded-br-[6px]">
              Open Stripe
            </button>
          </div>
        </label>
      </div>

      {/* Toggles */}
      <div className="mt-6 space-y-2">
        {/* Toggle 1 */}
        <div className="flex justify-between items-center mb-3">
          <span>Allow agency admin to open/view users LinkedIn accounts</span>
          <button
            onClick={() => setAllowLinkedIn(!allowLinkedIn)}
            className={`px-3 py-2 text-center w-[130px] cursor-pointer  rounded-[6px] ${
              allowLinkedIn
                ? "bg-[#16A37B] text-white"
                : "bg-[#7E7E7E] text-white"
            }`}
          >
            {allowLinkedIn ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Toggle 2 */}
        <div className="flex justify-between items-center mb-3">
          <span>Enable Groups</span>
          <button
            onClick={() => setEnableGroups(!enableGroups)}
            className={`px-3 py-2 text-center w-[130px] cursor-pointer  rounded-[6px] ${
              enableGroups
                ? "bg-[#16A37B] text-white"
                : "bg-[#7E7E7E] text-white"
            }`}
          >
            {enableGroups ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Toggle 3 */}
        <div className="flex justify-between items-center mb-3">
          <span>Enable Premium</span>
          <button
            onClick={() => setEnablePremium(!enablePremium)}
            className={`px-3 py-2 text-center w-[130px] cursor-pointer  rounded-[6px] ${
              enablePremium
                ? "bg-[#16A37B] text-white"
                : "bg-[#7E7E7E] text-white"
            }`}
          >
            {enablePremium ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Toggle 4 */}
        <div className="flex justify-between items-center mb-3">
          <span>Allow agency to deactivate user from user list</span>
          <button
            onClick={() => setAllowDeactivate(!allowDeactivate)}
            className={`px-3 py-2 text-center w-[130px] cursor-pointer  rounded-[6px] ${
              allowDeactivate
                ? "bg-[#16A37B] text-white"
                : "bg-[#7E7E7E] text-white"
            }`}
          >
            {allowDeactivate ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {/* Agency Master Section */}
      <div className="mt-3 flex justify-between">
        <p className="mb-2">
          Agency is a master Agency for the following agencies:
        </p>
        <div className=" flex flex-col gap-3">
          <span className="bg-[#00B4D8] text-white px-3 py-2 text-center cursor-pointer rounded-[20px]">
            demo@agency.com
          </span>
          <span className="bg-[#00B4D8] text-white px-3 py-2 text-center cursor-pointer rounded-[20px]">
            sub1@zopto.com
          </span>
        </div>
      </div>

      <hr className="mt-3 mb-[21px] w-full text-[#6D6D6D]" />
      {/* Save */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer rounded-[6px]"
        >
          Save
        </button>
      </div>

      {showCouponModal && (
        <Modal
          title="Modal Coupon"
          onClose={() => setShowCouponModal(false)}
          onClick={() => setShowCouponModal(false)}
          type="coupon"
        />
      )}
      {showInvoiceModal && (
        <Modal
          title="Add Invoice"
          onClose={() => setShowInvoiceModal(false)}
          onClick={() => setShowInvoiceModal(false)}
          type="invoice"
        />
      )}
    </div>
  );
};

export default EditTab;
