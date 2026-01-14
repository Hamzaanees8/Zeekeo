import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdminCheck,
  AdminMinus,
  EmailIcon1,
  LinkedInIcon2,
  LoginIcon,
  RunIcon,
} from "../../../../../components/Icons";
import { getAgencyUsers, loginAsUser } from "../../../../../services/admin";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../../stores/useAuthStore";
import { useNavigate } from "react-router";

const VALID_LINKEDIN_STATUSES = [
  "OK",
  "SYNC_SUCCESS",
  "RECONNECTED",
  "CREATION_SUCCESS",
];

// Email (Nylas) status check - only "connected" is valid
const isEmailConnected = (emailAccount) => emailAccount?.status === "connected";

const getConnectionBadgeColor = (user, provider) => {
  const account = user.accounts?.[provider];
  if (!account) {
    return "#9CA3AF";
  }
  // Use different status checks for LinkedIn vs Email
  if (provider === "email") {
    return isEmailConnected(account) ? "#038D65" : "#DE4B32";
  }
  // LinkedIn uses the old Unipile statuses
  if (VALID_LINKEDIN_STATUSES.includes(account.status)) {
    return "#038D65";
  }
  return "#DE4B32";
};
const UsersTab = ({ agencyEmail }) => {
  const loadingRef = useRef(false);
  const [data, setData] = useState([]);
  const [next, setNext] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(
    async (cursor = null) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (cursor) {
        setIsLoadingMore(true);
      } else {
        setIsInitialLoading(true);
      }

      try {
        const response = await getAgencyUsers({ agencyEmail, next: cursor });
        setData(prev => {
          const fetchedUsers = response.users || [];
          // Use email for uniqueness as DynamoDB users might not have a consistent 'id' field
          const newUsers = fetchedUsers.filter(
            a => !prev.some(p => (p.email || p.username) === (a.email || a.username)),
          );
          return cursor ? [...prev, ...newUsers] : fetchedUsers;
        });

        setNext(response.next || null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        loadingRef.current = false;
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [agencyEmail],
  );

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

  const handleLoginAs = async email => {
    try {
      const res = await loginAsUser(email, "user");

      if (res?.sessionToken) {
        const currentUser = useAuthStore.getState().currentUser;

        useAuthStore.getState().enterImpersonation(
          res.sessionToken,
          res.refreshToken || null,
          currentUser,
          "admin-to-user",
        );

        toast.success(`Logged in as ${email}`);
        navigate("/dashboard");
      } else {
        toast.error("Failed to login as user");
        console.error("Login as user error:", res);
      }
    } catch (err) {
      console.error("Login as user failed:", err);
      toast.error("Something went wrong");
    }
  };

  console.log("user data", data);

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[6px] overflow-hidden">
      <table className="w-full !overflow-x-auto">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-3 py-[20px] !font-[400]">#</th>
            <th className="px-3 py-[20px] !font-[400]">Email</th>
            <th className="px-3 py-[20px] !font-[400]">Name</th>
            <th className="px-3 py-[20px] !font-[400]">Pro</th>
            <th className="px-3 py-[20px] !font-[400]">Paid Until</th>
            <th className="px-3 py-[20px] !font-[400]">LinkedIn</th>
            <th className="px-3 py-[20px] !font-[400]">Enable</th>
            <th className="px-3 py-[20px] !font-[400]">Badges</th>
            <th className="px-3 py-[20px] !font-[400]">Action</th>
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF]">
          {isInitialLoading ? (
            <tr>
              <td colSpan="9" className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#0387FF] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[#7E7E7E]">Loading users...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="9" className="py-10 text-center text-[#7E7E7E]">
                No users found
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={item.email || item.username || item.id || index}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">{index + 1}</td>
                <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer !max-w-[150px] break-words">
                  {item.email || "-"}
                </td>
                <td className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer !max-w-[120px] break-words">
                  {item.first_name} {item.last_name}
                </td>
                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center justify-center">
                    {" "}
                    {item.pro === true ? <AdminCheck /> : <AdminMinus />}
                  </div>
                </td>
                <td className="px-3 py-[20px] !font-[400]">
                  {item.paid_until || "-"}
                </td>
                <td className="px-3 py-[20px] !font-[400] break-words !max-w-[150px]">
                  {" "}
                  {item.accounts?.linkedin?.data?.email || "-"}
                </td>

                <td className="px-3 py-[20px] !font-[400]">
                  <div className="flex items-center justify-center">
                    {" "}
                    {item.enabled === 1 ? <AdminCheck /> : <AdminMinus />}
                  </div>
                </td>
                <td className="px-3 py-5 flex gap-2 items-center">
                  <div
                    title={
                      !item.accounts?.linkedin
                        ? "LinkedIn account not connected"
                        : VALID_LINKEDIN_STATUSES.includes(
                            item.accounts.linkedin.status,
                          )
                        ? "LinkedIn account connected"
                        : "LinkedIn account disconnected"
                    }
                  >
                    <LinkedInIcon2
                      className="w-5 h-5"
                      fill={getConnectionBadgeColor(item, "linkedin")}
                    />
                  </div>
                  <div
                    className="rounded-full border-2 flex items-center justify-center w-4.5 h-4.5 "
                    style={{
                      borderColor: getConnectionBadgeColor(item, "email"),
                    }}
                    title={
                      !item.accounts?.email
                        ? "Email account not connected"
                        : isEmailConnected(item.accounts.email)
                        ? "Email account connected"
                        : "Email account disconnected"
                    }
                  >
                    <EmailIcon1
                      className="w-3.5 h-3"
                      fill={getConnectionBadgeColor(item, "email")}
                    />
                  </div>

                  <RunIcon className="w-5 h-5" />
                  <RunIcon className="w-5 h-5 " />
                </td>
                <td
                  onClick={() => handleLoginAs(item.email)}
                  title="Login as this user"
                  className="px-3 py-[20px] !font-[400]"
                >
                  <div className="flex items-center justify-center cursor-pointer">
                    <LoginIcon />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {isLoadingMore && (
        <div className="flex justify-center items-center py-8 bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#0387FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#7E7E7E]">Loading more users...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
