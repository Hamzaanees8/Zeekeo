import { useState, useEffect } from "react";

const InvoiceTable = ({ upcomingInvoiceData }) => {
  const [totalAmount, setTotalAmount] = useState("$0.00");
  const [billingDate, setBillingDate] = useState("");

  useEffect(() => {
    if (!upcomingInvoiceData) return;

    if (upcomingInvoiceData.formattedTotal) {
      setTotalAmount(upcomingInvoiceData.formattedTotal);
    } else if (upcomingInvoiceData.total) {
      setTotalAmount(`$${(upcomingInvoiceData.total / 100).toFixed(2)}`);
    }

    if (upcomingInvoiceData.billingDate) {
      setBillingDate(upcomingInvoiceData.billingDate);
    } else if (upcomingInvoiceData.periodEnd) {
      setBillingDate(upcomingInvoiceData.periodEnd);
    }
  }, [upcomingInvoiceData]);

  // Check if we have valid upcoming invoice data
  const hasValidInvoiceData =
    upcomingInvoiceData &&
    upcomingInvoiceData.periodStart &&
    upcomingInvoiceData.periodEnd;

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md h-fit">
      <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D]">
        Upcoming Invoice
      </div>
      <div className="px-4 pb-4 text-left font-poppins text-sm text-[#7E7E7E]">
        Invoice will be billed at: {billingDate || ""}
      </div>
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]">#</th>
            <th className="px-3 py-[20px] !font-[400]">Period</th>
            <th className="px-3 py-[20px] !font-[400]">Description</th>
            <th className="px-3 py-[20px] !font-[400]">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {hasValidInvoiceData ? (
            <tr className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]">
              <td className="px-3 py-[20px] !font-[400]">1</td>
              <td className="px-3 py-[20px] !font-[400]">
                {`${upcomingInvoiceData.periodStart} - ${upcomingInvoiceData.periodEnd}`}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {upcomingInvoiceData.description || "No description available"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">{totalAmount}</td>
            </tr>
          ) : (
            <tr>
              <td
                colSpan="4"
                className="px-3 py-[20px] text-center text-[#6D6D6D] text-[13px] !font-[400]"
              >
                No upcoming invoices
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
