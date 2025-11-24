import { useEffect, useState } from "react";
import { useSubscription } from "../context/BillingContext";
import { GetBillingInvoices } from "../../../services/billings";
import Table from "./Table";
import InvoiceTable from "./InvoiceTable";
const Invoices = () => {
  const { setInvoices } = useSubscription();
  const [upcomingInvoiceData, setUpcomingInvoiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
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

          // Check if upcomingInvoice exists and has line items
          if (
            data.upcomingInvoice &&
            data.upcomingInvoice.lines?.data?.length > 0
          ) {
            const up = data.upcomingInvoice;
            const firstLine = up.lines.data[0];

            // Use the period from the invoice line item
            const periodStart = firstLine.period?.start;
            const periodEnd = firstLine.period?.end;

            if (periodStart && periodEnd) {
              const lineDescriptions =
                up.lines?.data?.map(line => line.description).join(", ") ||
                "No description";

              setUpcomingInvoiceData({
                customer: up.customer_name,
                email: up.customer_email,
                periodStart: new Date(periodStart * 1000).toLocaleDateString(),
                periodEnd: new Date(periodEnd * 1000).toLocaleDateString(),
                total: up.total,
                formattedTotal: `$${(up.total / 100).toFixed(2)}`,
                status: up.status,
                description: lineDescriptions,
                url: up.hosted_invoice_url || "#",
                billingDate: new Date(periodStart * 1000).toLocaleDateString(),
              });
            } else {
              setUpcomingInvoiceData(null);
            }
          } else {
            // Explicitly set to null if no valid upcoming invoice
            setUpcomingInvoiceData(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [setInvoices]);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-4 w-full">
        <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md bg-white">
          <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D]">
            Upcoming Invoice
          </div>
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-[#0387FF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
        <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md bg-white">
          <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D]">
            Invoices
          </div>
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-[#0387FF]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="w-full">
        <InvoiceTable upcomingInvoiceData={upcomingInvoiceData} />
      </div>
      <div className="w-full">
        <div className="border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md">
          <div className="p-4 text-left font-poppins text-lg font-bold text-[#6D6D6D] bg-white">
            Invoices
          </div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Invoices;
