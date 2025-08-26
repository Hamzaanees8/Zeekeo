import React, { useState, useRef } from "react";
import {
  EyeIcon,
  FaceIcon,
  FaceIcon1,
  FaceIcon2,
  FaceIcon3,
  FilterProfile,
  TagIcon,
  ThreeDots,
  Reply,
  MarkMail,
  InboxArchive,
  AttachFile,
  SendIcon,
  LinkedIn1,
  EmailIcon,
  InvitesIcon,
  LockIcons,Cross
} from "../../../components/Icons";

const campaignTimeline = [
  {
    type: "locked",
    label: "Profile Locked to Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    icon: <LockIcons className="w-3 h-3" />,
    iconBg: "#0077B6",
    iconColor: "#0077B6",
  },
  {
    type: "step",
    step: 1,
    label: "Profile Sequence #1 In Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "1",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
  {
    type: "joined",
    label: "Profile Joined Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "+",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
  {
    type: "email",
    step: 1,
    label: "Profile Email Sequence #1 in Campaign",
    campaign: "Campaign Name",
    date: "2025-07-08",
    iconText: "1",
    iconBg: "#0077B6",
    iconColor: "#fff",
  },
];

const MessageView = ({ conversation }) => {

  if (!conversation) {
    return <div className="flex-1 p-6">Select a conversation to view details</div>;
  }

  const [checked, setChecked] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // Do something with the file here...
    }
  };

  return (
    <>
      <div className="flex-1 text-black flex flex-col justify-between border-l border-[#D7D7D7]">
        {/* Header */}

        <div className="flex justify-between items-center border-b border-[#D7D7D7] p-3 ">
          <div
            className="flex items-center gap-x-2 p-2 border border-[#D7D7D7] min-w-[202px] cursor-pointer"
            onClick={() => toggleSidebar()}
          >
            <div className="w-9 h-9 rounded-full bg-white" />
            <div>
              <div className="font-semibold text-[#0096C7]">
                {message.name}
              </div>
              <div className="flex gap-1 items-center">
                <EyeIcon className="w-4 h-4 fill-[#7E7E7E]" />
                <div className="text-[10px] text-[#7E7E7E]">View Details</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-2">
            <div className="text-[12px] text-[#7E7E7E] ">
              Sentiment Analysis
            </div>
            <div className="flex gap-2">
              <FaceIcon className="w-7 h-7 fill-[#1FB33F]" />
              <FaceIcon1 className="w-7 h-7 fill-[#7E7E7E]" />
              <FaceIcon2 className="w-7 h-7 fill-[#7E7E7E]" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-2">
            <div className="text-[12px] text-[#7E7E7E] ">
              Sentiment Analysis
            </div>
            <div className="flex gap-2">
              <FilterProfile className="w-7 h-7 !fill-[#00B4D8]" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-2">
            <div className="text-[12px] text-[#7E7E7E] ">Deal Closed</div>
            <div className="flex gap-2">
              <FaceIcon3 className="w-6 h-6 !fill-[#7E7E7E]" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-y-2">
            <div className="flex gap-4 place-self-end">
              <span className="cursor-pointer">
                <Reply className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <span className="cursor-pointer">
                <MarkMail className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <span className="cursor-pointer">
                <InboxArchive className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <span className="cursor-pointer">
                <TagIcon className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <span className="cursor-pointer">
                <ThreeDots className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setChecked(prev => !prev)}
            >
              <div className="w-[18px] h-[18px] border-2 border-[#6D6D6D] flex items-center justify-center">
                {checked && <div className="w-[10px] h-[10px] bg-[#0387FF]" />}
              </div>
              <span className="text-[14px] text-[#7E7E7E] font-semibold font-urbanist">
                Force Continue Sequence
              </span>
            </div>
          </div>
        </div>
        {/*------ */}
        <div
          className="bg-white p-6 "
          style={{
            backgroundImage:
              "radial-gradient(rgb(204 204 204 / 34%) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        >
          {/* Message Timeline */}
          <div className="flex flex-col gap-6 ">
            {message?.messages?.map((msg, index) => (
              <div key={index} className="relative mb-6">
                {/* Campaign bubble */}
                {msg.type === "campaign" && (
                  <div className="bg-white border border-[#C4C4C4] px-6 py-4 text-center w-[329px] text-[#7E7E7E] mx-auto relative">
                    <div className="font-medium">{msg.text}</div>
                    <div className="text-[#7E7E7E] text-xs">{msg.subtext}</div>
                    {msg.date && (
                      <div className="text-[12px] text-[#FFFFFF] text-center py-1 bg-[#0096C7] w-[80px] absolute top-[-15px] right-[-10px]">
                        {msg.date}
                      </div>
                    )}
                  </div>
                )}

                {/* Received message bubble */}
                {msg.type === "received" && (
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-white" />
                    <div className="relative bg-white border border-[#7E7E7E] px-3 py-4 rounded-[10px] w-max text-sm text-[#7E7E7E] min-w-[270px]">
                      {/* Grey border corner (back) */}
                      <div
                        className="absolute -bottom-[13px] left-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-[#7E7E7E]"
                      ></div>

                      {/* White bubble corner (front) */}
                      <div
                        className="absolute -bottom-[12px] left-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-white"
                      ></div>
                      {msg.text}
                      {msg.date && (
                        <div className="text-[12px] text-[#FFFFFF] text-center py-1 bg-[#0096C7] w-[80px] absolute top-[-15px] right-[10px]">
                          {msg.date}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sent message bubble */}
                {msg.type === "sent" && (
                  <div className="relative bg-white border border-[#7E7E7E] px-3 py-4 rounded-[10px] w-max text-sm max-w-[300px] ml-auto">
                    <div className="text-xs font-semibold text-[#7E7E7E] mb-1">
                      {msg.title}
                    </div>
                    <div className="text-sm text-[#6D6D6D]">{msg.text}</div>
                    {msg.date && (
                      <div className="text-[12px] text-[#FFFFFF] text-center py-1 bg-[#0096C7] w-[80px] absolute top-[-15px] right-[10px]">
                        {msg.date}
                      </div>
                    )}
                    {/* Grey border corner (back) */}
                    <div
                      className="absolute -bottom-[13px] right-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-[#7E7E7E]"
                    ></div>

                    {/* White bubble corner (front) */}
                    <div
                      className="absolute -bottom-[12px] right-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-white"
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message Input Section */}
          <div className="mt-8">
            <div className="text-[16px] font-urbanist font-medium text-[#7E7E7E] pb-2">
              Write a Message
            </div>
            <div className="flex items-center gap-4 mb-2">
              <select className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white">
                <option>LinkedIn Premium Message</option>
              </select>
              <select className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white">
                <option>Select Template</option>
              </select>
              <select className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white">
                <option>Select Persona</option>
              </select>
            </div>
            <textarea
              placeholder=""
              className="w-full h-[170px] border border-[#7E7E7E] px-4 py-2 text-sm mb-2 bg-white resize-none focus:outline-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <span className="cursor-pointer" onClick={handleIconClick}>
                  <AttachFile className="w-5 h-5 fill-[#7E7E7E]" />
                </span>
                <button className="text-[#7E7E7E] text-[14px] flex items-center bg-white gap-2 px-3 py-1 border-1 border-[#7E7E7E] cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#D9D9D9]" />
                  AI – Assisted Response
                </button>
              </div>
              <button className="bg-[#0387FF] text-white px-5 py-1 text-[20px] flex items-center gap-2 cursor-pointer">
                Send
                <SendIcon className="w-5 h-5 fill-white ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar-style block below clicked message */}
      {showSidebar && (
        <div className="bg-white px-6 py-4 shadow-inner fixed top-[5%] right-0 h-[90vh] w-[252px] flex flex-col gap-4 overflow-y-scroll">
          {message?.messages?.length > 0 && (
            <div className=" text-[#0096C7] text-[10px] py-1">
              {message.messages[message.messages.length - 1].date}
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <LinkedIn1 className="w-4 h-4 " />
            <span
              className="text-[20px] cursor-pointer"
              onClick={() => setShowSidebar(false)}
            >
              <Cross className="w-5 h-5 fill-[#7E7E7E]"/>
            </span>
          </div>

          <div className="flex flex-col justify-center items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-[#D9D9D9]" />
          </div>
          <div className="flex flex-col justify-center items-center gap-1">
            <div className="text-[#16A37B] text-[10px] ">{message.degree}</div>
            <div className="text-[#454545] text-[14px] font-semibold font-urbanist">
              {message.name}
            </div>
            <div className="text-[#7E7E7E] text-[12px] ">{message.title}</div>
            <div className="flex items-center gap-2">
              <InvitesIcon className="w-4 h-4 fill-[#7E7E7E]" />
              <div className="text-[#03045E] text-[12px] ">
                {message.email}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 ">
            <div className="text-[#7E7E7E] text-[12px]">
              <span className="font-bold text-[#454545]">Industry: </span>
              {message.industry}
            </div>
            <div className="text-[#7E7E7E] text-[12px]">
              <span className="font-bold text-[#454545]">Title: </span>
              {message.title}
            </div>
            <div className="text-[#7E7E7E] text-[12px]">
              <span className="font-bold text-[#454545]">Location: </span>
              {message.location}
            </div>
          </div>

          <div className="relative mt-4 border-l border-[#BDBDBD]">
            {campaignTimeline.map((item, index) => (
              <div key={index} className="mb-6 pl-4 relative">
                <div
                  className="absolute -left-[11px] top-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: item.iconBg,
                    color: item.iconColor,
                  }}
                >
                  {item.icon || item.iconText}
                </div>

                <div className="text-[#454545] text-[12px] font-semibold leading-4">
                  {item.label}
                </div>
                <div className="text-[#7E7E7E] text-[10px]">
                  {item.campaign}
                </div>
                <div className="text-[#00B4D8] text-[10px]">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageView;
