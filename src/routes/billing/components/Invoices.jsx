import { useEffect } from "react";
import { useSubscription } from "../context/BillingContext";
import {
  GetBillingInvoices,
  UpdateSubscriptionPlan,
} from "../../../services/billings";
import Table from "./Table";
import InvoiceTable from "./InvoiceTable";
const upcomingInvoiceData = [
  {
    period: "2025-09-10 - 2025-10-01",
    description:
      "Remaining time on 57 x Zopto Plan (with 35.0% off) after 10 Sep 2025",
    amount: "$1312.12",
    number: "2",
    url: "#",
  },
  {
    period: "2025-09-09 - 2025-10-01",
    description:
      "Remaining time on 56 x Zoto Plan (with 35.0% off) after 09 Sep 2025",
    amount: "$1353.45",
    number: "4",
    url: "#",
  },
  {
    period: "2025-10-01 - 2025-11-01",
    description: "57 x Zopto Plan (Tier 1 at $50.00 / month)",
    amount: "$2850",
    number: "5",
    url: "#",
  },
];
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
        console.log(data, "data invoices");
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
        <Table />
        <InvoiceTable upcomingInvoiceData={upcomingInvoiceData} />
      </div>
    </div>
  );
};

export default Invoices;
