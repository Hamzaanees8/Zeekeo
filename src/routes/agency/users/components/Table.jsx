import { DotIcon, LoginIcon } from "../../../../components/Icons";
import { useNavigate } from "react-router";
const data = [
  {
    userEmail: "bradley.leitch@zopto.com",
    name: "Bradley Leitch",
    type: "Pro",
    linkedin: "email",
    accept: "32.8",
    reply: "4.56",
    invites: null,
    inMails: null,
    enabled: "Enabled",
  },
  {
    userEmail: "jjordan@zopto.com",
    name: "James Jordan",
    type: "Pro",
    linkedin: "email",
    accept: "32.8",
    reply: "4.56",
    invites: null,
    inMails: null,
    enabled: "Enabled",
  },
];

const Empty = () => {
  return <div className="w-[40px] h-[11px] bg-[#CCCCCC] rounded-[6px]"></div>;
};

const Table = ({ rowsPerPage, visibleColumns }) => {
  const navigate = useNavigate();
  //const loadingRef = useRef(false);
  //const [data, setData] = useState([]);
  //const [next, setNext] = useState(null);

  //   const fetchAgencies = useCallback(async (cursor = null) => {
  //     if (loadingRef.current) return;
  //     loadingRef.current = true;

  //     try {
  //       const response = await getAdminAgencies({ next: cursor });
  //       console.log("Fetched agencies:", response);

  //       setData(prev => {
  //         const newAgencies = response.agencies.filter(
  //           a => !prev.some(p => p.id === a.id),
  //         );
  //         return cursor ? [...prev, ...newAgencies] : newAgencies;
  //       });

  //       setNext(response.next || null);
  //     } catch (err) {
  //       console.error("Failed to fetch agencies:", err);
  //     } finally {
  //       loadingRef.current = false;
  //     }
  //   }, []);

  //   useEffect(() => {
  //     fetchAgencies();
  //   }, [fetchAgencies]);

  //   useEffect(() => {
  //     const handleScroll = () => {
  //       if (
  //         window.innerHeight + window.scrollY >=
  //           document.documentElement.scrollHeight - 200 &&
  //         next &&
  //         !loadingRef.current
  //       ) {
  //         console.log("Scrolling... fetching next agencies page...");
  //         fetchAgencies(next);
  //       }
  //     };

  //     window.addEventListener("scroll", handleScroll);
  //     return () => window.removeEventListener("scroll", handleScroll);
  //   }, [next, fetchAgencies]);

  const visibleData =
    rowsPerPage === "all" ? data : data.slice(0, rowsPerPage);
  return (
    <div className="w-full border border-[#7E7E7E]">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]"></th>

            {visibleColumns.includes("User Email") && (
              <th className="px-3 py-[20px] !font-[400]">User Email</th>
            )}
            {visibleColumns.includes("Name") && (
              <th className="px-3 py-[20px] !font-[400]">Name</th>
            )}
            {visibleColumns.includes("Type") && (
              <th className="px-3 py-[20px] !font-[400]">Type</th>
            )}
            {visibleColumns.includes("LinkedIn") && (
              <th className="px-3 py-[20px] !font-[400]">LinkedIn</th>
            )}
            {visibleColumns.includes("Accept %") && (
              <th className="px-3 py-[20px] !font-[400]">Accept %</th>
            )}
            {visibleColumns.includes("Reply %") && (
              <th className="px-3 py-[20px] !font-[400]">Reply %</th>
            )}
            {visibleColumns.includes("Invites") && (
              <th className="px-3 py-[20px] !font-[400]">Invites</th>
            )}
            {visibleColumns.includes("Inmail") && (
              <th className="px-3 py-[20px] !font-[400]">Inmail</th>
            )}
            {visibleColumns.includes("Enabled") && (
              <th className="px-3 py-[20px] !font-[400]">Enabled</th>
            )}
            {visibleColumns.includes("Action") && (
              <th className="px-3 py-[20px] !font-[400]">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {visibleData.map((item, index) => (
            <tr
              key={item.id}
              className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
            >
              <td className="px-3 py-[20px] !font-[400]">{index + 1}</td>
              {visibleColumns.includes("User Email") && (
                <td
                  className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer"
                  onClick={() =>
                    navigate(`/agency/users/edit/${item.userEmail}`)
                  }
                >
                  {item.userEmail || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Name") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.name || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Type") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.type ? `${item.type}` : <Empty />}
                </td>
              )}
              {visibleColumns.includes("LinkedIn") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.linkedin || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Accept %") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.accept ? `${item.accept}%` : <Empty />}
                </td>
              )}
              {visibleColumns.includes("Reply %") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.reply ? `${item.reply}%` : <Empty />}
                </td>
              )}
              {visibleColumns.includes("Invites") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.invites || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Inmail") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.inMails || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Enabled") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.enabled || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Action") && (
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center justify-start gap-x-2.5">
                    <div className=" cursor-pointer">
                      <LoginIcon />
                    </div>
                    <div className=" cursor-pointer">
                      <DotIcon />
                    </div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
