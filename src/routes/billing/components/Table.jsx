import { ViewCircle } from "../../../components/Icons";
import { useSubscription } from "../context/BillingContext";

const Table = ({ setShowInvoice, setSelectedInvoiceUrl }) => {
  const { invoices } = useSubscription();
  // useEffect(() => {
  //   const fetchInvoices = async () => {
  //     const data = await GetBillingInvoices();
  //     if (data) {
  //       const formatted = data.map(invoice => ({
  //         date: new Date(invoice.created * 1000).toLocaleDateString(), // Convert UNIX timestamp to readable date
  //         number: invoice.number,
  //         description:
  //           invoice.lines?.data?.map(line => line.description).join(", ") ||
  //           "No description",
  //         amount: `$${(invoice.total / 100).toFixed(2)}`,
  //         url: invoice.hosted_invoice_url || "#",
  //       }));
  //       setInvoices(formatted);
  //     }
  //   };

  //   fetchInvoices();
  // }, []);

  return (
    <div className="w-full border border-[#7E7E7E]">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins ">
          <tr className="text-xs text-[#7E7E7E]">
            <th className="px-3 pt-[10px] !font-[400]">Date</th>
            <th className="px-3 pt-[10px] !font-[400]">Number</th>
            <th className="px-3 pt-[10px] !font-[400]">Description</th>
            <th className="px-3 pt-[10px] !font-[400]">Amount</th>
            <th className="px-3 pt-[10px] !font-[400]">URL</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {invoices.map((item, index) => (
            <tr key={index} className="text-[#6D6D6D] text-sm">
              <td className="px-3 py-[8px] !font-[400]">{item.date}</td>
              <td className="px-3 py-[8px] !font-[400]">{item.number}</td>
              <td className="px-3 py-[8px] !font-[400]">{item.description}</td>
              <td className="px-3 py-[8px] !font-[400]">{item.amount}</td>
              <td className="px-3 py-[8px] !font-[400]">
                <button
                  onClick={() => {
                    window.open(item.url, "_blank", "noopener,noreferrer");
                  }}
                  className="h-[30px] w-[30px]"
                >
                  <ViewCircle />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
