const TableWrapper = ({ headers = [], children, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`min-w-full text-left`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-2 align-bottom text-center ${
                  header === "Text" ? "!text-left !px-0" : ""
                } ${header === "Actions" ? "!text-center !px-0" : ""} ${className}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default TableWrapper;
