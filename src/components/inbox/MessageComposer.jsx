import { useState, useEffect, useRef } from "react";
import { sendMessage } from "../../services/inbox";
import { AttachFile, SendIcon } from "../Icons";
import toast from "react-hot-toast";
import { getInboxResponse } from "../../services/ai";
import { getPersonas } from "../../services/personas";

const MessageComposer = ({ profileId, onMessageSent, messages }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState("");

  // fetch personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const res = await getPersonas();
        setPersonas(res || []);
      } catch (err) {
        console.error("Failed to load personas:", err);
        toast.error("Could not load personas");
      }
    };
    fetchPersonas();
  }, []);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // TODO: handle file upload logic if required
    }
  };

  const handleAiResponse = async () => {
    setAiLoading(true);
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.direction === "in" ? "prospect" : "user",
        content: msg.body,
      }));

      const aiReply = await getInboxResponse({
        profileId,
        messages: formattedMessages,
      });

      setMessage(aiReply);
      toast.success("AI suggestion added!");
    } catch (err) {
      console.error("AI response error:", err);
      toast.error("Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSend = async () => {
    const messageBody = message.trim();

    if (!messageBody) {
      toast.error("Please enter the message");
      return;
    }

    setSending(true);
    try {
      const newMsg = await sendMessage({
        profileId,
        body: messageBody,
        type: "linkedin",
      });

      const normalizedMsg = {
        id: newMsg?.messageId || Date.now(),
        body: messageBody,
        subject: "",
        type: "MESSAGE",
        direction: "out",
        timestamp: Date.now(),
      };

      // Optimistically append to conversation
      onMessageSent(normalizedMsg);
      setMessage("");
      toast.success("Message sent successfully!");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="writeMessageSection" className="mt-8">
      <div className="text-[16px] font-urbanist font-medium text-[#7E7E7E] pb-2">
        Write a Message
      </div>

      {/* dropdowns */}
      <div className="flex items-center gap-4 mb-2">
        <select className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white">
          <option value="linkedin">LinkedIn Message</option>
          {/* <option value="email">Email</option> */}
        </select>
        {/* <select className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white">
          <option>Select Template</option>
        </select> */}
      </div>

      {/* textarea */}
      <textarea
        placeholder=""
        className="w-full h-[170px] border border-[#7E7E7E] px-4 py-2 text-sm mb-2 bg-white resize-none focus:outline-none"
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={sending}
      />

      {/* actions */}
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

          <button
            type="button"
            className="text-[#7E7E7E] text-[14px] flex items-center bg-white gap-2 px-3 py-1 border border-[#7E7E7E] cursor-pointer disabled:opacity-50"
            onClick={handleAiResponse}
            disabled={aiLoading}
          >
            <div className="w-7 h-7 rounded-full bg-[#D9D9D9]" />
            {aiLoading ? "Getting AI..." : "AI - Assisted Response"}
          </button>

          <select
            className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white"
            value={selectedPersona}
            onChange={e => setSelectedPersona(e.target.value)}
          >
            <option value="">Select Persona</option>
            {personas.map(p => (
              <option key={p.persona_id} value={p.persona_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-[#0387FF] text-white px-5 py-1 text-[20px] flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
          <SendIcon className="w-5 h-5 fill-white ml-2" />
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
