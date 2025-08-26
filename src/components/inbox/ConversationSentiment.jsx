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

  const latestConversation = useMemo(
    () =>
      conversations.find(c => c.profile_id === conversation?.profile_id) ||
      conversation,
    [conversations, conversation],
  );

  const handleUpdate = async (field, value) => {
    if (!latestConversation?.profile_id) return;
    setUpdating(true);
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
      toast.error("Failed to update conversation sentiment.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {/* Sentiment */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[12px] text-[#7E7E7E]">Sentiment Analysis</div>
        <div className="flex gap-2">
          <div
            className="w-7 h-7 cursor-pointer"
            onClick={() => handleUpdate("sentiment", "positive")}
          >
            <FaceIcon
              className={`w-7 h-7 cursor-pointer ${
                latestConversation.sentiment === "positive"
                  ? "fill-[#1FB33F]"
                  : "fill-[#7E7E7E]"
              } hover:fill-[#1FB33F]`}
            />
          </div>
          <div
            className="w-7 h-7 cursor-pointer"
            onClick={() => handleUpdate("sentiment", "neutral")}
          >
            <FaceIcon1
              className={`w-7 h-7 cursor-pointer ${
                latestConversation.sentiment === "neutral"
                  ? "fill-[#FFCB4D]"
                  : "fill-[#7E7E7E]"
              } hover:fill-[#FFCB4D]`}
            />
          </div>
          <div
            className="w-7 h-7 cursor-pointer"
            onClick={() => handleUpdate("sentiment", "negative")}
          >
            <FaceIcon2
              className={`w-7 h-7 cursor-pointer ${
                latestConversation.sentiment === "negative"
                  ? "fill-[#DE4B32]"
                  : "fill-[#7E7E7E]"
              } hover:fill-[#DE4B32]`}
            />
          </div>
        </div>
      </div>

      {/* Meeting booked */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[12px] text-[#7E7E7E]">Meeting Booked</div>
        <div className="flex gap-2">
          <div
            className="w-7 h-7 cursor-pointer"
            onClick={() => handleUpdate("sentiment", "meeting_booked")}
          >
            <FilterProfile
              className={`w-7 h-7 ${
                latestConversation.sentiment == "meeting_booked"
                  ? "fill-[#28F0E6]"
                  : "fill-[#7E7E7E]"
              } hover:fill-[#28F0E6]`}
            />
          </div>
        </div>
      </div>

      {/* Deal closed */}
      <div className="flex flex-col items-center gap-y-2">
        <div className="text-[12px] text-[#7E7E7E]">Deal Closed</div>
        <div className="flex gap-2">
          <div
            className="w-6 h-6 cursor-pointer"
            onClick={() => handleUpdate("sentiment", "deal_closed")}
          >
            <FaceIcon3
              className={`w-6 h-6 ${
                latestConversation.sentiment == "deal_closed"
                  ? "fill-[#00AAD9]"
                  : "fill-[#7E7E7E]"
              } hover:fill-[#00AAD9]`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSentiment;
