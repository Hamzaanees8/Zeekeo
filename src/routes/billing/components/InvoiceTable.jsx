import { useState, useEffect } from "react"; 
import { TooltipInfoIcon } from "../../../components/Icons";

const InvoiceTable = ({upcomingInvoiceData}) => {


  const [totalAmount, setTotalAmount] = useState(0); 

  useEffect(() => {
    
    const calculateTotal = () => {
      let sum = 0;
      upcomingInvoiceData.forEach((item) => {
        
        const amountAsNumber = parseFloat(item.amount.replace('$', ''));
        if (!isNaN(amountAsNumber)) {
          sum += amountAsNumber;
        }
      });
      
      setTotalAmount(sum.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
    };

    calculateTotal();
  }, [upcomingInvoiceData]);

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md h-fit">
      <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D]">
        Upcoming invoice
      </div>
      <div className="px-4 pb-4 text-left font-poppins text-sm text-[#7E7E7E]">
        Invoice will be billed at: 2025-10-01
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
          {upcomingInvoiceData.map((item, index) => (
            <tr
              key={index}
              className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
            >
              <td className="px-3 py-[20px] !font-[400]">{item.number}</td>
              <td className="px-3 py-[20px] !font-[400]">{item.period}</td>
              <td className="px-3 py-[20px] !font-[400]">{item.description}</td>
              <td className="px-3 py-[20px] !font-[400]">{item.amount}</td>
            </tr>
          ))}
          <tr className="text-[#6D6D6D] text-[13px] font-bold">
            <td colSpan="3" className="px-3 py-[20px] !font-[600] text-right">
              Total:
            </td>
            <td className="px-3 py-[20px] !font-[600]">{totalAmount}</td> {/* Display the dynamic total */}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable;