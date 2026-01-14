const InfoModal = ({ actions, onClose }) => {
  // Convert to array and sort: Newest (Latest) to Oldest (Recent)
  const sortedActions = actions
    ? Object.values(actions).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white w-[470px] px-7 pt-[15px] pb-[28px] rounded-[8px] shadow-md">
        <div className="flex justify-between items-start mb-[21px]">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Detailed Information
          </h2>
          <button onClick={onClose} className="cursor-pointer">
            ✕
          </button>
        </div>
        <div className="w-full border border-[#7E7E7E] rounded-[6px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FFFFFF] text-left font-poppins">
              <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
                <th className="px-3 py-[20px] !font-[500]">Type</th>
                <th className="px-3 py-[20px] !font-[500]">Time</th>
                <th className="px-3 py-[20px] !font-[500]">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedActions.length > 0 ? (
                sortedActions.map((action, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-b-[#E5E5E5] text-sm text-[#7E7E7E]"
                  >
                    <td className="px-3 py-2">
                      {(() => {
                        switch (action.type) {
                          case "linkedin_view":
                            return "Viewed";
                          case "linkedin_invite":
                            return "Invite Sent";
                          case "linkedin_message":
                            return "Message Sent";
                          case "linkedin_like_post":
                            return "Liked Post";
                          case "linkedin_invite_accepted":
                            return "Profile Connected";
                          default:
                            return action.type;
                        }
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(action.timestamp).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      {action.success ? (
                        <span className="text-green-600">Success</span>
                      ) : (
                        <span className="text-red-600">Failed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-3 py-4 text-center text-gray-500 italic"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between gap-4 font-medium text-base font-urbanist mt-[20px]">
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1 text-white border border-[#04479C] bg-[#04479C] cursor-pointer rounded-[4px]"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
