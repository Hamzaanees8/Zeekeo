const ViewNoteModal = ({ onClose, onSave, data }) => {
  console.log("data", data);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[500px] p-6">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            View Notes
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-y-[14px]">
          {data.Notes && data.Notes.length > 0 ? (
            data.Notes.map((note, idx) => (
              <div key={idx} className="flex flex-col gap-y-[14px]">
                <p className="font-normal text-xs text-[#00B4D8]">
                  [{note.email}] {note.createdAt}
                </p>
                <p className="font-normal text-xs text-[#454545]">
                  {note.note}
                </p>
                <hr className="text-[#6D6D6D] w-full" />
              </div>
            ))
          ) : (
            <p className="text-xs text-[#7E7E7E]">No notes available</p>
          )}
        </div>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist mt-[18px]">
          <button
            onClick={onClose}
            className="px-4 py-1 h-9 w-[100px] text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1 h-9 w-[130px] text-white bg-[#0387FF] cursor-pointer border border-[#0387FF]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewNoteModal;
