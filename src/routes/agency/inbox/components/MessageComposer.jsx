import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { getCurrentUser } from "../../../../utils/user-helpers";
import {
  getTemplates,
  sendAgencyUserMessage,
} from "../../../../services/agency";
import { getPersonas } from "../../../../services/personas";
import { getInboxResponse } from "../../../../services/ai";
import { AttachFile, CrossIcon, SendIcon } from "../../../../components/Icons";

const MessageComposer = ({
  profileId,
  onMessageSent,
  messages,
  profile,
  email,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [messageType, setMessageType] = useState("linkedin_classic");
  const [attachments, setAttachments] = useState([]);

  const textareaRef = useRef(null);

  // Function to parse template text and replace variables with profile data
  const parseText = (profile, text) => {
    if (!text) return { success: true };

    const VARIABLES = {
      "{{FIRST_NAME}}": profile?.first_name,
      "{{LAST_NAME}}": profile?.last_name,
      "{{FULL_NAME}}": `${profile?.first_name || ""} ${
        profile?.last_name || ""
      }`.trim(),
      "{{INDUSTRY}}":
        profile?.current_positions?.[0]?.industry?.[0] || profile?.industry,
      "{{COMPANY}}":
        profile?.current_positions?.[0]?.company ||
        profile?.work_experience?.[0]?.company,
      "{{ROLE}}":
        profile?.current_positions?.[0]?.role ||
        profile?.work_experience?.[0]?.position,
      "{{ROLE_START_DATE}}": profile?.work_experience?.[0]?.start,
      "{{SHARED_CONNECTIONS}}": profile?.shared_connections_count,
      "{{LOCATION}}": profile?.location,
      "{{CUSTOM_FIELD_1}}": profile?.custom_fields?.["1"],
      "{{CUSTOM_FIELD_2}}": profile?.custom_fields?.["2"],
      "{{CUSTOM_FIELD_3}}": profile?.custom_fields?.["3"],
    };

    // Iterate over the variables and replace the placeholders with the values
    for (const [key, value] of Object.entries(VARIABLES)) {
      if (text.includes(key) && !value) {
        return {
          success: false,
          errorMessage: `Profile missing variable value: ${key}`,
        };
      }

      text = text.replaceAll(key, value);
    }

    return { success: true, text };
  };

  // Check if user has Sales Navigator subscription
  const currentUser = getCurrentUser();
  const hasSalesNavigator =
    currentUser?.accounts?.linkedin?.data?.sales_navigator?.owner_seat_id ||
    false;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset first
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px"; // grow until 200px
    }
  }, [message]);

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

  // fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await getTemplates();
        setTemplates(res?.filter(t => t.type === "inbox") || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
        toast.error("Could not load templates");
      }
    };
    fetchTemplates();
  }, []);

  const handleFileSelect = e => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= 20 * 1024 * 1024); // 20MB limit
    if (validFiles.length < files.length) {
      toast.error("Some files exceeded the 20MB limit.");
    }
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = index => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateChange = e => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (!templateId) {
      // If "Select Template" option is chosen, clear the message
      setMessage("");
      return;
    }

    // Find the selected template and populate the message
    const template = templates.find(t => t.template_id === templateId);
    if (template && template.body) {
      // Parse the template body to replace variables with profile data
      const parseResult = parseText(profile, template.body);

      if (!parseResult.success) {
        toast.error(parseResult.errorMessage);
        return;
      }

      setMessage(parseResult.text || template.body);
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
      if (!email) {
        return;
      }
      const newMsg = await sendAgencyUserMessage({
        profileId,
        body: messageBody,
        type: messageType,
        email: email,
      });
      const normalizedMsg = {
        id: newMsg?.messageId || Date.now(),
        body: messageBody,
        subject: "",
        type: "MESSAGE",
        direction: "out",
        timestamp: Date.now(),
        profileId: profileId,
      };

      // Optimistically append to conversation
      onMessageSent(normalizedMsg);
      setMessage("");
      toast.success("Message sent successfully!");
    } catch (err) {
      console.error("Failed to send message:", err);

      // Handle profile_matching_linkedin_id_not_found error
      if (
        err?.response?.data?.error === "profile_matching_linkedin_id_not_found"
      ) {
        if (messageType === "linkedin_sales_navigator") {
          toast.error("This profile does not have a Sales Navigator ID");
        } else if (messageType === "linkedin_classic") {
          toast.error("This profile is missing a Classic LinkedIn ID");
        } else {
          toast.error("Profile ID not found for the selected message type");
        }
      } else {
        toast.error(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to send message",
        );
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      id="writeMessageSection"
      className="mt-8 border-t-1 border-[#7E7E7E] pt-2 absolute bottom-0 right-0 left-0 p-4"
    >
      <div className="text-[16px] font-urbanist font-medium text-[#7E7E7E] pb-2">
        Write a Message
      </div>

      {/* dropdowns */}
      <div className="flex items-center gap-4 mb-2">
        <select
          className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white rounded-[6px]"
          value={messageType}
          onChange={e => setMessageType(e.target.value)}
        >
          <option value="linkedin_classic">LinkedIn Classic</option>
          {hasSalesNavigator && (
            <option value="linkedin_sales_navigator">
              LinkedIn Sales Navigator
            </option>
          )}
          {/* <option value="email">Email</option> */}
        </select>
        <select
          className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white rounded-[6px]"
          value={selectedTemplate}
          onChange={handleTemplateChange}
        >
          <option value="">Select Template</option>
          {templates.map(template => (
            <option key={template.template_id} value={template.template_id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* textarea */}
      <textarea
        ref={textareaRef}
        placeholder=""
        className="w-full min-h-[100px] border border-[#7E7E7E] px-4 py-2 custom-scroll1 text-sm mb-2 bg-white resize-none focus:outline-none rounded-[8px]"
        style={{
          overflowY: message.split("\n").length > 6 ? "auto" : "hidden",
          scrollbarGutter: "stable",
        }}
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
            multiple
            hidden
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <span
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <AttachFile className="w-5 h-5 fill-[#7E7E7E]" />
          </span>

          <button
            type="button"
            className="text-[#7E7E7E] text-[14px] flex items-center bg-white gap-2 px-3 py-1 border border-[#7E7E7E] cursor-pointer disabled:opacity-50 rounded-[6px]"
            onClick={handleAiResponse}
            disabled={aiLoading}
          >
            <div className="w-7 h-7 rounded-full bg-[#D9D9D9]" />
            {aiLoading ? "Getting AI..." : "AI - Assisted Response"}
          </button>

          {/* <select
            className="text-sm px-2 py-1 border border-[#7E7E7E] bg-white rounded-[4px]"
            value={selectedPersona}
            onChange={e => setSelectedPersona(e.target.value)}
          >
            <option value="">Select Persona</option>
            {personas.map(p => (
              <option key={p.persona_id} value={p.persona_id}>
                {p.name}
              </option>
            ))}
          </select> */}
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-[#0387FF] text-white px-5 py-1 text-[20px] flex items-center gap-2 cursor-pointer disabled:opacity-50 rounded-[6px]"
        >
          {sending ? "Sending..." : "Send"}
          <SendIcon className="w-5 h-5 fill-white ml-2" />
        </button>
      </div>
      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-md text-sm"
            >
              <span>{file.name}</span>
              <CrossIcon
                className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500"
                onClick={() => removeAttachment(index)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageComposer;
