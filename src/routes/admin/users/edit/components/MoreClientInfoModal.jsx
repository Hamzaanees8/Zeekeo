import React from "react";
import { Cancel } from "../../../../../components/Icons";

const MoreClientInfoModal = ({
  isOpen,
  onClose,
  email,
  setEmail,
  admin,
  setAdmin,
  userCreated,
  setUserCreated,
  address,
  setAddress,
  vat,
  setVat,
  linkedinEmail,
  setLinkedinEmail,
  linkedinName,
  setLinkedinName,
  linkedinDate,
  setLinkedinDate,
  linkedinUrl,
  setLinkedinUrl,
  stripe,
  setStripe,
  subPausedUntil,
  setSubPausedUntil,
  linkedinCookiesUpdate,
  setLinkedinCookiesUpdate,
  linkedinCredUpdate,
  setLinkedinCredUpdate,
  twitterCookiesUpdate,
  setTwitterCookiesUpdate,
  twitterCredUpdate,
  setTwitterCredUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 font-urbanist"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[700px] max-h-[90vh] overflow-y-auto border border-[#7E7E7E] shadow-lg p-6 relative">
        {/* Title */}
        <h2 className="text-[#04479C] text-[20px] font-semibold mb-4">
          More Client Info
        </h2>

        {/* Close Button */}
        <button
          className="absolute top-7 cursor-pointer right-4 text-gray-600 text-xl"
          onClick={onClose}
        >
          <Cancel />
        </button>

        {/* Modal Form */}
        <div className="grid grid-cols-2 gap-4 text-[#7E7E7E]">
          <label className="col-span-2">
            <span>Email</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            <span>Admin</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
            />
          </label>
          <label>
            <span>User Created</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={userCreated}
              onChange={(e) => setUserCreated(e.target.value)}
            />
          </label>
          <label className="col-span-2">
            <span>Address</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="col-span-2">
            <span>VAT / %</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
            />
          </label>
          <label className="col-span-2">
            <span>
              LinkedIn Email / Name / Date created{" "}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0387FF]"
              >
                Open linkedin Profile
              </a>
            </span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={`${linkedinEmail} / ${linkedinName} / ${linkedinDate}`}
              readOnly
            />
          </label>
          <label>
            <span>Stripe</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={stripe}
              onChange={(e) => setStripe(e.target.value)}
            />
          </label>
          <label>
            <span>Stripe subscription_paused_until</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={subPausedUntil}
              onChange={(e) => setSubPausedUntil(e.target.value)}
            />
          </label>
          <label>
            <span>linkedin_cookies_update_at</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={linkedinCookiesUpdate}
              onChange={(e) => setLinkedinCookiesUpdate(e.target.value)}
            />
          </label>
          <label>
            <span>linkedin_cred_update_at</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={linkedinCredUpdate}
              onChange={(e) => setLinkedinCredUpdate(e.target.value)}
            />
          </label>
          <label>
            <span>twitter_cookies_update_at</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={twitterCookiesUpdate}
              onChange={(e) => setTwitterCookiesUpdate(e.target.value)}
            />
          </label>
          <label>
            <span>twitter_cred_update_at</span>
            <input
              className="w-full border border-[#6D6D6D] text-[12px] p-2"
              value={twitterCredUpdate}
              onChange={(e) => setTwitterCredUpdate(e.target.value)}
            />
          </label>
        </div>

        {/* Save & Close */}
        <div className="flex justify-end mt-6 gap-2">
          <button
            className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreClientInfoModal;
