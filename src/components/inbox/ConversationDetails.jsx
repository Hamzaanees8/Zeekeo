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

const ConversationDetails = () => {
  const { selectedConversation } = useInboxStore();

  const [conversationMessages, setConversationMessages] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");

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

    fetchMessages();
  }, [selectedConversation?.profile_id]);

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
      <div className="flex-1 text-black flex flex-col justify-between border-l border-[#D7D7D7]">
        <div className="flex justify-between items-center border-b border-[#D7D7D7] p-3 ">
          <div
            className="flex items-center gap-x-2 p-2 border border-[#D7D7D7] min-w-[202px] cursor-pointer"
            /* onClick={() => toggleSidebar()} */
          >
            <img
              src={
                selectedConversation?.profile?.profile_picture_url ||
                "/default-avatar.png"
              }
              alt={selectedConversation?.profile?.first_name || "Profile"}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-[#0096C7]">
                {selectedConversation.profile?.first_name || "Unknown"}
              </div>
              <div className="flex gap-1 items-center">
                <EyeIcon className="w-4 h-4 fill-[#7E7E7E]" />
                <div className="text-[10px] text-[#7E7E7E]">View Details</div>
              </div>
            </div>
          </div>

          <ConversationSentiment conversation={selectedConversation} />
          <ConversationActions conversation={selectedConversation} />
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
            {!loading &&
              conversationMessages.map((msg, index) => (
                <div key={index} className="relative mb-6">
                  {/* Campaign bubble */}
                  {msg.type === "CAMPAIGN" && (
                    <div className="bg-white border border-[#C4C4C4] px-6 py-4 text-center w-[329px] text-[#7E7E7E] mx-auto relative">
                      <div className="font-medium">{msg.subject}</div>
                      <div className="text-[#7E7E7E] text-xs">
                        <div
                          className="message-body"
                          dangerouslySetInnerHTML={{ __html: msg.body }}
                        ></div>
                      </div>
                      {msg.timestamp && (
                        <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[-10px]">
                          {formatDate(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Received message bubble */}
                  {msg?.type !== "CAMPAIGN" && msg.direction === "in" && (
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
                        <div
                          className="message-body"
                          dangerouslySetInnerHTML={{ __html: msg.body }}
                        ></div>
                        {msg.timestamp && (
                          <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[10px]">
                            {formatDate(msg.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sent message bubble */}
                  {msg?.type !== "CAMPAIGN" && msg.direction === "out" && (
                    <div className="relative bg-white border border-[#7E7E7E] px-3 py-4 rounded-[10px] w-max text-sm max-w-[300px] ml-auto">
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
                        <div className="text-[12px] text-[#FFFFFF] text-center p-1 bg-[#0096C7] w-auto absolute top-[-15px] right-[10px]">
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
                  border-t-[13px] border-t-white"
                      ></div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Message Input Section */}
          {selectedConversation.archived !== true && (
            <MessageComposer
              profileId={selectedConversation.profile_id}
              onMessageSent={newMsg => {
                console.log('new message showing up...')
                setConversationMessages(prev => [...prev, newMsg]);
              }}
            />
          )}
        </div>
      </div>

      {/* Sidebar-style block below clicked message */}
      {showSidebar && (
        <ProfileTimeline
          selectedConversation={selectedConversation}
          setShowSidebar={setShowSidebar}
        />
      )}
    </>
  );
};

export default ConversationDetails;
