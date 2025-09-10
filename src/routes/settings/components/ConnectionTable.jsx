import {
  DeleteIcon,
  EmailMinus,
  GraphIcon1,
  PencilIcon,
  PlusIcon,
} from "../../../components/Icons";

const ConnectionTable = ({
  title,
  data,
  showProvider,
  setShowAddAccountModal,
  onEditSignature,
  onEditUnsubscribe,
}) => {
  return (
    <div className="bg-white border border-[#C8C8C8] mb-6 rounded-[8px] shadow-md">
      <div className=" p-2 pt-4 px-4 text-[#6D6D6D] font-medium text-[20px] flex justify-between">
        <span>{title}</span>
        <button
          className="text-[16px] text-[#7E7E7E] border border-[#7E7E7E] px-3 flex items-center gap-2 cursor-pointer rounded-[6px]"
          onClick={() => setShowAddAccountModal(true)}
        >
          <PlusIcon className="fill-[#7E7E7E] w-3 h-3" /> Sender
        </button>
      </div>
      <div className="overflow-x-auto mb-6 p-2 ">
        <table className="w-full text-left text-sm ">
          <thead className="text-[#6D6D6D] text-[15px] text-center">
            <tr>
              <th className="p-2 font-normal">#</th>
              <th className="p-2 font-normal">ID</th>
              {showProvider && <th className="p-2 font-normal">Provider</th>}
              <th className="p-2 font-normal">Name</th>
              <th className="p-2 font-normal">Email Address</th>
              <th className="p-2 font-normal">Status</th>
              <th className="p-2 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="text-[#6D6D6D] text-[12px] border-b border-[#C8C8C8] text-center"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{row.id}</td>
                {showProvider && <td className="p-2">{row.provider}</td>}
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.email}</td>
                <td className="p-2">
                  <span className="bg-[#25C396] text-white text-[12px] px-5 py-1 rounded-[6px]">
                    Active
                  </span>
                </td>
                <td className="p-2 flex gap-2 text-[#6D6D6D] place-self-center">
                  <span
                    className="border border-[#12D7A8] p-1 rounded-full cursor-pointer"
                    onClick={onEditUnsubscribe}
                  >
                    <PencilIcon className=" w-4 h-4 fill-[#12D7A8]" />
                  </span>
                  <span
                    className="border border-[#0077B6] p-1 rounded-full cursor-pointer"
                    onClick={() => onEditSignature(row)}
                  >
                    <GraphIcon1 className=" w-4 h-4" />
                  </span>
                  <span className="border border-[#03045E] p-1 rounded-full cursor-pointer">
                    <EmailMinus className=" w-4 h-4" />
                  </span>
                  <span className="border border-[#D80039] p-1 rounded-full cursor-pointer">
                    <DeleteIcon className=" w-4 h-4 " />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConnectionTable;
