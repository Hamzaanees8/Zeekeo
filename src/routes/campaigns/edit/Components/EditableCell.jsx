import { useState, useEffect } from "react";

const EditableCell = ({ value }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleFinishEdit = () => {
    if (tempValue !== value) {
      setIsUpdated(true);
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
