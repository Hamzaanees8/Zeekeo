import { useState, useMemo } from "react";
import {
  FaceIcon,
  FaceIcon1,
  FaceIcon2,
  FaceIcon3,
  FilterProfile,
} from "../Icons";
import useInboxStore from "../../routes/stores/useInboxStore";
import { updateConversation } from "../../services/inbox";
import toast from "react-hot-toast";

const ConversationSentiment = ({ conversation }) => {
  const { conversations, updateConversationInStore } = useInboxStore();

  const [updating, setUpdating] = useState(false);
  const [updatingSentiment, setUpdatingSentiment] = useState(null);

  const latestConversation = useMemo(
    () =>
      conversations.find(c => c.profile_id === conversation?.profile_id) ||
      conversation,
    [conversations, conversation],
  );

  const handleUpdate = async (field, value) => {
    if (!latestConversation?.profile_id) return;
    setUpdating(true);
    setUpdatingSentiment(value);
    try {
      await updateConversation(latestConversation.profile_id, {
        [field]: value,
      });
      updateConversationInStore(latestConversation.profile_id, {
        [field]: value,
      });
      toast.success("Sentiment has been saved!");
    } catch (err) {
      console.error("Failed to update conversation sentiment:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update conversation sentiment.");
      }
    } finally {
      setUpdating(false);
      setUpdatingSentiment(null);
    }
  };

  return (
    <>
      {/* Sentiment */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[14px] text-[#7E7E7E]">Sentiment Analysis</div>
        <div className="flex gap-2">
          <div
            className={`w-7 h-7 flex items-center justify-center ${
              updating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !updating && handleUpdate("sentiment", "positive")}
          >
            {updating && updatingSentiment === "positive" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1FB33F] border-t-transparent"></div>
            ) : (
              <FaceIcon
                className={`w-7 h-7 ${
                  latestConversation.sentiment === "positive"
                    ? "fill-[#1FB33F]"
                    : "fill-[#7E7E7E]"
                } ${!updating && "hover:fill-[#1FB33F]"}`}
              />
            )}
          </div>
          <div
            className={`w-7 h-7 flex items-center justify-center ${
              updating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !updating && handleUpdate("sentiment", "neutral")}
          >
            {updating && updatingSentiment === "neutral" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#FFCB4D] border-t-transparent"></div>
            ) : (
              <FaceIcon1
                className={`w-7 h-7 ${
                  latestConversation.sentiment === "neutral"
                    ? "fill-[#FFCB4D]"
                    : "fill-[#7E7E7E]"
                } ${!updating && "hover:fill-[#FFCB4D]"}`}
              />
            )}
          </div>
          <div
            className={`w-7 h-7 flex items-center justify-center ${
              updating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !updating && handleUpdate("sentiment", "negative")}
          >
            {updating && updatingSentiment === "negative" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#DE4B32] border-t-transparent"></div>
            ) : (
              <FaceIcon2
                className={`w-7 h-7 ${
                  latestConversation.sentiment === "negative"
                    ? "fill-[#DE4B32]"
                    : "fill-[#7E7E7E]"
                } ${!updating && "hover:fill-[#DE4B32]"}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Meeting booked */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[14px] text-[#7E7E7E]">Meeting Booked</div>
        <div className="flex gap-2">
          <div
            className={`w-7 h-7 flex items-center justify-center ${
              updating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !updating && handleUpdate("sentiment", "meeting_booked")}
          >
            {updating && updatingSentiment === "meeting_booked" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#28F0E6] border-t-transparent"></div>
            ) : (
              <FilterProfile
                className={`w-7 h-7 ${
                  latestConversation.sentiment == "meeting_booked"
                    ? "fill-[#28F0E6]"
                    : "fill-[#7E7E7E]"
                } ${!updating && "hover:fill-[#28F0E6]"}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Deal closed */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[14px] text-[#7E7E7E]">Deal Closed</div>
        <div className="flex gap-2">
          <div
            className={`w-6 h-6 flex items-center justify-center ${
              updating ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() => !updating && handleUpdate("sentiment", "deal_closed")}
          >
            {updating && updatingSentiment === "deal_closed" ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#00AAD9] border-t-transparent"></div>
            ) : (
              <FaceIcon3
                className={`w-6 h-6 ${
                  latestConversation.sentiment == "deal_closed"
                    ? "fill-[#00AAD9]"
                    : "fill-[#7E7E7E]"
                } ${!updating && "hover:fill-[#00AAD9]"}`}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSentiment;
