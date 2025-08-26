import { useState } from "react";
import {
  AdminAddNoteIcon,
  AdminViewNoteDimIcon,
  AdminViewNoteIcon,
} from "../../../../components/Icons";
import AddNoteModal from "./AddNoteModal";
import ViewNoteModal from "./ViewNoteModal";

const dummydata = [
  {
    id: 1,
    Date: "2025-07-31 14:10",
    Email: "robert.keki@zopto.com",
    AccountManager: "",
    Reason: "Only need it for 3 months a year",
    LastPayment: 51225,
    Status: "Canceled",
    Notes: [
      {
        email: "robert.keki@zopto.com",
        note: "Customer requested cancellation as their project is seasonal.",
        createdAt: "2025-07-31 14:10",
      },
      {
        email: "support@zopto.com",
        note: "Followed up to confirm cancellation and offer a seasonal plan.",
        createdAt: "2025-07-31 14:10",
      },
    ],
    Months: 2,
  },
  {
    id: 2,
    Date: "2025-07-31 14:10",
    Email: "info@yolo-digital.com",
    AccountManager: "",
    Reason: "ES - Canceled on customer's request",
    LastPayment: 11400,
    Status: "Paused",
    Notes: [],
    Months: 0,
  },
];
const Table = () => {
  const [data, setData] = useState(dummydata);
  const [activeRowId, setActiveRowId] = useState(null);
  const [modalType, setModalType] = useState(null);
  return (
    <div className="w-full border border-[#7E7E7E]">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]">Date</th>
            <th className="px-3 py-[20px] !font-[400]">Email</th>
            <th className="px-3 py-[20px] !font-[400]">Acct. Mgr.</th>
            <th className="px-3 py-[20px] !font-[400]">Reason</th>
            <th className="px-3 py-[20px] !font-[400]">Last Payment</th>
            <th className="px-3 py-[20px] !font-[400]">Status</th>
            <th className="px-3 py-[20px] !font-[400]">Notes</th>
            <th className="px-3 py-[20px] !font-[400]">Months</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {data.map(item => (
            <tr
              key={item.id}
              className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
            >
              <td className="px-3 py-[20px] !font-[400]">
                {item.Date || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer">
                {item.Email || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.AccountManager || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.Reason || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.LastPayment
                  ? `$${(item.LastPayment / 100).toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.Status || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-between">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveRowId(item.id);
                      setModalType("add");
                    }}
                  >
                    <AdminAddNoteIcon />
                  </div>
                  {item.Notes && item.Notes.length > 0 ? (
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setActiveRowId(item.id);
                        setModalType("view");
                      }}
                    >
                      <AdminViewNoteIcon />
                    </div>
                  ) : (
                    <div className="cursor-not-allowed">
                      <AdminViewNoteDimIcon />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.Months || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalType === "add" && (
        <AddNoteModal
          onClose={() => setModalType(null)}
          onSave={newNote => {
            const now = new Date();
            const formattedDateTime = now
              .toISOString()
              .slice(0, 16)
              .replace("T", " ");

            const noteWithTimestamp = {
              ...newNote,
              createdAt: formattedDateTime,
            };

            setData(prev =>
              prev.map(c =>
                c.id === activeRowId
                  ? { ...c, Notes: [...c.Notes, noteWithTimestamp] }
                  : c,
              ),
            );
            setModalType(null);
          }}
        />
      )}
      {modalType === "view" && (
        <ViewNoteModal
          onClose={() => setModalType(null)}
          onSave={() => setModalType(null)}
          data={data.find(c => c.id === activeRowId)}
        />
      )}
    </div>
  );
};

export default Table;
