import { useEffect, useState } from "react";
import { GetBillingInvoices } from "../../../../services/billings";
import Table from "../../components/Table";
import { useSubscription } from "../context/BillingContext";
import InvoiceTable from "../../../billing/components/InvoiceTable";
const headers = ["Date", "Number", "Description", "Amount", "URL"];

const Invoice = () => {
  const { invoices, setInvoices } = useSubscription();
  const [upcomingInvoiceData, setUpcomingInvoiceData] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await GetBillingInvoices();
      if (data) {
        const formatted = data.invoices.map(invoice => ({
          Date: new Date(invoice.created * 1000).toLocaleDateString(),
          Number: invoice.number,
          Description:
            invoice.lines?.data?.map(line => line.description).join(", ") ||
            "No description",
          Amount: `$${(invoice.total / 100).toFixed(2)}`,
          URL: invoice.hosted_invoice_url || "#",
        }));
        setInvoices(formatted);
        if (data.upcomingInvoice) {
          const up = data.upcomingInvoice;
          console.log("upcoming invoice...", up);
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
            total: up.total,
            formattedTotal: `$${(up.total / 100).toFixed(2)}`,
            status: up.status,
            description: lineDescriptions,
            url: up.hosted_invoice_url || "#",
            billingDate: new Date(up.period_end * 1000).toLocaleDateString(),
          });
        }

      }
    };

    fetchInvoices();
  }, []);
  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-[28px] text-[#6D6D6D] font-medium font-urbanist">
        Invoices
      </p>
      <div className="flex gap-2">
        <Table
          headers={headers}
          data={invoices}
          rowsPerPage="all"
          type="invoices"
        />
        <InvoiceTable upcomingInvoiceData={upcomingInvoiceData} />
      </div>
    </div>
  );
};

export default Invoice;
