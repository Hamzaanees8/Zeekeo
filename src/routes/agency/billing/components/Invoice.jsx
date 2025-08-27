import Table from "../../components/Table";
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
  return (
    <div className="flex flex-col gap-y-3">
      <p className="text-[28px] text-[#6D6D6D] font-medium font-urbanist">
        Invoices
      </p>
      <Table headers={headers} data={data} rowsPerPage="all" type="invoices" />
    </div>
  );
};

export default Invoice;
