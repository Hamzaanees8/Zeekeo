import { GroupsIcon, LogsIcon, DeleteIcon } from "../../../../components/Icons";

const headers = ["#", "Group Name", "Members", "Actions"];

const ActionButton = ({ onClick, tooltip, children }) => (
  <div
    onClick={onClick}
    className="cursor-pointer relative group"
  >
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
      {tooltip}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
    </div>
  </div>
);

const GroupsTable = ({ data = [], onManageMembers, onViewLogs, onDelete }) => {
  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            {headers.map((header, index) => (
              <th key={index} className="px-3 py-[20px] !font-[400]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {data?.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-3 py-[20px] !font-[400] text-left text-[#6D6D6D] text-[13px]"
              >
                No groups available
              </td>
            </tr>
          ) : (
            data.map((group, rowIndex) => (
              <tr
                key={group.group_id}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">{rowIndex + 1}</td>
                <td className="px-3 py-[20px] !font-[400]">{group.name}</td>
                <td className="px-3 py-[20px] !font-[400]">
                  {group.members?.length || 0}
                </td>
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center gap-x-2.5">
                    <ActionButton
                      onClick={() => onManageMembers && onManageMembers(group)}
                      tooltip="Manage Members"
                    >
                      <GroupsIcon fill="#0387FF" />
                    </ActionButton>
                    <ActionButton
                      onClick={() => onViewLogs && onViewLogs(group)}
                      tooltip="View Logs"
                    >
                      <LogsIcon className="fill-[#0387FF]" />
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete && onDelete(group)}
                      tooltip="Delete Group"
                    >
                      <DeleteIcon />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GroupsTable;
