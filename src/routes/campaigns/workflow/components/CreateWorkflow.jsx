import React, { useState } from "react";
import WorkflowEditor from "./WorkflowEditor.jsx";
import { ReactFlowProvider } from "@xyflow/react";
import {
  CopyIcon,
  DeleteIcon,
  PencilIcon,
  PlusIcon,
  StepReview,
} from "../../../../components/Icons.jsx";
import WorkflowBuilder from "./WorkflowBuilder.jsx";

const TABS = ["Popular", "All Variants", "Custom Workflow"];

const builtInWorkflows = [
  { name: "Simple", description: "View, Connect, Message" },
  {
    name: "Simple Enhanced",
    description: "View, Connect, Like Post, Send Message",
  },
  {
    name: "Advanced",
    description:
      "View, Connect, Like Post, Send Message. If not connect in 2 weeks send InMail",
  },
];

const customWorkflows = [
  { name: "Custom 1", description: "#invite #GDS" },
  { name: "Custom 2", description: "#invite #GDS" },
];

const CreateWorkflow = ({}) => {
  const [activeTab, setActiveTab] = useState("Popular");
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingWorkflow, setEditingWorkflow] = useState(null); // null means not editing
  const [selectedWorkflow, setSelectedWorkflow] = useState({
    name: "",
    description: "",
    isCustom: false,
  });

  const getFilteredWorkflows = () => {
    let flows = [];
    if (activeTab === "Popular") flows = builtInWorkflows;
    else if (activeTab === "Custom Workflow") flows = customWorkflows;
    else flows = [...builtInWorkflows, ...customWorkflows];
    return flows.filter(flow =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };
  const handleEdit2 = workflow => {
    setEditingWorkflow(workflow);
    setIsEditing(true);
  };
  const handleEdit = workflow => {
    setEditingWorkflow(workflow);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingWorkflow({ name: "", description: "" });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingWorkflow(null);
    setIsEditing(false);
  };

  const handleSave = data => {
    //console.log("Saved Workflow:", data);
    setEditingWorkflow(null);
    setIsEditing(false);
  };

  return (
    <div className="">
      {/* Workflow List and Right Panel */}
      {editingWorkflow ? (
        <ReactFlowProvider>
          <WorkflowEditor
            data={editingWorkflow}
            onCancel={handleCancelEdit}
            onSave={handleSave}
          />
        </ReactFlowProvider>
      ) : (
        <div className="flex space-x-6">
          {/* Left Column */}
          <div className="w-[363px]">
            {/* Tabs */}
            <div className="flex gap-2 mb-3">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`px-2 py-1 text-[16px] border border-[#7E7E7E] transition-all duration-150 cursor-pointer rounded-[4px] ${
                    activeTab === tab
                      ? "bg-[#7E7E7E] text-white"
                      : "bg-[#FFFFFF] text-[#7E7E7E] "
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full border border-[#7E7E7E] text-sm pl-8 pr-2 py-1 bg-white focus:outline-none"
              />
            </div>

            {/* Create Workflow */}
            {activeTab === "Custom Workflow" && (
              <div className="justify-self-end mb-2">
                <button
                  onClick={handleCreate}
                  className="px-2 py-1 text-[16px] border border-[#7E7E7E] bg-[#FFFFFF] text-[#7E7E7E] cursor-pointer"
                >
                  + Create Workflow
                </button>
              </div>
            )}

            {/* Workflow List */}
            <div className="space-y-10">
              {getFilteredWorkflows().map(wf => (
                <div key={wf.name} className="">
                  <div className="flex items-center justify-between">
                    <span className="font-urbanist font-semibold text-[20px] text-[#6D6D6D]">
                      {wf.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        title="Add"
                        onClick={() =>
                          setSelectedWorkflow({
                            name: wf.name,
                            description: wf.description,
                            isCustom:
                              wf.name === "Custom 1" ||
                              wf.name === "Custom 2" ||
                              wf.name === "Custom 3", // true if selected from custom
                          })
                        }
                      >
                        <PlusIcon className="w-5 h-5 p-[2px] border border-[#0387FF] fill-[#0387FF] cursor-pointer rounded-full" />
                      </button>
                      <button title="Edit" onClick={() => handleEdit(wf)}>
                        <PencilIcon className="w-5 h-5 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer rounded-full" />
                      </button>
                      <button title="Copy">
                        <CopyIcon className="w-5 h-5 p-[2px] border border-[#00B4D8] fill-[#00B4D8] cursor-pointer rounded-full" />
                      </button>
                      {activeTab === "Custom Workflow" && (
                        <button title="Delete">
                          <DeleteIcon className="w-5 h-5 p-[2px] border border-[#D80039] cursor-pointer rounded-full" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[16px] text-[#6D6D6D]">
                    {wf.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Builder or Editor */}
          <div className="flex-1 min-h-[400px]  bg-[#DEDEDE] rounded-md">
            {selectedWorkflow.name && (
              <div
                className={`flex items-center justify-between mb-[15px] ${
                  selectedWorkflow.isCustom
                    ? "border-1 border-[#7E7E7E] bg-[#FFFFFF] px-[15px] py-[5px]"
                    : "bg-[#DEDEDE]"
                }`}
              >
                <p className="text-[#6D6D6D] text-[20px] font-semibold">
                  {selectedWorkflow.name}
                </p>
                <div className="flex items-center justify-between gap-x-[10px]">
                  <button
                    title="Edit"
                    onClick={() => handleEdit2(selectedWorkflow)}
                  >
                    <PencilIcon className="w-6.5 h-6.5 p-[2px] border border-[#12D7A8] fill-[#12D7A8] cursor-pointer" />
                  </button>
                  <button title="Copy">
                    <CopyIcon className="w-6.5 h-6.5 p-[2px] border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
                  </button>
                  {selectedWorkflow.isCustom && (
                    <button title="Delete">
                      <DeleteIcon className="w-6.5 h-6.5 p-[2px] border border-[#D80039] cursor-pointer" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center justify-center text-gray-500 h-full">
              <WorkflowBuilder />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkflow;
