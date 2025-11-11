import { useState } from "react";
import AddTemplateForm from "./components/AddTemplateForm";
import SavedMessages from "./components/SavedMessages";
import { Helmet } from "react-helmet";
import { getUserFolders } from "../../../utils/user-helpers";

export const AgencyTemplates = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({});

  const showAddTemplate = msg => {
    setActiveTab("add");
    setMessage({
      body: msg.body,
      folder: msg.folder,
      category: msg.type,
    });
  };

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
          </div>

          <div>
            {activeTab === "add" ? (
              <AddTemplateForm
                search={search}
                initialData={message}
                folders={getUserFolders()}
              />
            ) : (
              <SavedMessages
                search={search}
                showAddTemplate={showAddTemplate}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AgencyTemplates;
