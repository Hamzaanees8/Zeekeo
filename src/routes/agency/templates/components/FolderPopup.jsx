import { useState } from "react";
import toast from "react-hot-toast";
import {
  InviteMessage,
  SequencesIcon,
  InMailsIcon,
  MailIcon,
  DropArrowIcon,
} from "../../../../components/Icons.jsx";
import FolderForm from "./FolderForm";
import { getCurrentUser } from "../../../../utils/user-helpers.jsx";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { createAgencyFolder, getTemplates, updateTemplates } from "../../../../services/agency.js";

const ICONS = {
  linkedin_invite: InviteMessage,
  linkedin_message: SequencesIcon,
  linkedin_inmail: InMailsIcon,
  email_message: MailIcon,
};

const FolderPopup = ({ onClose, initialName = "" }) => {
  const [folderName, setFolderName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const setUser = useAuthStore(state => state.setUser);

  const handleSaveFolder = async () => {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      toast.error("Please enter valid folder name!");
      return;
    }

    setIsSaving(true);

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("No user found in session.");
        return;
      }

      const existingFolders = Array.isArray(currentUser.template_folders)
        ? [...currentUser.template_folders]
        : [];

      const nameExists = existingFolders.some(
        folder =>
          folder.toLowerCase() === trimmedName.toLowerCase() &&
          folder !== initialName,
      );

      if (nameExists) {
        toast.error("A folder with this name already exists.");
        return;
      }

      let updatedFolders;
      if (initialName) {
        updatedFolders = existingFolders.map(folder =>
          folder === initialName ? trimmedName : folder,
        );
      } else {
        updatedFolders = [...existingFolders, trimmedName];
      }

      const updatedEntity = await createAgencyFolder({
        template_folders: updatedFolders,
      });

      if (initialName && initialName !== trimmedName) {
        try {
          const templates = await getTemplates();
          const templatesToUpdate = templates
            .filter(t => t.folder === initialName)
            .map(t => t.template_id);
          if (templatesToUpdate.length > 0) {
            await updateTemplates(templatesToUpdate, {
              folder: trimmedName,
            });
          }
        } catch (err) {
          console.error("Failed to sync user templates:", err);
        }
      }

      setUser(updatedEntity);
      toast.success(
        initialName
          ? "Folder updated successfully"
          : "Folder created successfully",
      );
      onClose();
    } catch (err) {
      console.error("Error saving folder:", err);
      const msg = err?.response?.data?.message || "Failed to save folder.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white w-[600px] max-h-[90vh] overflow-auto  p-5 relative rounded-[8px] shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-2 right-3 text-[25px] text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-[#0387FF] text-lg font-semibold mb-4">
          {initialName ? "Edit Folder" : "New Folder"}
        </h2>

        {/* Folder Name Input */}
        <input
          type="text"
          placeholder="Name"
          className="w-full border border-[#7E7E7E] px-4 py-2 text-sm bg-white text-[#6D6D6D] mb-4 rounded-[4px]"
          onChange={e => setFolderName(e.target.value)}
          value={folderName}
        />
        {/* Footer Buttons */}
        <div className="flex justify-between gap-3 mt-6">
          <button
            className="px-6 py-1 bg-[#7E7E7E] text-white text-sm cursor-pointer rounded-[4px]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-1 bg-[#0387FF] text-white text-sm cursor-pointer rounded-[4px]"
            onClick={handleSaveFolder}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

// CategoryRow — only clickable if it has no children
const CategoryRow = ({ category, label, children, onClick, showForm }) => {
  const Icon = ICONS[category];

  return (
    <div>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={!children ? onClick : undefined}
      >
        {Icon && <Icon className="w-5 h-5 fill-[#7E7E7E]" />}
        <span className="text-sm text-[#6D6D6D]">{label}</span>
        <DropArrowIcon className="w-4 h-4 ml-1" />
      </div>
      <div className="mt-3 space-y-2">
        {children}
        {showForm && <FolderForm />}
      </div>
    </div>
  );
};

const StepRow = ({ label, onClick, showForm }) => {
  return (
    <div className="flex flex-col gap-1 mb-5">
      <div
        className="ml-8 flex items-center gap-2 text-sm text-[#6D6D6D] cursor-pointer"
        onClick={onClick}
      >
        <span>{label}</span>
        <DropArrowIcon className="w-3 h-3" />
      </div>
      {showForm && (
        <div className="">
          <FolderForm />
        </div>
      )}
    </div>
  );
};

const AddStepButton = () => (
  <button className="flex items-center text-[#04479C] text-sm gap-1 mt-1 justify-self-end">
    <span className="text-lg leading-none">+</span> Add Step
  </button>
);

export default FolderPopup;
