import { useState, useEffect } from "react";
import { updateProfile } from "../../../../services/campaigns";
import toast from "react-hot-toast";

const EditableCell = ({ value, profileId, field, otherValue, subField }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [savedValue, setSavedValue] = useState(value);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    setTempValue(value);
    setSavedValue(value);
  }, [value]);

  const handleFinishEdit = async () => {
    if (tempValue !== savedValue) {
      setIsUpdated(true);

      let updateData;

      if (field === "work_experience") {
        const existingWork = otherValue || {};
        const updatedWork = {
          ...existingWork,
          [subField]: tempValue,
        };
        updateData = { work_experience: [updatedWork] };
      } else if (field === "current_positions") {
        const existingPosition = otherValue;
        const updatedPosition = {
          ...existingPosition,
          [subField]: tempValue,
        };
        updateData = { current_positions: [updatedPosition] };
      } else {
        updateData = { [field]: tempValue };
      }

      try {
        await updateProfile(profileId, updateData);
        toast.success("Field Updated Successfully");
        setSavedValue(tempValue);
      } catch (error) {
        console.error(error);
        setTempValue(savedValue);
        setIsUpdated(false);
        toast.error("Failed to update field");
      }
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
