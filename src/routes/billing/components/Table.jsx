import { useState } from "react";
import { ViewCircle } from "../../../components/Icons";
import { useSubscription } from "../context/BillingContext";

const Table = () => {
  const { invoices } = useSubscription();
  const [visibleCount, setVisibleCount] = useState(5);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]">Date</th>
            <th className="px-3 py-[20px] !font-[400]">Number</th>
            <th className="px-3 py-[20px] !font-[400]">Description</th>
            <th className="px-3 py-[20px] !font-[400]">Amount</th>
            <th className="px-3 py-[20px] !font-[400]">URL</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {invoices?.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-3 py-[20px] !font-[400] text-left text-[#6D6D6D] text-[13px] w-full"
              >
                No data available
              </td>
            </tr>
          ) : (
            invoices.slice(0, visibleCount).map((item, index) => (
              <tr
                key={index}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">{item.date}</td>
                <td className="px-3 py-[20px] !font-[400]">{item.number}</td>
                <td className="px-3 py-[20px] !font-[400]">
                  {item.description}
                </td>
                <td className="px-3 py-[20px] !font-[400]">{item.amount}</td>
                <td className="px-3 py-[20px] !font-[400]">
                  <button
                    onClick={() =>
                      window.open(item.url, "_blank", "noopener,noreferrer")
                    }
                    className="h-[30px] w-[30px]"
                  >
                    <ViewCircle />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {invoices?.length > visibleCount && (
        <div className="flex justify-center py-3 bg-white">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 border border-[#0387FF] rounded-md text-[#0387FF] hover:bg-gray-100 cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
