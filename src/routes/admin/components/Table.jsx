const Table = ({ headers = [], data = [] }) => {
  return (
    <div className="w-full border border-[#7E7E7E]">
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
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-3 py-[20px] !font-[400] text-left text-[#6D6D6D] text-[13px]"
              >
                No data available
              </td>
            </tr>
          ) : (
            data?.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-3 py-[20px] !font-[400]">
                    {row[header] !== undefined && row[header] !== ""
                      ? row[header]
                      : "-"}
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
