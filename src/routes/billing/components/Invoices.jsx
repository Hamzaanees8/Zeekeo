import { useEffect, useState } from "react";
import { useSubscription } from "../context/BillingContext";
import { GetBillingInvoices } from "../../../services/billings";
import Table from "./Table";
import InvoiceTable from "./InvoiceTable";
const Invoices = () => {
  const { setInvoices } = useSubscription();
  const [upcomingInvoiceData, setUpcomingInvoiceData] = useState([]);
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await GetBillingInvoices();
        if (data) {
          const formattedInvoices = data.invoices.map(invoice => ({
            date: new Date(invoice.created * 1000).toLocaleDateString(),
            number: invoice.number,
            description:
              invoice.lines?.data?.map(line => line.description).join(", ") ||
              "No description",
            amount: `$${(invoice.total / 100).toFixed(2)}`,
            url: invoice.hosted_invoice_url || "#",
          }));
          setInvoices(formattedInvoices);

          if (data.upcomingInvoice) {
            const up = data.upcomingInvoice;
            const lineDescriptions =
              up.lines?.data?.map(line => line.description).join(", ") ||
              "No description";

            setUpcomingInvoiceData({
              customer: up.customer_name,
              email: up.customer_email,
              periodStart: new Date(
                up.period_start * 1000,
              ).toLocaleDateString(),
              periodEnd: new Date(up.period_end * 1000).toLocaleDateString(),
              total: `$${(up.total / 100).toFixed(2)}`,
              status: up.status,
              description: lineDescriptions,
              url: up.hosted_invoice_url || "#",
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      }
    };

    fetchInvoices();
  }, [setInvoices]);
  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-[28px] text-[#6D6D6D] font-medium font-urbanist">
        Invoices
      </p>
      <div className="flex gap-2">
        <Table />
        <InvoiceTable upcomingInvoiceData={upcomingInvoiceData} />
      </div>
    </div>
  );
};

export default Invoices;
