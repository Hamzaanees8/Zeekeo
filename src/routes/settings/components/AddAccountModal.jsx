import React from "react";

const AddAccountModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}>
      <div className="bg-white w-[550px] p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Add Account
          </h2>
          <button onClick={onClose} className="cursor-pointer">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            className="border border-[#7E7E7E]  px-3 py-2 text-sm focus:outline-none"
            placeholder="Sender Email"
          />
          <input
            className="border border-[#7E7E7E]  px-3 py-2 text-sm focus:outline-none"
            placeholder="Sender Name"
          />
        </div>

        <label className="block text-[16px] font-urbanist font-semibold text-[#6D6D6D] mb-1">Server Settings</label>
        <input className="w-full border border-[#7E7E7E] text-[#7E7E7E] px-3 py-2 text-sm mb-4" placeholder="Custom" />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="SMTP Username" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="IMAP Username" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="SMTP Password" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="IMAP Password" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="SMTP Server" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="IMAP Server" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="SMTP Port" />
          <input className="border border-[#7E7E7E]  px-3 py-2 text-sm text-[#7E7E7E]" placeholder="IMAP Port" />
        </div>

        <div className="flex gap-6 mb-4">
          <label className="flex items-center text-[#6D6D6D] text-[16px] gap-2">
            <input type="checkbox" className="accent-[#0387FF]" defaultChecked />
            Secure (SSL/TLS)
          </label>
          <label className="flex items-center text-[#6D6D6D] text-[16px] gap-2">
            <input type="checkbox" className="accent-[#0387FF]" defaultChecked />
            Secure (SSL/TLS)
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button className="bg-transparent border border-[#7E7E7E] text-[#7E7E7E]  px-4 py-1 text-sm">
            Test Connection
          </button>
          <button className="bg-[#0387FF] text-white  px-4 py-1">
            Add Sender
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;
