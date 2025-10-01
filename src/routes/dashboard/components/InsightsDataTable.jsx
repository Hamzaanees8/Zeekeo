import React from "react";

const InsightsDataTable = ({ data = [] }) => {
  return (
    <div className="overflow-x-auto p-4 bg-white rounded-[8px]">
      <table className="min-w-full rounded-lg shadow-sm bg-white font-urbanist">
        {/* Table Head */}
        <thead className="text-left text-[16px] text-[#1E1D1D]">
          <tr>
            <th className="px-4 py-2 border-b border-gray-200 font-medium w-1/12">
              Profile
            </th>
            <th className="px-4 py-2 border-b border-gray-200 font-medium w-2/12">
              Name
            </th>
            <th className="px-4 py-2 border-b border-gray-200 font-medium w-7/12">
              Headline
            </th>
            <th className="px-4 py-2 border-b border-gray-200 font-medium ">
              Network Distance
            </th>
          </tr>
        </thead>
      </table>

      {/* Scrollable body */}
      <div className="max-h-[220px] overflow-y-auto">
        <table className="min-w-full rounded-lg bg-white">
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {/* Profile */}
                <td className="px-4 py-2 border-b border-gray-200 w-1/12">
                  <img
                    src={row.profile_picture}
                    alt={row.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>

                {/* Name */}
                <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]  w-2/12">
                  {row.name}
                </td>

                {/* Heading */}
                <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]  w-7/12">
                  {row.headline}
                </td>

                {/* Network Distance */}
                <td className="px-4 py-2 border-b border-gray-200 text-[#1E1D1D] text-[14px]">
                  {row.network_distance}
                </td>
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
    </div>
  );
};

export default InsightsDataTable;
