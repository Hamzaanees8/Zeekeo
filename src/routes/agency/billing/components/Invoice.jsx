import { useEffect, useState } from "react";
import { GetBillingInvoices } from "../../../../services/billings";
import Table from "../../components/Table";
import { useSubscription } from "../context/BillingContext";
const headers = ["Date", "Number", "Description", "Amount", "URL"];
const data = [
  {
    Date: "2025-07-31",
    Number: 2588,
    Description: "Service rendered",
    Amount: "$1125.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 3254,
    Description: "Service rendered",
    Amount: "$925.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 4855,
    Description: "Service rendered",
    Amount: "$1182.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
  {
    Date: "2025-07-31",
    Number: 1544,
    Description: "Service rendered",
    Amount: "$1025.25",
    URL: "View",
  },
];
const Invoice = () => {
  const { invoices, setInvoices } = useSubscription();
  useEffect(() => {
    const fetchInvoices = async () => {
      const data = await GetBillingInvoices();
      if (data) {
        const formatted = data.map(invoice => ({
          Date: new Date(invoice.created * 1000).toLocaleDateString(),
          Number: invoice.number,
          Description:
            invoice.lines?.data?.map(line => line.description).join(", ") ||
            "No description",
          Amount: `$${(invoice.total / 100).toFixed(2)}`,
          URL: invoice.hosted_invoice_url || "#",
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
      <Table
        headers={headers}
        data={invoices}
        rowsPerPage="all"
        type="invoices"
      />
    </div>
  );
};

export default Invoice;
