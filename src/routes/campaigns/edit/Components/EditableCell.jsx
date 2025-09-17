import { useState, useEffect } from "react";
import { updateProfile } from "../../../../services/campaigns";
import toast from "react-hot-toast";

const EditableCell = ({ value, profileId, field, otherValue, subField }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleFinishEdit = async () => {
    if (tempValue !== value) {
      setIsUpdated(true);

      let updateData;

      if (field === "current_positions") {
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
        setTempValue(tempValue);
      } catch (error) {
        console.error(error);
        setTempValue(value);
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
              setTempValue(value);
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
