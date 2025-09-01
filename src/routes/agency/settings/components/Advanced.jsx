import React, { useState } from "react";

const Advanced = () => {
  const [enableNotifications, setEnableNotifications] = useState(false);
  const [enableReplies, setEnableReplies] = useState(false);
  const [enableAcceptInvite, setEnableAcceptInvite] = useState(false);
  const [javascriptCode, setJavascriptCode] = useState("");
  const [whiteLabelRequest, setWhiteLabelRequest] = useState("");
  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D]">
        <div className="flex-1 flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-urbanist bg-[#FFFFFF] w-[415px]">
          <p className="text-[20px] font-medium">Javascript Code</p>
          <p className="text-[14px] font-medium">
            Allows you to offer custom support through a third party software
            like Intercom, Drift, Botfuse, etc...
          </p>
          <div>
            <p className="font-poppins font-normal text-base">Code</p>
            <textarea
              name="javascriptCode"
              id="javascriptCode"
              value={javascriptCode}
              onChange={e => setJavascriptCode(e.target.value)}
              className="w-full border border-[#7E7E7E] min-h-[400px] p-3 text-[14px] font-normal focus:outline-none"
            ></textarea>
          </div>
        </div>
        <div className="flex-1 border border-[#7E7E7E] p-6 w-[670px] bg-[#FFFFFF] flex flex-col gap-y-6">
          <p className="text-[14px] font-medium">
            Agencies must have 5 active accounts to qualify for ‘White label
            Features.’
          </p>
          <label>
            <span className="text-base font-normal">White label Request</span>
            <div className="flex h-[40px]">
              <input
                value={whiteLabelRequest}
                onChange={e => setWhiteLabelRequest(e.target.value)}
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none"
              />
              <button className="bg-[#6D6D6D] text-white px-4 cursor-pointer">
                Request
              </button>
            </div>
          </label>
          <hr className="border-[#6D6D6D] border" />
          <div className="flex flex-col gap-y-[18px]">
            <div className="flex items-center gap-x-6">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[460px]">
                <p className="font-bold">Notifications</p>
                <p className="font-medium">
                  Auto send email notification when your users LinkedIn account
                  is disconnected from platform.
                </p>
              </div>
              <button
                onClick={() => setEnableNotifications(!enableNotifications)}
                className={`px-3 py-2 text-center w-[130px] h-9 cursor-pointer h-  ${
                  enableNotifications
                    ? "bg-[#16A37B] text-white"
                    : "bg-[#7E7E7E] text-white"
                }`}
              >
                {enableNotifications ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center gap-x-6">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[460px]">
                <p className="font-bold">New Reply From Campaign</p>
                <p className="font-medium">
                  Auto send email notification when your users LinkedIn account
                  is disconnected from platform.
                </p>
              </div>
              <button
                onClick={() => setEnableReplies(!enableReplies)}
                className={`px-3 py-2 text-center w-[130px] h-9 cursor-pointer h-  ${
                  enableReplies
                    ? "bg-[#16A37B] text-white"
                    : "bg-[#7E7E7E] text-white"
                }`}
              >
                {enableReplies ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center gap-x-6">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[460px]">
                <p className="font-bold">Prospect Accept Invite Request</p>
                <p className="font-medium">
                  Auto send email notification when prospect accepts an invite
                  request.
                </p>
              </div>
              <button
                onClick={() => setEnableAcceptInvite(!enableAcceptInvite)}
                className={`px-3 py-2 text-center w-[130px] h-9 cursor-pointer   ${
                  enableAcceptInvite
                    ? "bg-[#16A37B] text-white"
                    : "bg-[#7E7E7E] text-white"
                }`}
              >
                {enableAcceptInvite ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="mt-3 flex justify-between">
              <div className="flex flex-col text-[#7E7E7E] text-[14px] w-[460px]">
                <p className="font-bold">API Key</p>
                <p className="font-medium">
                  A programmatic method to access reporting data in Dashboard.
                  Automate complex reporting tasks to save time.
                </p>
              </div>
              <div className=" flex flex-col gap-y-[10px] w-[170px]">
                <span className="bg-[#FFFFFF] border-2 border-[#0096c7] text-[#0096c7] px-3 py-2 text-center cursor-pointer rounded-[20px] text-[14px] font-medium">
                  How API works
                </span>
                <span className="bg-[#FFFFFF] border-2 border-[#0096c7] text-[#0096c7] px-3 py-2 text-center cursor-pointer rounded-[20px] text-[14px] font-medium">
                  API Docs
                </span>
                <span className="bg-[#0387FF] border-2 border-[#0387FF] text-[#FFFFFF] px-3 py-2 text-center cursor-pointer rounded-[20px] text-[14px] font-medium">
                  API Docs
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <button className="mt-4 px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer">
          Save
        </button>
      </div>
    </div>
  );
};

export default Advanced;
