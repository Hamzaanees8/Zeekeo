import { useCallback, useEffect, useRef, useState } from "react";
import { DotIcon, LoginIcon } from "../../../../components/Icons";
import { useNavigate } from "react-router";
import {
  getAgencyUsers,
  loginAsAgencyUser,
} from "../../../../services/agency";
import { useAuthStore } from "../../../stores/useAuthStore";
import toast from "react-hot-toast";
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
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);

  // Fetch users
  const fetchAgencyUsers = useCallback(async (cursor = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await getAgencyUsers({ next: cursor });
      console.log("Fetched agency users:", response);

      setData(prev => {
        const newUsers = response.users?.filter(
          u => !prev.some(p => p.email === u.email),
        );
        return cursor ? [...prev, ...newUsers] : newUsers;
      });

      setNext(response.next || null);
    } catch (err) {
      console.error("Failed to fetch agency users:", err);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAgencyUsers();
  }, [fetchAgencyUsers]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next users page...");
        fetchAgencyUsers(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchAgencyUsers]);

  const visibleData =
    rowsPerPage === "all" ? data : data.slice(0, rowsPerPage);

  const handleLoginAs = async email => {
    try {
      const agencyToken = useAuthStore.getState().sessionToken; // Agency’s session token
      const res = await loginAsAgencyUser(email, agencyToken); // Call API

      if (res?.sessionToken) {
        useAuthStore.getState().setLoginAsToken(res.sessionToken); // Store temporary user token
        toast.success(`Logged in as ${email}`);
        navigate("/dashboard"); // Redirect to user dashboard
      } else {
        toast.error("Failed to login as user");
        console.error("Login as user error:", res);
      }
    } catch (err) {
      console.error("Login as user failed:", err);
      toast.error("Something went wrong");
    }
  };
  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md">
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
                  onClick={() => navigate(`/agency/users/edit/${item.email}`)}
                >
                  {item.userEmail || <Empty />}
                </td>
              )}
              {visibleColumns.includes("Name") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.first_name || item.last_name ? (
                    `${item.first_name || ""} ${item.last_name || ""}`.trim()
                  ) : (
                    <Empty />
                  )}
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
