import { useEffect, useState } from "react";
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
  const [upcomingInvoiceData, setUpcomingInvoiceData] = useState([]);
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
        generateUpcomingInvoiceData(data);
        console.log(data, "data invoices");
      }
    };

    fetchInvoices();
  }, []);
  const generateUpcomingInvoiceData = invoices => {
    if (!invoices || invoices.length === 0) return;
    const sortedInvoices = [...invoices].sort((a, b) => b.created - a.created);
    const latestInvoice = sortedInvoices[0];
    const currentDate = new Date();
    let nextPeriodStart, nextPeriodEnd;
    const latestPeriodEnd = new Date(latestInvoice.period_end * 1000);

    if (latestPeriodEnd > currentDate) {
      nextPeriodStart = latestPeriodEnd;
    } else {
      nextPeriodStart = currentDate;
    }

    nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    const formatDate = date => date.toISOString().split("T")[0];
    const period = `${formatDate(nextPeriodStart)} - ${formatDate(
      nextPeriodEnd,
    )}`;

    const lineItems = latestInvoice.lines?.data || [];

    const mainSubscriptionItem = lineItems.find(
      item =>
        item.amount > 0 &&
        !item.proration &&
        item.description &&
        !item.description.includes("Unused time") &&
        !item.description.includes("Remaining time"),
    );

    const upcomingItems = [];

    if (mainSubscriptionItem) {
      const description = mainSubscriptionItem.description;

      const unitAmountDecimal =
        mainSubscriptionItem.pricing?.price_details?.unit_amount_decimal;
      const unitAmount = unitAmountDecimal
        ? parseFloat(unitAmountDecimal) / 100
        : Math.abs(mainSubscriptionItem.amount) / 100;

      const quantity = mainSubscriptionItem.quantity || 1;
      const amount = unitAmount * quantity;

      upcomingItems.push({
        period: period,
        description: description,
        amount: `$${amount.toFixed(2)}`,
        number: "1",
        url: "#",
      });
    } else {
      const fallbackItem = lineItems.find(item => item.amount > 0);

      if (fallbackItem) {
        upcomingItems.push({
          period: period,
          description: fallbackItem.description,
          amount: `$${(Math.abs(fallbackItem.amount) / 100).toFixed(2)}`,
          number: "1",
          url: "#",
        });
      } else {
        upcomingItems.push({
          period: period,
          description: "Subscription renewal",
          amount: `$${(latestInvoice.total / 100).toFixed(2)}`,
          number: "1",
          url: "#",
        });
      }
    }

    setUpcomingInvoiceData(upcomingItems);
  };
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
