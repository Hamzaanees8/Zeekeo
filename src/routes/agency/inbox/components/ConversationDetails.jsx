import { useState, useRef, useEffect, useMemo } from "react";
import { EyeIcon } from "../../../../components/Icons";
import { getAgencyUserMessages } from "../../../../services/agency";
import MessageComposer from "./MessageComposer";
import ConversationSentiment from "./ConversationSentiment";
import ConversationActions from "./ConversationActions";
import ProfileTimeline from "./ProfileTimeline";
import useInboxStore from "../../../stores/useInboxStore";
import { useAuthStore } from "../../../stores/useAuthStore";

const ConversationDetails = ({ campaigns, email }) => {
  const [chatHeight, setChatHeight] = useState("42vh");
  const { selectedConversation } = useInboxStore();
  const [conversationMessages, setConversationMessages] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const activeProfileIdRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?.profile_id) return;
      activeProfileIdRef.current = selectedConversation.profile_id;
      setLoading(true);
      try {
        const res = await getAgencyUserMessages({
          profileId: selectedConversation.profile_id,
          email,
        });
        const campaignLogs = [];
        if (selectedConversation?.profile_instances) {
          selectedConversation.profile_instances.forEach(instance => {
            if (instance.actions) {
              Object.entries(instance.actions).forEach(([actionId, action]) => {
                campaignLogs.push({
                  id: actionId,
                  type: "CAMPAIGN_LOG",
                  timestamp: action.timestamp,
                  campaignId: instance.campaign_id,
                  actionType: action.type, // e.g., "email_message", "linkedin_message"
                  success: action.success,
                  // We can add more fields if needed
                });
              });
            }
          });
        }

        const allItems = [...res.messages, ...campaignLogs];
        // Sort messages by timestamp in ascending order
        const sortedMessages = allItems.sort((a, b) => {
          const timestampA = new Date(a.timestamp).getTime();
          const timestampB = new Date(b.timestamp).getTime();
          return timestampA - timestampB;
        });
        setConversationMessages(sortedMessages);
        setNextPage(res.next);
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      } finally {
        setLoading(false);
      }
    };
    setShowSidebar(false);

    fetchMessages();
  }, [selectedConversation?.profile_id, email]);

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
// Create a quick lookup map for campaigns
  const campaignMap = useMemo(() => {
    const map = {};
    if (campaigns && campaigns.length) {
      campaigns.forEach(c => {
        const id = c.campaign_id;
        if (c && id) {
          map[id] = c.name;
        }
      });
    }
    return map;
  }, [campaigns]);

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
  const formatDate = timestamp => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const currentYear = new Date().getFullYear();
    const messageYear = date.getFullYear();

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      year: messageYear !== currentYear ? "numeric" : undefined,
    });
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

          <ConversationSentiment
            conversation={selectedConversation}
            email={email}
          />
          <ConversationActions
            conversation={selectedConversation}
            email={email}
          />
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
            className="flex flex-col gap-6 myChatDiv overflow-hidden overflow-y-scroll custom-scroll pt-[16px] pr-[5px]"
            style={{ height: chatHeight }}
          >
            {!loading &&
              conversationMessages.map((msg, index) => (
                <div key={index} className="relative mb-6">
                   {/* Campaign Action Log */}
                  {msg.type === "CAMPAIGN_LOG" && (
                    <div className="flex justify-center my-1">
                      <div className="bg-white rounded-full px-10 py-[2px] text-xs text-[#6D6D6D] flex flex-col items-center gap-1 border border-[#E5E7EB] shadow-sm min-w-[450px] text-center">
                        <div className="font-semibold uppercase tracking-wide text-[11px]">
                          {msg.actionType?.replace(/_/g, " ")}
                        </div>
                        {campaignMap[msg.campaignId] && (
                          <div className="text-[10px] text-[#7E7E7E]">
                            in{" "}
                            <span
                              className="font-medium text-[#0387FF]"
                              title={msg.campaignId}
                            >
                              {campaignMap[msg.campaignId]}
                            </span>
                          </div>
                        )}
                        <div className="text-[9px] text-[#9CA3AF]">
                          {formatDate(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
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
                if (newMsg.profileId === activeProfileIdRef.current) {
                  setConversationMessages(prev => [...prev, newMsg]);
                }
              }}
              messages={conversationMessages}
              email={email}
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
