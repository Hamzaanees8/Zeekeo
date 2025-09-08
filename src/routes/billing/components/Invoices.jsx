import { useEffect } from "react";
import { useSubscription } from "../context/BillingContext";
import { GetBillingInvoices } from "../../../services/billings";
import Table from "./Table";

const Invoices = () => {
  const { setInvoices } = useSubscription();
  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await GetBillingInvoices();
      if (data) {
        const formatted = data.map(invoice => ({
          date: new Date(invoice.created * 1000).toLocaleDateString(),
          number: invoice.number,
          description:
            invoice.lines?.data?.map(line => line.description).join(", ") ||
            "No description",
          amount: `$${(invoice.total / 100).toFixed(2)}`,
          url: invoice.hosted_invoice_url || "#",
        }));
        setInvoices(formatted);
      }
    };

    fetchInvoices();
  }, []);
  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-[28px] text-[#6D6D6D] font-medium font-urbanist">
        Invoices
      </p>
      <Table />
    </div>
  );
};

export default Invoices;
