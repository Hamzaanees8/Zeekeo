import { useState, useEffect } from "react";

const InvoiceTable = ({ upcomingInvoiceData }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [billingDate, setBillingDate] = useState("");
  useEffect(() => {
    const calculateTotal = () => {
      let sum = 0;
      upcomingInvoiceData.forEach(item => {
        const amountAsNumber = parseFloat(
          item.amount.replace("$", "").replace(/,/g, ""),
        );
        if (!isNaN(amountAsNumber)) {
          sum += amountAsNumber;
        }
      });

      setTotalAmount(
        sum.toLocaleString("en-US", { style: "currency", currency: "USD" }),
      );

      // Set billing date from the first item's period
      if (upcomingInvoiceData.length > 0) {
        const periodParts = upcomingInvoiceData[0].period.split(" - ");
        if (periodParts.length === 2) {
          setBillingDate(periodParts[1]); // take the end date
        }
      }
    };

    calculateTotal();
  }, [upcomingInvoiceData]);

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md h-fit">
      <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D]">
        Upcoming invoice
      </div>
      <div className="px-4 pb-4 text-left font-poppins text-sm text-[#7E7E7E]">
        Invoice will be billed at: {billingDate || "N/A"}
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
          {upcomingInvoiceData.length > 0 ? (
            upcomingInvoiceData.map((item, index) => (
              <tr
                key={index}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">{item.number}</td>
                <td className="px-3 py-[20px] !font-[400]">{item.period}</td>
                <td className="px-3 py-[20px] !font-[400]">
                  {item.description}
                </td>
                <td className="px-3 py-[20px] !font-[400]">{item.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="px-3 py-[20px] text-center text-[#6D6D6D]"
              >
                No upcoming invoices
              </td>
            </tr>
          )}
          {upcomingInvoiceData.length > 0 && (
            <tr className="text-[#6D6D6D] text-[13px] font-bold">
              <td
                colSpan="3"
                className="px-3 py-[20px] !font-[600] text-right"
              >
                Total:
              </td>
              <td className="px-3 py-[20px] !font-[600]">{totalAmount}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;
