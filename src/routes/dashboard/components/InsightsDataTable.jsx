import React from "react";

const InsightsDataTable = ({ data = [] }) => {
  return (
    <div className="overflow-x-auto p-4 bg-white">
      <table className="min-w-full   rounded-lg shadow-sm bg-white">
        {/* Table Head */}
        <thead className="text-left text-[16px] text-[#1E1D1D]">
          <tr>
            <th className="px-4 py-2 border-b border-gray-200">Profile</th>
            <th className="px-4 py-2 border-b border-gray-200">Name</th>
            <th className="px-4 py-2 border-b border-gray-200">Heading</th>
            <th className="px-4 py-2 border-b border-gray-200">Network Distance</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 transition-colors"
            >
              {/* Profile */}
              <td className="px-4 py-2 border-b border-gray-200">
                <img
                  src={row.profileImage}
                  alt={row.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </td>

              {/* Name */}
              <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]">{row.name}</td>

              {/* Heading */}
              <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]">{row.heading}</td>

              {/* Network Distance */}
              <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]">{row.networkDistance}</td>              
            </tr>
          ))}

          {/* If no data */}
          {data.length === 0 && (
            <tr>
              <td
                colSpan="5"
                className="px-4 py-6 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InsightsDataTable;
