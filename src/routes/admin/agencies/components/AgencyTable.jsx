import { useCallback, useEffect, useRef, useState } from "react";
import {
  CreditCard,
  LoginIcon,
  TwoPerson,
} from "../../../../components/Icons";
import { useNavigate } from "react-router";
import { getAdminAgencies, loginAsUser } from "../../../../services/admin";
import { useAuthStore } from "../../../stores/useAuthStore";
import toast from "react-hot-toast";

const AgencyTable = ({ rowsPerPage, visibleColumns, searchTerm = "" }) => {
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);
  const fetchAgencies = useCallback(async (cursor = null) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await getAdminAgencies({ next: cursor });
      console.log("Fetched agencies:", response);

      setData(prev => {
        const newAgencies = response.agencies.filter(
          a => !prev.some(p => p.id === a.id),
        );
        return cursor ? [...prev, ...newAgencies] : newAgencies;
      });

      setNext(response.next || null);
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // const handleLoginAs = async email => {
  //   try {
  //     const adminToken = useAuthStore.getState().sessionToken;
  //     const res = await loginAsUser(email, adminToken);

  //     if (res?.sessionToken) {
  //       useAuthStore.getState().setLoginAsToken(res.sessionToken);
  //       toast.success(`Logged in as ${email}`);
  //       navigate("/agency/dashboard");
  //     } else {
  //       toast.error("Failed to login as agency");
  //       console.error("Login as user error:", res);
  //     }
  //   } catch (err) {
  //     console.error("Login as user failed:", err);
  //     toast.error("Something went wrong");
  //   }
  // };
  const handleLoginAs = async username => {
    try {
      const res = await loginAsUser(username, "agency");

      if (res?.sessionToken) {
        useAuthStore.getState().setLoginAsToken(res.sessionToken);
        toast.success(`Logged in as ${username}`);
        navigate("/agency/dashboard");
      } else {
        toast.error("Failed to login as agency");
        console.error("Login as agency error:", res);
      }
    } catch (err) {
      console.error("Login as agency failed:", err);
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 200 &&
        next &&
        !loadingRef.current
      ) {
        console.log("Scrolling... fetching next agencies page...");
        fetchAgencies(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchAgencies]);

  // Apply client-side search/filter over loaded `data`.
  const normalizedSearch = (searchTerm || "").trim().toLowerCase();

  const filtered = normalizedSearch
    ? data.filter(item => {
        // Check common fields: id/username, email, type, WhiteLabel, BilledUser, ZoptoUser
        const checks = [];
        if (item.username) checks.push(String(item.username).toLowerCase());
        if (item.id) checks.push(String(item.id).toLowerCase());
        if (item.email) checks.push(String(item.email).toLowerCase());
        if (item.type) checks.push(String(item.type).toLowerCase());
        if (item.WhiteLabel) checks.push(String(item.WhiteLabel).toLowerCase());
        if (item.BilledUser) checks.push(String(item.BilledUser).toLowerCase());
        if (item.ZoptoUser) checks.push(String(item.ZoptoUser).toLowerCase());

        return checks.some(field => field.includes(normalizedSearch));
      })
    : data;

  const visibleData = rowsPerPage === "all" ? filtered : filtered.slice(0, rowsPerPage);
  return (
    <div className="w-full border border-[#7E7E7E] rounded-[6px] overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            {visibleColumns.includes("#") && (
              <th className="px-3 py-[20px] !font-[400]">#</th>
            )}
            {visibleColumns.includes("ID") && (
              <th className="px-3 py-[20px] !font-[400]">ID</th>
            )}
            {visibleColumns.includes("Email") && (
              <th className="px-3 py-[20px] !font-[400]">Email</th>
            )}
            {visibleColumns.includes("Type") && (
              <th className="px-3 py-[20px] !font-[400]">Type</th>
            )}
            {visibleColumns.includes("White Label") && (
              <th className="px-3 py-[20px] !font-[400]">White Label</th>
            )}
            {visibleColumns.includes("Paid Until") && (
              <th className="px-3 py-[20px] !font-[400]">Paid Until</th>
            )}
            {visibleColumns.includes("Billed User") && (
              <th className="px-3 py-[20px] !font-[400]">Billed User</th>
            )}
            {visibleColumns.includes("Zopto User") && (
              <th className="px-3 py-[20px] !font-[400]">Zopto User</th>
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
              {visibleColumns.includes("#") && (
                <td className="px-3 py-[20px] !font-[400]">{index + 1}</td>
              )}
              {visibleColumns.includes("ID") && (
                <td
                  className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/agencies/edit/${item.username}`)
                  }
                >
                  {item.username || "-"}
                </td>
              )}
              {visibleColumns.includes("Email") && (
                <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer">
                  {item.email || "-"}
                </td>
              )}
              {visibleColumns.includes("Type") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.type ? `#${item.type}` : "-"}
                </td>
              )}
              {visibleColumns.includes("White Label") && (
                <td className="px-3 py-[20px] !font-[400]">
                  {item.WhiteLabel || "-"}
                </td>
              )}
              {visibleColumns.includes("Paid Until") && (
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center gap-x-[20px]">
                    {item.PaidUntil ? (
                      <p
                        className={
                          new Date(item.PaidUntil) < new Date()
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {item.PaidUntil}
                      </p>
                    ) : (
                      <p>-</p>
                    )}
                    {item.PaidUntil && <CreditCard />}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Billed User") && (
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center gap-x-3">
                    {item.BilledUser ? <p>{item.BilledUser}</p> : <p>-</p>}
                    {item.BilledUser && <TwoPerson />}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Zopto User") && (
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center gap-x-3">
                    {item.ZoptoUser && <TwoPerson />}
                    {item.ZoptoUser ? <p>{item.ZoptoUser}</p> : <p>-</p>}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Action") && (
                <td
                  onClick={() => handleLoginAs(item.username)}
                  title="Login as this user"
                  className="px-3 py-[20px] !font-[400]"
                >
                  <div className="flex items-center justify-start cursor-pointer">
                    <LoginIcon />
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

export default AgencyTable;
