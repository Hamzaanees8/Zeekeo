import { AdminAddNoteIcon } from "../../../../components/Icons";

const Table = ({ headers = [], data = [], rowsPerPage }) => {
  const visibleData =
    rowsPerPage === "all" ? data : data.slice(0, rowsPerPage);

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
          {visibleData?.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-3 py-[20px] !font-[400] text-left text-[#6D6D6D] text-[13px]"
              >
                No data available
              </td>
            </tr>
          ) : (
            visibleData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center justify-between">
                    <p>{row.template}</p>
                    <div className="cursor-pointer">
                      <AdminAddNoteIcon />
                    </div>
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

export default Table;
