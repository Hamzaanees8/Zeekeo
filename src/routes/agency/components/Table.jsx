const Table = ({ headers = [], data = [], rowsPerPage, type }) => {
  const visibleData =
    rowsPerPage === "all" ? data : data.slice(0, rowsPerPage);

  const handleUrlClick = url => {
    if (url) window.open(url, "_blank");
  };

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] shadow-md overflow-y-auto min-h-[370px] custom-scroll1 bg-[#FFFFFF]">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            {type === "invoices" && (
              <th className="px-3 py-[20px] !font-[400]"></th>
            )}
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
                colSpan={
                  type === "invoices" ? headers.length + 1 : headers.length
                }
                className="px-3 py-[20px] !font-[400] text-left text-[#6D6D6D] text-[13px]"
              >
                No data available
              </td>
            </tr>
          ) : (
            visibleData?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                {type === "invoices" && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {rowIndex + 1}
                  </td>
                )}
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-2 py-[20px] !font-[400]">
                    {header === "URL" && row[header] ? (
                      <span
                        className="text-blue-600 underline cursor-pointer"
                        onClick={() => handleUrlClick(row[header])}
                      >
                        View
                      </span>
                    ) : row[header] !== undefined && row[header] !== "" ? (
                      row[header]
                    ) : (
                      "-"
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
