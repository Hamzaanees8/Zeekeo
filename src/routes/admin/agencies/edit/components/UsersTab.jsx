import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCheck,
  AdminMinus,
  LoginIcon,
} from "../../../../../components/Icons";
import ToggleSwitch from "../../../components/ToggleSwitch";
import { getAdminUsers } from "../../../../../services/admin";

const UsersTab = () => {
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);

  const fetchUsers = useCallback(async (cursor = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await getAdminUsers({ next: cursor });
      console.log("Fetched users:", response);

      setData(prev => {
        const newUsers = response.users.filter(
          a => !prev.some(p => p.id === a.id),
        );
        return cursor ? [...prev, ...newUsers] : newUsers;
      });

      setNext(response.next || null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next users page...");
        fetchUsers(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchUsers]);

  const handleInboxToggle = (index, newValue) => {
    const updated = [...data];
    updated[index].Inbox = newValue;
    setData(updated);
  };
  const handleCronToggle = (index, newValue) => {
    const updated = [...data];
    updated[index].Cron.status = newValue;
    setData(updated);
  };
  return (
    <div className="w-full border border-[#7E7E7E] rounded-[6px] overflow-hidden">
      <table className="w-full !overflow-x-auto">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]">#</th>
            <th className="px-3 py-[20px] !font-[400]">Email</th>
            <th className="px-3 py-[20px] !font-[400]">Name</th>
            <th className="px-3 py-[20px] !font-[400]">Type</th>
            <th className="px-3 py-[20px] !font-[400]">Paid Until</th>
            <th className="px-3 py-[20px] !font-[400]">LinkedIn</th>
            <th className="px-3 py-[20px] !font-[400]">Twitter</th>
            <th className="px-3 py-[20px] !font-[400]">Enable</th>
            <th className="px-3 py-[20px] !font-[400]">Active</th>
            <th className="px-3 py-[20px] !font-[400]">Cron</th>
            <th className="px-3 py-[20px] !font-[400]">Inbox</th>
            <th className="px-3 py-[20px] !font-[400]">View</th>
            <th className="px-3 py-[20px] !font-[400]">Action</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {data?.map((item, index) => (
            <tr
              key={item.id}
              className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
            >
              <td className="px-3 py-[20px] !font-[400]">{index + 1}</td>
              <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer !max-w-[120px] break-words">
                {item.first_name} {item.last_name}
              </td>
              <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer !max-w-[150px] break-words">
                {item.email || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-center">
                  {" "}
                  {item.Type || "-"}
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                {item.paid_until || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400] break-words !max-w-[150px]">
                {" "}
                {item.accounts?.linkedin?.data?.email || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400] break-words">
                <div className=" flex items-center justify-center !max-w-[100px]">
                  {item.twitter || "-"}
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-center">
                  {" "}
                  {item.enabled === 1 ? <AdminCheck /> : <AdminMinus />}
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-center">
                  {" "}
                  {item.active ? <AdminCheck /> : <AdminMinus />}
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center gap-x-2.5 justify-center">
                  <ToggleSwitch
                    value={item.Cron?.status}
                    onColor="#7E7E7E"
                    offColor="#7E7E7E"
                    onChange={newValue => handleCronToggle(index, newValue)}
                  />
                  <p>{item.Cron}m</p>
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-center">
                  <ToggleSwitch
                    value={item.inbox}
                    onColor="#12D7A8"
                    offColor="#DE4B32"
                    onChange={newValue => handleInboxToggle(index, newValue)}
                  />
                </div>
              </td>
              <td className="px-3 py-[20px] !font-[400] text-center">
                {item.view || "-"}
              </td>
              <td className="px-3 py-[20px] !font-[400]">
                <div className="flex items-center justify-center cursor-pointer">
                  <LoginIcon />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTab;
