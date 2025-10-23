import React, { useState, useRef, useEffect } from "react";
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
  LockIcons,
  Cross,
} from "../Icons";
import { getMessages, updateConversation } from "../../services/inbox";
import { formatDate } from "../../utils/inbox-helper";
import useInboxStore from "../../routes/stores/useInboxStore";
import MessageComposer from "./MessageComposer";
import ConversationSentiment from "./ConversationSentiment";
import ConversationActions from "./ConversationActions";
import ProfileTimeline from "./ProfileTimeline";
import { useAuthStore } from "../../routes/stores/useAuthStore";

const ConversationDetails = ({ campaigns }) => {
  const [chatHeight, setChatHeight] = useState("42vh");
  const { selectedConversation } = useInboxStore();
  const [conversationMessages, setConversationMessages] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

    const { currentUser: user } = useAuthStore();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?.profile_id) return;
      setLoading(true);
      try {
        const res = await getMessages({
          profileId: selectedConversation.profile_id,
        });
        console.log(res);
        setConversationMessages(res.messages);
        setNextPage(res.next);
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      } finally {
        setLoading(false);
      }
    };
    setShowSidebar(false);

    fetchMessages();
  }, [selectedConversation?.profile_id]);

  useEffect(() => {
    const startW1 = 1535;
    const endW1 = 3000;
    const minH1 = 42;
    const maxH1 = 58;

    const startW2 = 3000;
    const endW2 = 4000;
    const minH2 = 58;
    const maxH2 = 69;

    function updateChatHeight() {
      const vw = window.innerWidth;
      let h;

      if (vw <= startW1) {
        h = minH1;
      } else if (vw > startW1 && vw <= endW1) {
        // Phase 1: 42 → 63
        let ratio = (vw - startW1) / (endW1 - startW1);
        h = minH1 + (maxH1 - minH1) * ratio;
      } else if (vw > endW1 && vw <= endW2) {
        // Phase 2: 63 → 72
        let ratio = (vw - startW2) / (endW2 - startW2);
        h = minH2 + (maxH2 - minH2) * ratio;
      } else {
        // Beyond 4000px
        h = maxH2;
      }

      setChatHeight(`${h}vh`);
    }

    updateChatHeight();
    window.addEventListener("resize", updateChatHeight);
    window.addEventListener("orientationchange", updateChatHeight);

    return () => {
      window.removeEventListener("resize", updateChatHeight);
      window.removeEventListener("orientationchange", updateChatHeight);
    };
  }, []);

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

  if (!selectedConversation) return <></>;

  if (loading) {
    return <div className="p-4 text-gray-500">Loading conversation...</div>;
  }

  if (!conversationMessages.length) {
    return <div className="p-4 text-gray-500">No messages yet</div>;
  }
  console.log(selectedConversation);
  return (
    <>
      <div className="flex-1 text-black flex flex-col border-l border-[#D7D7D7] ">
        <div className="flex justify-between items-center border-b border-[#D7D7D7] p-3 ">
          <div
            className="flex items-center gap-x-2 p-2 border border-[#D7D7D7] min-w-[202px] cursor-pointer rounded-2xl"
            /* onClick={() => toggleSidebar()} */
          >
            <img
              src={
                selectedConversation?.profile?.profile_picture_url ||
                "/default-avatar.png"
              }
              alt={selectedConversation?.profile?.first_name || "Profile"}
              className="w-9 h-9 rounded-full object-cover"
              style={{ boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)" }}
            />
            <div>
              <div className="font-semibold text-[#0096C7]">
                {selectedConversation.profile?.first_name ||
                selectedConversation.profile?.last_name
                  ? `${selectedConversation.profile?.first_name || ""}${
                      selectedConversation.profile?.last_name
                        ? " " + selectedConversation.profile.last_name
                        : ""
                    }`
                  : "Unknown"}
              </div>
              <div
                className="flex gap-1 items-center"
                onClick={() => setShowSidebar(true)}
              >
                <EyeIcon className="w-4 h-4 fill-[#7E7E7E]" />
                <div className="text-[12px] text-[#7E7E7E]">View Details</div>
              </div>
            </div>
          </div>

          <ConversationSentiment conversation={selectedConversation} />
          <ConversationActions conversation={selectedConversation} />
        </div>
        {/*------ */}
        <div
          className="bg-white p-6 rounded-b-[8px] shadow-md h-full relative"
          style={{
            backgroundImage:
              "radial-gradient(rgb(204 204 204 / 34%) 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        >
          {/* Message Timeline */}
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-6 myChatDiv overflow-hidden overflow-y-scroll custom-scroll pt-[16px] pr-[5px]" style={{ height: chatHeight }}
          >
            {!loading &&
              conversationMessages.map((msg, index) => (
                <div key={index} className="relative mb-6">
                  {/* Campaign bubble */}
                  {msg.type === "CAMPAIGN" && (
                    <div className="bg-white border border-[#C4C4C4] px-6 py-4 text-center min-w-[250px] max-w-[329px] text-[#7E7E7E] mx-auto relative">
                      <div className="font-medium">{msg.subject}</div>
                      <div className="text-[#7E7E7E] text-xs">
                        <div
                          className="message-body"
                          dangerouslySetInnerHTML={{ __html: msg.body }}
                        ></div>
                      </div>
                      {msg.timestamp && (
                        <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[-10px] rounded-[4px]">
                          {formatDate(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Received message bubble */}
                  {msg?.type !== "CAMPAIGN" && msg.direction === "in" && (
                    <div className="flex items-start gap-4">
                      {selectedConversation?.profile?.profile_picture_url ? (
                        <img
                          src={
                            selectedConversation.profile.profile_picture_url
                          }
                          alt={
                            selectedConversation?.profile?.first_name ||
                            "Profile"
                          }
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)" }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"></div>
                      )}
                      <div className="relative bg-[#D2EEEF] border border-[#7E7E7E] px-3 py-4 rounded-[10px] w-max text-sm text-[#7E7E7E] min-w-[250px] max-w-[329px]">
                        <div
                          className="absolute -bottom-[13px] left-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-[#7E7E7E]"
                        ></div>

                        <div
                          className="absolute -bottom-[12px] left-3 w-0 h-0 
                  border-l-[10px] border-l-transparent 
                  border-r-[8px] border-r-transparent 
                  border-t-[13px] border-t-[#D2EEEF]"
                        ></div>
                        <div
                          className="message-body"
                          dangerouslySetInnerHTML={{ __html: msg.body }}
                        ></div>
                        {msg.timestamp && (
                          <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[10px] rounded-[4px]">
                            {formatDate(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sent message bubble */}
                  {msg?.type !== "CAMPAIGN" && msg.direction === "out" && (
                    <div className="flex items-start gap-4">
                      <div className="relative bg-[#efefef] border border-[#7E7E7E] px-3 py-4 rounded-[10px] w-max text-sm min-w-[250px] max-w-[329px]  ml-auto">
                        <div className="text-xs font-semibold text-[#7E7E7E] mb-1">
                          {msg.subject}
                        </div>
                        <div className="text-sm text-[#6D6D6D]">
                          <div
                            className="message-body"
                            dangerouslySetInnerHTML={{ __html: msg.body }}
                          ></div>
                        </div>
                        {msg.timestamp && (
                          <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[10px] rounded-[4px]">
                            {formatDate(msg.timestamp)}
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
                  border-t-[13px] border-t-[#efefef]"
                        ></div>
                      </div>
                      {user?.accounts?.linkedin?.data?.profile_picture_url ? (
                        <img
                          src={
                            user?.accounts?.linkedin?.data?.profile_picture_url
                          }
                          alt={
                            user?.accounts?.linkedin?.data?.first_name ||
                            "Profile"
                          }
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)" }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center"></div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Section */}
          {selectedConversation.archived !== true && (
            <MessageComposer
              profileId={selectedConversation.profile_id}
              profile={selectedConversation.profile}
              onMessageSent={newMsg => {
                setConversationMessages(prev => [...prev, newMsg]);
              }}
              messages={conversationMessages}
            />
          )}
        </div>
      </div>

      {/* Sidebar-style block below clicked message */}
      {showSidebar && (
        <ProfileTimeline
          selectedConversation={selectedConversation}
          setShowSidebar={setShowSidebar}
          campaigns={campaigns}
        />
      )}
    </>
  );
};

export default ConversationDetails;
