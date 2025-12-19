import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCheck,
  AdminMinus,
  CreditCard,
  LoginIcon,
  TwoPerson,
} from "../../../../components/Icons";
import { useNavigate } from "react-router";
import { getAdminAgencies, loginAsUser } from "../../../../services/admin";
import { useAuthStore } from "../../../stores/useAuthStore";
import toast from "react-hot-toast";
import usePreviousStore from "../../../stores/usePreviousStore";
import useAgencyStore from "../../../stores/useAgencyStore";

const AgencyTable = ({
  rowsPerPage,
  visibleColumns,
  searchTerm = "",
  onSearchingChange,
}) => {
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);
  const nextRef = useRef(null);
  const [allAgenciesLoaded, setAllAgenciesLoaded] = useState(false);
  const loadingAllStartedRef = useRef(false);
  const [isSearching, setIsSearching] = useState(false);

  const isImpersonatingRef = useRef(false);

  // Keep nextRef in sync with next state
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const fetchAgencies = useCallback(async (cursor = null) => {
    if (loadingRef.current || isImpersonatingRef.current) return;
    loadingRef.current = true;

    try {
      const response = await getAdminAgencies({ next: cursor });
      console.log("Fetched agencies:", response);

      setData(prev => {
        const newAgencies = response.agencies.filter(
          a => !prev.some(p => p.username === a.username),
        );
        return cursor ? [...prev, ...newAgencies] : newAgencies;
      });

      const nextCursor = response.next || null;
      setNext(nextCursor);
      nextRef.current = nextCursor;

      // Check if all agencies are loaded (no more pages)
      if (!nextCursor) {
        setAllAgenciesLoaded(true);
      }
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const loadAllAgencies = useCallback(async () => {
    if (
      allAgenciesLoaded ||
      loadingAllStartedRef.current ||
      isImpersonatingRef.current
    )
      return;

    // Wait for initial load to complete if still loading
    while (loadingRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Use ref to get the current value of next (avoids stale closure)
    let cursor = nextRef.current;

    // If no more pages after initial load, mark as complete and return
    if (!cursor) {
      setAllAgenciesLoaded(true);
      return;
    }

    // Only set the flag after we confirm we have pages to load
    loadingAllStartedRef.current = true;
    setIsSearching(true);
    onSearchingChange?.(true);

    while (cursor) {
      if (isImpersonatingRef.current) break;

      if (loadingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      loadingRef.current = true;
      try {
        const response = await getAdminAgencies({ next: cursor });

        setData(prev => {
          const newAgencies = response.agencies.filter(
            a => !prev.some(p => p.username === a.username),
          );
          return [...prev, ...newAgencies];
        });

        cursor = response.next || null;
        setNext(cursor);
        nextRef.current = cursor;

        if (!cursor) {
          setAllAgenciesLoaded(true);
        }
      } catch (err) {
        console.error("Failed to fetch agencies:", err);
        break;
      } finally {
        loadingRef.current = false;
      }
    }

    setIsSearching(false);
    onSearchingChange?.(false);
  }, [allAgenciesLoaded, onSearchingChange]);

  // Trigger loading all agencies when user starts searching
  useEffect(() => {
    if (
      searchTerm.trim() &&
      !allAgenciesLoaded &&
      !loadingAllStartedRef.current
    ) {
      loadAllAgencies();
    }
  }, [searchTerm, allAgenciesLoaded, loadAllAgencies]);

  const handleLoginAs = async username => {
    isImpersonatingRef.current = true;
    try {
      const res = await loginAsUser(username, "agency");

      if (res?.sessionToken) {
        // Get current admin user before impersonating
        const currentUser = useAuthStore.getState().currentUser;
        useAgencyStore.getState().setAgencyEmail(username);
        // Use chain-based store instead of setLoginAsToken
        useAuthStore.getState().enterImpersonation(
          res.sessionToken,
          res.refreshToken || null, // Add if available
          currentUser, // Original admin user
          "agency",
        );

        toast.success(`Logged in as ${username}`);
        navigate("/agency/dashboard");
      } else {
        isImpersonatingRef.current = false;
        toast.error("Failed to login as agency");
        console.error("Login as agency error:", res);
      }
    } catch (err) {
      isImpersonatingRef.current = false;
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
        !loadingRef.current &&
        rowsPerPage === "all" &&
        !allAgenciesLoaded
      ) {
        console.log("Scrolling... fetching next agencies page...");
        fetchAgencies(next);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [next, fetchAgencies, rowsPerPage, allAgenciesLoaded]);

  // Apply client-side search/filter over loaded `data`.
  const normalizedSearch = (searchTerm || "").trim().toLowerCase();

  const filtered = normalizedSearch
    ? data.filter(item => {
        const fullName = `${item.first_name || ""} ${item.last_name || ""}`
          .trim()
          .toLowerCase();
        const username = item.username?.toLowerCase() || "";
        const email = item.email?.toLowerCase() || "";
        const contactEmail = item.contact_email?.toLowerCase() || "";
        const company = item.company?.toLowerCase() || "";
        const whitelabelDomain = item.whitelabel?.domain?.toLowerCase() || "";

        return (
          username.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          contactEmail.includes(normalizedSearch) ||
          fullName.includes(normalizedSearch) ||
          company.includes(normalizedSearch) ||
          whitelabelDomain.includes(normalizedSearch)
        );
      })
    : data;

  const visibleData =
    rowsPerPage === "all" ? filtered : filtered.slice(0, rowsPerPage);
  return (
    <div className="max-w-full border border-[#7E7E7E] rounded-[6px] overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            {visibleColumns.includes("#") && (
              <th className="px-1.5 py-[20px] !font-[400]">#</th>
            )}
            {visibleColumns.includes("ID") && (
              <th className="px-1.5 py-[20px] !font-[400]">ID</th>
            )}
            {visibleColumns.includes("Email") && (
              <th className="px-1.5 py-[20px] !font-[400]">Email</th>
            )}
            {visibleColumns.includes("Type") && (
              <th className="px-1.5 py-[20px] !font-[400]">Type</th>
            )}
            {visibleColumns.includes("White Label") && (
              <th className="px-1.5 py-[20px] !font-[400]">White Label</th>
            )}
            {visibleColumns.includes("Paid Until") && (
              <th className="px-1.5 py-[20px] !font-[400]">Paid Until</th>
            )}
            {visibleColumns.includes("Billed User") && (
              <th className="px-1.5 py-[20px] !font-[400]">Billed User</th>
            )}
            {visibleColumns.includes("Enabled") && (
              <th className="px-1.5 py-[20px] !font-[400]">Enabled</th>
            )}
            {/* {visibleColumns.includes("Phone Number") && (
              <th className="px-1.5 py-[20px] !font-[400]">Phone Number</th>
            )} */}
            {/* {visibleColumns.includes("Zopto User") && (
              <th className="px-1.5 py-[20px] !font-[400]">Zopto User</th>
            )}
            {visibleColumns.includes("Created At") && (
              <th className="px-1.5 py-[20px] !font-[400]">Created At</th>
            )}
            {visibleColumns.includes("Updated At") && (
              <th className="px-1.5 py-[20px] !font-[400]">Updated At</th>
            )} */}
            {visibleColumns.includes("Action") && (
              <th className="px-1.5 py-[20px] !font-[400]">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {visibleData.map((item, index) => (
            <tr
              key={item.username}
              className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
            >
              {visibleColumns.includes("#") && (
                <td className="px-1.5 py-[20px] !font-[400]">{index + 1}</td>
              )}
              {visibleColumns.includes("ID") && (
                <td
                  className="px-1.5 py-[20px] !font-[400] text-[#0387FF] cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/agencies/edit/${item.username}`)
                  }
                >
                  {item.username || "-"}
                </td>
              )}
              {visibleColumns.includes("Email") && (
                <td className="px-1.5 py-[20px] !font-[400] text-[#0387FF] cursor-pointer">
                  {item.contact_email || item.email || "-"}
                </td>
              )}
              {visibleColumns.includes("Type") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  {item.type ? `#${item.type}` : "-"}
                </td>
              )}
              {visibleColumns.includes("White Label") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  {item.whitelabel?.domain ? (
                    <a
                      href={`https://${item.whitelabel.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0387FF] hover:underline"
                    >
                      {item.whitelabel.domain}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              )}
              {visibleColumns.includes("Paid Until") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  <div className="flex items-center justify-center gap-x-1">
                    {item.paid_until ? (
                      <p
                        className={
                          new Date(item.paid_until) < new Date()
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {item.paid_until}
                      </p>
                    ) : (
                      <p>-</p>
                    )}
                    {item.paid_until && <CreditCard />}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Billed User") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  <div className="flex items-center justify-center gap-x-1">
                    {item.seats?.billed ? (
                      <p className="font-[500]">{item.seats.billed}</p>
                    ) : (
                      <p>-</p>
                    )}
                    {item.seats?.billed && <TwoPerson />}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Enabled") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  <div className="flex items-center justify-center">
                    {item.enabled === 1 || item.enabled === true ? (
                      <AdminCheck />
                    ) : (
                      <AdminMinus />
                    )}
                  </div>
                </td>
              )}
              {/* {visibleColumns.includes("Phone Number") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  {item.phone_number || "-"}
                </td>
              )} */}
              {/* {visibleColumns.includes("Zopto User") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  <div className="flex items-center gap-x-3">
                    {item.ZoptoUser && <TwoPerson />}
                    {item.ZoptoUser ? <p>{item.ZoptoUser}</p> : <p>-</p>}
                  </div>
                </td>
              )}
              {visibleColumns.includes("Created At") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "-"}
                </td>
              )}
              {visibleColumns.includes("Updated At") && (
                <td className="px-1.5 py-[20px] !font-[400]">
                  {item.updated_at
                    ? new Date(item.updated_at).toLocaleDateString()
                    : "-"}
                </td>
              )} */}
              {visibleColumns.includes("Action") && (
                <td
                  onClick={() => handleLoginAs(item.username)}
                  title="Login as this user"
                  className="px-1.5 py-[20px] !font-[400]"
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
