import { useState, useEffect, useRef } from "react";
import { updateProfile } from "../../../../services/campaigns";
import toast from "react-hot-toast";

const EditableCell = ({
  value,
  profileId,
  field,
  otherValue,
  subField,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");
  const [isUpdated, setIsUpdated] = useState(false);
  const initialValueRef = useRef(value || "");
  const hasUpdatedRef = useRef(false);

  // Reset only when the initial value changes (new profile)
  useEffect(() => {
    if (initialValueRef.current !== value) {
      initialValueRef.current = value || "";
      setTempValue(value || "");
      setIsUpdated(false);
      hasUpdatedRef.current = false;
    }
  }, [value]);

  const handleFinishEdit = async () => {
    const trimmedValue = tempValue.trim();

    // Don't save if value didn't change
    if (trimmedValue === initialValueRef.current) {
      setIsEditing(false);
      setIsUpdated(false);
      return;
    }

    setIsUpdated(true);
    hasUpdatedRef.current = true;

    let updateData;

    if (field === "work_experience") {
      const existingWork = otherValue || {};
      const updatedWork = { ...existingWork, [subField]: trimmedValue };
      updateData = { work_experience: [updatedWork] };
    } else if (field === "current_positions") {
      const existingPos = otherValue || {};
      const updatedPos = { ...existingPos, [subField]: trimmedValue };
      updateData = { current_positions: [updatedPos] };
    } else if (field === "custom_fields") {
      const existing = otherValue || {};
      const updated = { ...existing, [subField]: trimmedValue };
      updateData = { custom_fields: updated };
    } else {
      updateData = { [field]: trimmedValue };
    }

    try {
      await updateProfile(profileId, updateData);
      toast.success("Field Updated Successfully");

      // Update initial reference to new value
      initialValueRef.current = trimmedValue;

      // Notify parent component of the update
      if (onUpdate) {
        onUpdate(profileId, updateData);
      }
    } catch (error) {
      console.error(error);
      // Revert on error
      setTempValue(initialValueRef.current);
      setIsUpdated(false);
      hasUpdatedRef.current = false;
      toast.error("Failed to update field");
    }

    setIsEditing(false);
  };

  return (
    <td
      className={`px-3 py-[18px] !font-[400] !text-[13px] cursor-pointer ${
        isUpdated ? "text-[#0387FF]" : ""
      }`}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <input
          type="text"
          className="text-[13px] w-full focus:outline-none"
          value={tempValue}
          autoFocus
          onChange={e => setTempValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={e => {
            if (e.key === "Enter") handleFinishEdit();
            if (e.key === "Escape") {
              setTempValue(savedValue);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        tempValue || "-"
      )}
    </td>
  );
};

export default EditableCell;
