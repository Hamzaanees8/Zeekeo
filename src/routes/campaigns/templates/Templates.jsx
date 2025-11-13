import React, { useEffect, useState } from "react";
import AddTemplateForm from "./components/AddTemplateForm";
import SavedMessages from "./components/SavedMessages";
import { Helmet } from "react-helmet";
import { getCurrentUser, getUserFolders } from "../../../utils/user-helpers";
import { getTemplates } from "../../../services/templates";
import AgencyTemplates from "./components/AgencyTemplates";
const dummyTemplates = [
  {
    attachments: [],
    body: "Hi {{FIRST_NAME}},\n\nI came across your profile and was impressed by your experience in {{INDUSTRY}}. Would you be open to exploring new opportunities?",
    created_at: 1755004635370,
    folder: "Recruitment",
    name: "Initial Outreach",
    subject: "",
    type: "linkedin_message",
    updated_at: 1759344843113,
    user_email: "john@example.com",
    template_id: "01989e6d-88e9-7198-9f1c-5ad9027afe8f",
  },
  {
    body: "We're looking for talented {{ROLE}} professionals to join our growing team at {{COMPANY}}. Your background seems like a perfect match!",
    created_at: 1756373386870,
    folder: "Recruitment",
    name: "Talent Sourcing",
    subject: "Exciting Opportunity at {{COMPANY}}",
    type: "linkedin_inmail",
    updated_at: 1759344843136,
    user_email: "john@example.com",
    template_id: "0198f003-0676-731b-8995-04260f736339",
  },
  {
    body: "Following up on our previous conversation about the {{ROLE}} position. Are you available for a quick chat this week?",
    created_at: 1756719419680,
    name: "Follow Up Message",
    subject: "",
    type: "linkedin_message",
    updated_at: 1758662853226,
    user_email: "john@example.com",
    template_id: "019904a3-1120-71c5-9980-f0546273b71b",
  },
  {
    body: "I'd like to connect with you to expand my professional network in the {{INDUSTRY}} space.",
    created_at: 1756719430118,
    name: "Network Expansion",
    subject: "",
    type: "linkedin_invite",
    updated_at: 1759143515692,
    user_email: "john@example.com",
    template_id: "019904a3-39e6-772b-99da-42c8323a6dab",
  },
  {
    body: "Thank you for connecting! I look forward to sharing insights about {{INDUSTRY}} and potential collaborations.",
    created_at: 1756719438120,
    folder: "Welcome Messages",
    name: "Thank You Note",
    subject: "",
    type: "linkedin_message",
    updated_at: 1759243620779,
    user_email: "john@example.com",
    template_id: "019904a3-5928-703f-bcf3-2c7c8002a2c8",
  },
  {
    updated_at: 1756719451780,
    subject: "Partnership Opportunity",
    created_at: 1756719451780,
    user_email: "john@example.com",
    name: "Business Collaboration",
    body: "I believe our companies could benefit from a strategic partnership in the {{INDUSTRY}} market.",
    type: "linkedin_inmail",
    template_id: "019904a3-8e84-76c8-8282-b698a61189ae",
  },
  {
    updated_at: 1756731275663,
    subject: "",
    created_at: 1756731275663,
    user_email: "john@example.com",
    name: "Event Invitation",
    body: "You're invited to our upcoming {{INDUSTRY}} conference next month. Would you like more details?",
    type: "linkedin_message",
    template_id: "01990557-f98f-7663-b1e1-39a471131f18",
  },
  {
    updated_at: 1757358010429,
    subject: "Referral Request",
    created_at: 1757358010429,
    user_email: "john@example.com",
    folder: "Sales",
    name: "Sales Outreach",
    type: "linkedin_inmail",
    body: "I'd appreciate if you could introduce me to the right person in your organization to discuss {{PRODUCT}}.",
    template_id: "01992ab3-303d-77d8-b817-daf36bb36469",
  },
  {
    updated_at: 1757358702190,
    subject: "",
    created_at: 1757358702190,
    user_email: "john@example.com",
    folder: "",
    name: "Industry Connect",
    type: "linkedin_invite",
    body: "As fellow professionals in {{INDUSTRY}}, I thought we should connect and share insights.",
    template_id: "01992abd-be6e-75bc-a75c-8a33281344fa",
  },
  {
    updated_at: 1757358702332,
    subject: "",
    created_at: 1757358702332,
    user_email: "sarah@example.com",
    folder: "Marketing",
    name: "Content Collaboration",
    type: "linkedin_invite",
    body: "I admire your work in {{INDUSTRY}} and would love to explore content collaboration opportunities.",
    template_id: "01992abd-befc-75f0-bca8-e6eee099456a",
  },
  {
    body: "Hi {{FIRST_NAME}}, I noticed we both attended {{EVENT}}. Would be great to connect and discuss key takeaways!",
    created_at: 1757506545289,
    folder: "Event Follow-ups",
    name: "Post-Event Connection",
    subject: "",
    type: "linkedin_message",
    updated_at: 1759342230154,
    user_email: "sarah@example.com",
    template_id: "0199338d-a689-70d2-a6f2-59839b6e6be8",
  },
  {
    body: "Congratulations on your new role at {{COMPANY}}, {{FIRST_NAME}}! Wishing you all the best in this exciting chapter.",
    created_at: 1758662651251,
    folder: "Congratulations",
    name: "Congrats Message",
    subject: "",
    type: "linkedin_message",
    updated_at: 1759342230205,
    user_email: "sarah@example.com",
    template_id: "01997876-6d73-7134-a20a-e079b1708c8f",
  },
  {
    body: "Following up on our discussion about {{TOPIC}}. Here's that article I mentioned that might be helpful.",
    created_at: 1759144247991,
    folder: "Follow-ups",
    name: "Resource Sharing",
    subject: null,
    type: "linkedin_message",
    updated_at: 1759342230699,
    user_email: "sarah@example.com",
    template_id: "0199952b-02b6-727d-9466-be190663e5f3",
  },
  {
    updated_at: 1695302454742,
    created_at: 1695302277059,
    user_email: "mike@example.com",
    name: "Quick Check-in",
    body: "Hi {{FIRST_NAME}} - just checking in to see how things are going with {{PROJECT}}. Let me know if you need any support!\n\nBest regards,\nMike",
    type: "inbox",
    template_id: "0199ec38-4721-7201-9577-f4c5f6f226d6",
  },
  {
    updated_at: 1760605759091,
    subject: "",
    created_at: 1760605759091,
    user_email: "mike@example.com",
    folder: "Customer Support",
    name: "Support Follow-up",
    type: "inbox",
    body: "Just following up on your recent inquiry. Is there anything else we can assist you with?",
    template_id: "0199ec47-e673-7069-9461-555386801b55",
  },
  {
    updated_at: 1760605759092,
    subject: "Welcome to Our Platform",
    created_at: 1760605759092,
    user_email: "mike@example.com",
    folder: "Onboarding",
    name: "New User Welcome",
    type: "email_sequence",
    body: "Welcome {{FIRST_NAME}}! We're excited to have you onboard. Here's how to get started...",
    template_id: "0199ec47-e673-7069-9461-555386801b56",
  },
  {
    updated_at: 1760605759093,
    subject: "",
    created_at: 1760605759093,
    user_email: "lisa@example.com",
    folder: "",
    name: "Quick Question",
    type: "linkedin_message",
    body: "Hi {{FIRST_NAME}}, I have a quick question about your experience with {{TECHNOLOGY}}. Do you have a moment?",
    template_id: "0199ec47-e673-7069-9461-555386801b57",
  },
  {
    updated_at: 1760605759094,
    subject: "Industry Insights",
    created_at: 1760605759094,
    user_email: "lisa@example.com",
    folder: "Content Sharing",
    name: "Article Share",
    type: "linkedin_inmail",
    body: "Thought you might find this recent article about {{INDUSTRY_TREND}} interesting. Would love to hear your thoughts!",
    template_id: "0199ec47-e673-7069-9461-555386801b58",
  },
];
export const Templates = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({});
  const [agencyTemplates, setAgencyTemplates] = useState([]);
  const user = getCurrentUser();

  const showAddTemplate = msg => {
    setActiveTab("add");
    setMessage({
      body: msg.body,
      folder: msg.folder,
      category: msg.type,
    });
  };

  useEffect(() => {
    if (!user?.agency_username) return;

    const fetchAgencyTemplates = async () => {
      try {
        const { agencyTemplates } = await getTemplates();
        setAgencyTemplates(agencyTemplates || []);
      } catch (err) {
        console.error("Failed to fetch agency templates:", err);
      }
    };

    fetchAgencyTemplates();
  }, [user?.agency_username]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zeekeo Launchpad - Templates</title>
      </Helmet>
      <div className="p-6 w-full pt-[64px] bg-[#EFEFEF]">
        <h1 className="text-[48px] font-urbanist text-[#6D6D6D] font-medium mb-6">
          Templates
        </h1>
        <div className="w-[60%] justify-self-center">
          {/* Tabs + Search (in one line) */}
          <div className="flex items-center gap-2 mb-6">
            <button
              className={`px-1 py-1 text-urbanist w-[180px] border transition-all duration-150 cursor-pointer rounded-[6px] ${
                activeTab === "add"
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white text-[#0387FF] border-[#0387FF]"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Add Templates
            </button>
            <button
              className={`px-1 py-1 text-urbanist w-[180px] border transition-all duration-150 cursor-pointer rounded-[6px] ${
                activeTab === "saved"
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white text-[#0387FF] border-[#0387FF]"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Saved Templates
            </button>

            {user?.agency_username && (
              <button
                className={`px-1 py-1 text-urbanist w-[180px] border transition-all duration-150 cursor-pointer rounded-[6px] ${
                  activeTab === "agency"
                    ? "bg-[#0387FF] text-white border-[#0387FF]"
                    : "bg-white text-[#0387FF] border-[#0387FF]"
                }`}
                onClick={() => setActiveTab("agency")}
              >
                Agency Workflows
              </button>
            )}
          </div>

          <div>
            {activeTab === "add" && (
              <AddTemplateForm
                search={search}
                initialData={message}
                folders={getUserFolders()}
              />
            )}
            {activeTab === "saved" && (
              <SavedMessages
                search={search}
                showAddTemplate={showAddTemplate}
              />
            )}
            {activeTab === "agency" && user?.agency_username && (
              <AgencyTemplates agencyTemplates={agencyTemplates} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Templates;
