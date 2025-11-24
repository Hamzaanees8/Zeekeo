import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  PencilIcon,
  CopyIcon,
  DeleteIcon,
  ShareMessage,
  SequencesIcon,
  InviteMessage,
  InMailsIcon,
  MailIcon,
  DropArrowIcon,
  Archive,
  Folder,
  StepReview,
} from "../../../../components/Icons.jsx";
import EditTemplateForm from "./EditTemplateForm";
import FolderPopup from "./FolderPopup.jsx";
import ActionPopup from "./ActionPopup.jsx";
import {
  getCurrentUser,
  getUserFolders,
} from "../../../../utils/user-helpers.jsx";
import { updateFolders } from "../../../../services/users.js";
import {
  deleteTemplate,
  getTemplates,
  deleteTemplates,
  updateTemplate,
  updateTemplates,
} from "../../../../services/templates.js";
import AddTemplateForm from "./AddTemplateForm.jsx";
import { templateCategories } from "../../../../utils/template-helpers.js";
import { updateAgencyFolders } from "../../../../services/agency.js";

const ICONS = {
  Invite: InviteMessage,
  "Sequence Message": SequencesIcon,
  InMail: InMailsIcon,
  "Email Sequence": MailIcon,
};

const SavedMessages = ({ showAddTemplate }) => {
  const [expanded, setExpanded] = useState([]);
  const [activeTab, setActiveTab] = useState("All Templates"); // Default to All Templates
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditFolderPopup, setShowEditFolderPopup] = useState(false);
  const [editFolderName, setEditFolderName] = useState("");
  const [showMovePopup, setShowMovePopup] = useState(false);
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [copyTarget, setCopyTarget] = useState(null);
  const [moveTarget, setMoveTarget] = useState(null);
  
  // Data States
  const [templatesByFolder, setTemplatesByFolder] = useState({});
  const [allTemplates, setAllTemplates] = useState([]); // Store raw list for "All Templates" tab
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [folders, setFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTemplates();
    const foldersList = getUserFolders();
    setFolders(foldersList);
  }, []);

  const fetchTemplates = async () => {
    try {
      const { templates } = await getTemplates();

      // 1. Store all templates for the "All Templates" tab
      setAllTemplates(templates || []);

      // 2. Group them for the "Folders" tab
      const grouped = templates?.reduce((acc, template) => {
        const folder = template.folder || "Unassigned";
        if (!acc[folder]) {
          acc[folder] = [];
        }
        acc[folder].push(template);
        return acc;
      }, {});

      setTemplatesByFolder(grouped || {});
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleConfirmDeleteTemplate = async () => {
    try {
      await deleteTemplate(deleteTarget.data.template_id);
      toast.success("Template deleted successfully");
      await fetchTemplates();
    } catch (err) {
      console.error("Failed to delete template:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete template");
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleMoveTemplate = async (folder) => {
    try {
      await updateTemplate(moveTarget.data.template_id, {
        ...moveTarget.data,
        folder: folder,
      });
      toast.success("Template moved successfully");
      await fetchTemplates();
    } catch (err) {
      console.error("Failed to moved template:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to moved template");
      }
    } finally {
      setMoveTarget(null);
    }
  };

  // To open
  const handleEditFolder = (folder) => {
    setEditFolderName(folder);
  };

  const loadFoldersList = () => {
    const foldersList = getUserFolders();
    setFolders(foldersList);
  };
  // To close
  const closeEditFolderPopup = () => {
    setTimeout(() => setEditFolderName(null), 0);
    loadFoldersList();
  };

  const isFolderSelected = () => {
    // Only folders can be selected in Folders tab
    return selectedItems.some((key) => key.startsWith("folder-"));
  };

  const handleToggleFolder = (folderKey) => {
    setExpanded((prev) =>
      prev.includes(folderKey)
        ? prev.filter((key) => key !== folderKey) // collapse
        : [...prev, folderKey] // expand
    );
  };

  const expandAll = () => {
    const allKeys = getCurrentData().map((folder, fIdx) => `folder-${fIdx}`);
    if (expanded.length === 0) setExpanded(allKeys);
    else setExpanded([]);
  };

  const handleSelectToggle = (key) => {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
    setTimeout(setEditingKey(null), 0);
  };

  const isSelected = (key) => selectedItems.includes(key);

  // MODIFIED: Tabs updated
  const tabs = ["All Templates", "Folders"];

  const deleteMultipleFolders = async (foldersToDelete) => {
    try {
      const currentUser = getCurrentUser();

      if (!currentUser) {
        toast.error("No user session found.");
        return;
      }

      const updatedFolders = folders.filter(
        (folder) => !foldersToDelete.includes(folder)
      );

      const isAgency =
        currentUser.type === "agency" || currentUser.role === "agency_admin";

      if (isAgency) {
        await updateAgencyFolders(updatedFolders);
      } else {
        await updateFolders(updatedFolders);
      }

      toast.success("Selected folders deleted successfully.");

      loadFoldersList?.();
      setSelectedItems?.([]);
    } catch (err) {
      console.error("Error deleting folders:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete selected folders.");
      }
    }
  };

  const deleteMultipleTemplates = async (templatesToDelete) => {
    try {
      await deleteTemplates(templatesToDelete);
      toast.success("Selected templates deleted successfully.");
      loadFoldersList();
      fetchTemplates();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error deleting templates:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete selected templates.");
      }
    }
  };

  const moveMultipleTemplates = async (templatesToMove, folder) => {
    try {
      await updateTemplates(templatesToMove, { folder });
      toast.success("Selected templates moved successfully.");
      loadFoldersList();
      fetchTemplates();
      setSelectedItems([]);
    } catch (err) {
      console.error("Error moving templates:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to move selected templates.");
      }
    }
  };

  // MODIFIED: Get Data based on new tabs
  const getCurrentData = () => {
    if (activeTab === "All Templates") {
      // Return a virtual folder for All Templates
      return ["All Templates"]; 
    }
    if (activeTab === "Folders") {
      // Return User Folders + Unassigned at the bottom
      return [...folders, "Unassigned"];
    }
    return [];
  };

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    const currentData = getCurrentData();

    if (!term) return currentData;

    return currentData.filter((folder) => {
      // 1. Determine which source array we are looking at
      let templatesToCheck = [];
      if (activeTab === "All Templates") {
        templatesToCheck = allTemplates;
      } else {
        templatesToCheck = templatesByFolder[folder] || [];
      }

      // 2. Check if any template inside matches
      const templateMatch = templatesToCheck.some((t) =>
        t.name.toLowerCase().includes(term)
      );
      
      // 3. For Folders tab, we also check the folder name itself
      const folderNameMatch = activeTab === "Folders" && folder.toLowerCase().includes(term);

      return templateMatch || folderNameMatch;
    });
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex gap-3 mb-4 justify-between">
        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setEditingKey(null);
                setExpanded([]);
                setActiveTab(tab);
              }}
              className={`px-2 py-1 border text-urbanist transition-all duration-150 cursor-pointer rounded-[6px] ${
                activeTab === tab
                  ? "bg-[#0387FF] text-white border-[#0387FF]"
                  : "bg-white text-[#0387FF] border-[#0387FF]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Search box with icon */}
        <div className="relative w-[60%] ">
          <span className="absolute left-2 top-1/2 -translate-y-1/2">
            <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-[#7E7E7E] pl-8 pr-3 py-1 rounded-[6px] text-urbanist text-[#6D6D6D] bg-white focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Top Buttons */}
      <div className="flex justify-end mb-4 gap-3">
        {/* Only show Expand/Collapse in Folders view */}
        <button
          className={`${
            activeTab === "All Templates" ? "hidden" : ""
          } px-2 py-1 border text-urbanist bg-white text-[#7E7E7E] border-[#7E7E7E] cursor-pointer rounded-[6px]`}
          onClick={expandAll}
        >
          {expanded.length === 0 ? "Expand All" : "Collapse All"}
        </button>
        <button
          className={`px-2 py-1 border text-urbanist bg-white text-[#7E7E7E] border-[#7E7E7E] cursor-pointer rounded-[6px]`}
          onClick={() => {
            setSelectMultiple(!selectMultiple);
            if (selectMultiple) setSelectedItems([]);
          }}
        >
          {selectMultiple ? "UnSelect" : "Select Multiple"}
        </button>
        <span>
          <button
            className="px-2 py-1 border text-urbanist bg-white text-[#7E7E7E] border-[#7E7E7E] cursor-pointer rounded-[6px]"
            onClick={() => setShowPopup(true)}
          >
            + Folder
          </button>
          {showPopup && (
            <FolderPopup
              onClose={() => {
                setShowPopup(false);
                loadFoldersList();
              }}
            />
          )}
        </span>
      </div>

      <div className="bg-white px-4 py-5 mb-4 rounded-[8px] border border-[#7E7E7E] shadow-md">
        {getFilteredData().length === 0 && (
          <div className="p-4 text-gray-500">No templates found</div>
        )}
        {getFilteredData().map((folder, fIdx) => {
          const folderKey = `folder-${fIdx}`;
          
          // Determine source of templates based on tab
          let rawTemplates = [];
          if (activeTab === "All Templates") {
            rawTemplates = allTemplates;
          } else {
            rawTemplates = templatesByFolder[folder] || [];
          }

          const folderTemplates = rawTemplates.filter(
            (t) =>
              t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              !searchTerm
          );

          // In All Templates tab, always expanded. In Folders tab, check logic.
          const isExpanded =
            activeTab === "All Templates" || searchTerm
              ? true
              : expanded.includes(folderKey);

          return (
            <div
              key={folderKey}
              className="border-t border-[#7E7E7E] py-2 first:border-t-0"
            >
              {/* Folder Header: Only show in Folders tab */}
              {activeTab === "Folders" && (
                <div className="flex justify-between items-center">
                  <div
                    className="flex items-center gap-2 cursor-pointer w-[40%] justify-between flex-shrink-0"
                    onClick={() => handleToggleFolder(folderKey)}
                  >
                    <div className="flex gap-3 justify-center items-center">
                      <Folder className="w-5 h-5 fill-[#7E7E7E]" />
                      <span className="text-sm text-[#6D6D6D] font-urbanist">
                        {folder}
                      </span>
                    </div>
                    <DropArrowIcon
                      className={`w-3 h-3 ml-1 transition-transform duration-300 transform origin-center ${
                        expanded.includes(folderKey) ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  <div className="flex gap-2">
                    {/* Don't allow editing/deleting the Unassigned folder */}
                    {folder !== "Unassigned" && (
                      <>
                        <span
                          onClick={() => handleEditFolder(folder)}
                          title="Edit Folder"
                        >
                          <PencilIcon className="w-5 h-5 p-[2px] rounded-full border border-[#12D7A8] fill-[#12D7A8] cursor-pointer" />
                        </span>

                        <span
                          onClick={() =>
                            setDeleteTarget({ type: "folder", data: folder })
                          }
                          title="Delete Folder"
                        >
                          <DeleteIcon className="w-5 h-5 p-[2px] rounded-full border border-[#D80039] cursor-pointer" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className={`my-2 p-3 bg-white ${activeTab === "All Templates" ? "p-0 my-0" : ""}`}>
                  {folderTemplates.length > 0 ? (
                    folderTemplates.map((msg, mIdx) => {
                      const TypeIcon = ICONS[msg.type] || (() => <span />);
                      const msgKey = `${folderKey}-message-${mIdx}`;

                      return (
                        <React.Fragment key={msgKey}>
                          <div
                            key={mIdx}
                            className="py-3 w-full border-b border-[#CCCCCC]"
                          >
                            <div className="flex justify-between items-center px-2">
                              <div className="flex items-center gap-2 w-[30%]">
                                {selectMultiple && (
                                  <div
                                    className="w-[14px] h-[14px] rounded border-2 border-[#6D6D6D] flex items-center justify-center cursor-pointer font-urbanist"
                                    onClick={() =>
                                      handleSelectToggle(msg.template_id)
                                    }
                                  >
                                    <div
                                      className={`w-[10px] h-[10px]  ${
                                        isSelected(msg.template_id)
                                          ? "bg-[#0387FF]"
                                          : ""
                                      }`}
                                    />
                                  </div>
                                )}
                                <TypeIcon className="w-4 h-4 fill-[#7E7E7E]" />
                                <span className="text-sm font-medium text-[#6D6D6D] font-urbanist w-[200px]">
                                  {templateCategories[msg.type]}
                                </span>
                              </div>
                              <div className="flex gap-2 items-start w-[60%]">
                                <span className="text-sm font-medium text-[#6D6D6D] font-urbanist">
                                  {msg.name}
                                </span>
                              </div>
                              <div className="flex gap-2 w-[20%]">
                                <span
                                  onClick={() => {
                                    if (editingKey === msg.template_id)
                                      setEditingKey(null);
                                    else setEditingKey(msg.template_id);
                                  }}
                                  title="Edit Template"
                                >
                                  <PencilIcon className="w-4 h-4 p-[2px] rounded-full border border-[#12D7A8] fill-[#12D7A8] cursor-pointer" />
                                </span>
                                <span
                                  onClick={() =>
                                    setMoveTarget({
                                      type: "message",
                                      data: msg,
                                    })
                                  }
                                  title="Move Template"
                                >
                                  <ShareMessage className="w-4 h-4 p-[2px] rounded-full border border-[#0077B6] fill-[#0077B6] cursor-pointer" />
                                </span>
                                <span
                                  onClick={() => showAddTemplate(msg)}
                                  title="Copy Template"
                                >
                                  <CopyIcon className="w-4 h-4 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
                                </span>
                                <span
                                  onClick={() => {
                                    setDeleteTarget({
                                      type: "message",
                                      data: msg,
                                    });
                                  }}
                                  title="Delete Template"
                                >
                                  <DeleteIcon className="w-4 h-4 p-[2px] rounded-full border border-[#D80039] cursor-pointer" />
                                </span>
                              </div>
                            </div>

                            {editingKey === msg.template_id && (
                              <div className="mt-3">
                                <AddTemplateForm
                                  initialData={{
                                    ...msg,
                                    category: msg.type || "",
                                  }}
                                  folders={folders}
                                  onCancel={() => setEditingKey(null)}
                                  onSave={(updatedData) => {
                                    setEditingKey(null);
                                    handleSelectToggle(msg.template_id);
                                    fetchTemplates();
                                  }}
                                  onClose={() => setEditingKey(null)}
                                />
                              </div>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <p className="text-gray-400 text-sm px-2 py-3">
                      {activeTab === "All Templates" 
                        ? "No templates found."
                        : "No templates in this folder."}
                    </p>
                  )}
                  {deleteTarget?.type === "message" && (
                    <ActionPopup
                      title="Delete Message"
                      confirmMessage="Are you sure you would like to delete this Message? It cannot be undone"
                      onClose={() => setDeleteTarget(null)}
                      onSave={handleConfirmDeleteTemplate}
                      isDelete={true}
                    />
                  )}

                  {moveTarget && (
                    <ActionPopup
                      title={`Move ${
                        moveTarget.type === "folder" ? "Folder" : "Message"
                      } to Folder`}
                      folders={folders}
                      showSelect
                      onClose={() => setMoveTarget(null)}
                      onSave={handleMoveTemplate}
                      confirmMessage="Please select folder"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {editFolderName && (
        <FolderPopup
          onClose={closeEditFolderPopup}
          initialName={editFolderName}
        />
      )}

      {deleteTarget && (
        <ActionPopup
          title={
            deleteTarget.type === "folder" ? "Delete Folder" : "Delete Message"
          }
          confirmMessage={
            deleteTarget.type === "folder"
              ? "Are you sure you would like to delete this Folder? It cannot be undone"
              : "Are you sure you would like to delete this Message? It cannot be undone"
          }
          onClose={() => setDeleteTarget(null)}
          onSave={async () => {
            if (deleteTarget.type === "folder") {
              try {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                  toast.error("No user session found.");
                  return;
                }
                const existingFolders = Array.isArray(
                  currentUser.template_folders
                )
                  ? [...currentUser.template_folders]
                  : [];

                const updatedFolders = existingFolders.filter(
                  (folder) => folder !== deleteTarget.data
                );
                const isAgency =
                  currentUser.type === "agency" ||
                  currentUser.role === "agency_admin";

                if (isAgency) {
                  await updateAgencyFolders(updatedFolders);
                } else {
                  await updateFolders(updatedFolders);
                }
                loadFoldersList?.();
                toast.success("Folder deleted successfully.");
              } catch (err) {
                console.error("Error deleting folder:", err);
                const msg =
                  err?.response?.data?.message || "Failed to delete folder.";
                if (err?.response?.status !== 401) {
                  toast.error(msg);
                }
              }
            } else {
              console.log("Deleting Message:", deleteTarget.data);
              handleConfirmDeleteTemplate?.();
            }
            setDeleteTarget(null);
          }}
          isDelete={true}
        />
      )}

      {/* Footer Row for Select Multiple */}
      {selectMultiple && (
        <div className="flex justify-between items-center px-4 py-3 mt-6 border-t border-[#7E7E7E]">
          <button
            className="px-4 py-1 bg-[#7E7E7E] text-white text-sm  cursor-pointer rounded-[4px]"
            onClick={() => {
              setSelectMultiple(false);
              setSelectedItems([]);
            }}
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              className="px-4 py-1 bg-[#0387FF] text-white text-sm cursor-pointer rounded-[4px]"
              onClick={() => setShowMovePopup(true)}
            >
              Move Selected
            </button>
            <button
              className="px-4 py-1 bg-[#D80039] text-white text-sm  cursor-pointer rounded-[4px]"
              onClick={() => setShowDeletePopup(true)}
            >
              Delete Selected
            </button>
          </div>
          {showMovePopup && (
            <ActionPopup
              title="Move Selected to Folder"
              folders={folders}
              showSelect
              onClose={() => setShowMovePopup(false)}
              onSave={(folder) => {
                console.log("Move to:", folder, "Items:", selectedItems);
                setShowMovePopup(false);
                moveMultipleTemplates(selectedItems, folder);
              }}
            />
          )}

          {showDeletePopup && (
            <ActionPopup
              title={isFolderSelected() ? "Delete Folder" : "Delete Message"}
              confirmMessage={
                isFolderSelected()
                  ? "Are you sure you would like to delete this Folder? It cannot be undone"
                  : "Are you sure you would like to delete this Message? It cannot be undone"
              }
              onClose={() => setShowDeletePopup(false)}
              onSave={() => {
                console.log("Deleted Items:", selectedItems);
                if (isFolderSelected()) {
                  deleteMultipleFolders(selectedItems);
                } else {
                  deleteMultipleTemplates(selectedItems);
                }
                setShowDeletePopup(false);
              }}
              isDelete={true}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SavedMessages;