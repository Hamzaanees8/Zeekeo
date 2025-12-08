const formatEvent = (event) => {
  switch (event) {
    case "created":
      return "Group Created";
    case "member_added":
      return "Member Added";
    case "member_removed":
      return "Member Removed";
    default:
      return event;
  }
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LogsDialog = ({ group, onClose }) => {
  // Sort logs by timestamp ascending (oldest first, newest at bottom)
  const sortedLogs = [...(group.logs || [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white w-[500px] p-6 relative border border-[#7E7E7E] shadow-2xl rounded-[8px]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#6D6D6D] text-[30px] leading-none hover:text-black cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-[20px] font-semibold text-[#04479C] mb-4">
          Group Logs - {group.name}
        </h2>

        {/* Logs List */}
        <div className="border border-[#7E7E7E] rounded-[6px] max-h-[400px] overflow-y-auto mb-4">
          {sortedLogs.length === 0 ? (
            <div className="px-4 py-4 text-gray-500 text-center text-sm">
              No logs yet
            </div>
          ) : (
            sortedLogs.map((log, index) => (
              <div
                key={index}
                className="px-4 py-3 border-b border-[#CCCCCC] last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-[#6D6D6D] text-sm">
                    {formatEvent(log.event)}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                {log.target && (
                  <div className="text-sm text-gray-500 mt-1">
                    User: {log.target}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 h-[36px] py-1 bg-[#7E7E7E] text-white rounded-[6px] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogsDialog;
