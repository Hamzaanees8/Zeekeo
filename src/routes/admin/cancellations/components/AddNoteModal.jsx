import { useEffect, useState } from "react";

const AddNoteModal = ({ onClose, onSave }) => {
  const [user, setUser] = useState({ email: "" });
  const [note, setNote] = useState("");
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      try {
        const userObj = JSON.parse(userInfo);
        setUser(userObj.email);
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
      }
    }
  }, []);
  const handleSave = () => {
    if (!note.trim()) return;
    onSave({
      email: user,
      note,
    });
    setNote("");
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[500px] p-6">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Add Note
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-y-[14px]">
          <div className="flex flex-col gap-y-[14px]">
            <p className="text-[16px] text-[#7E7E7E] font-[500]">Author</p>
            <input
              type="text"
              disabled
              value={user}
              className="w-full h-[40px] border border-[#6D6D6D] bg-[#EFEFEF] px-4 py-2 font-normal text-[13px] text-[#7E7E7E]"
            />
          </div>
          <div className="flex flex-col gap-y-[14px]">
            <p className="text-[16px] text-[#7E7E7E] font-[500]">Note</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full h-[80px] border border-[#6D6D6D] focus:outline-none px-4 py-2.5 font-normal text-[13px] text-[#7E7E7E]"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist mt-[18px]">
          <button
            onClick={onClose}
            className="px-4 py-1 h-9 w-[100px] text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 h-9 w-[130px] text-white bg-[#0387FF] cursor-pointer border border-[#0387FF]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;
