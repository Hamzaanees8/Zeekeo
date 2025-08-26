const TableWrapper = ({ headers = [], children, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`min-w-full text-left`}>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`px-4 py-2 whitespace-nowrap ${className}`}
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
