import { useCallback, useEffect, useRef, useState } from "react";
import {
  DotIcon,
  EmailIcon1,
  LinkedInIcon2,
  LoginIcon,
  RunIcon,
} from "../../../../components/Icons";
import { useNavigate } from "react-router";
import { loginAsAgencyUser } from "../../../../services/agency";
import { useAuthStore } from "../../../stores/useAuthStore";
import toast from "react-hot-toast";
const VALID_ACCOUNT_STATUSES = [
  "OK",
  "SYNC_SUCCESS",
  "RECONNECTED",
  "CREATION_SUCCESS",
];

const Empty = () => {
  return <div className="w-[15px] h-[7px] bg-[#CCCCCC] rounded-[6px]"></div>;
};

const Table = ({ rowsPerPage, visibleColumns, campaignsStats }) => {
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const [next, setNext] = useState(null);
  // Fetch users
  // const fetchAgencyUsers = useCallback(async (cursor = null) => {
  //   if (loadingRef.current) return;
  //   loadingRef.current = true;

  //   try {
  //     const response = await getAgencyUsers({ next: cursor });
  //     console.log("Fetched agency users:", response);

  //     setData(prev => {
  //       const newUsers = response.users?.filter(
  //         u => !prev.some(p => p.email === u.email),
  //       );
  //       return cursor ? [...prev, ...newUsers] : newUsers;
  //     });

  //     setNext(response.next || null);
  //   } catch (err) {
  //     console.error("Failed to fetch agency users:", err);
  //   } finally {
  //     loadingRef.current = false;
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchAgencyUsers();
  // }, [fetchAgencyUsers]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (
  //       window.innerHeight + window.scrollY >=
  //         document.documentElement.scrollHeight - 200 &&
  //       next &&
  //       !loadingRef.current
  //     ) {
  //       console.log("Scrolling... fetching next users page...");
  //       fetchAgencyUsers(next);
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [next, fetchAgencyUsers]);

  const calculateAcceptPercentage = userStats => {
    if (!userStats?.actions?.thisPeriod) return null;

    const { linkedin_invite, linkedin_invite_accepted } =
      userStats.actions.thisPeriod;

    if (!linkedin_invite?.total || linkedin_invite.total === 0) return 0;

    const acceptRate =
      ((linkedin_invite_accepted?.total || 0) / linkedin_invite.total) * 100;
    return acceptRate.toFixed(1);
  };

  const calculateReplyPercentage = userStats => {
    if (!userStats?.actions?.thisPeriod) return null;

    const { linkedin_message, linkedin_message_reply } =
      userStats.actions.thisPeriod;

    if (!linkedin_message?.total || linkedin_message.total === 0) return 0;

    const replyRate =
      ((linkedin_message_reply?.total || 0) / linkedin_message.total) * 100;
    return replyRate.toFixed(1);
  };

  const getInvitesCount = userStats => {
    return userStats?.actions?.thisPeriod?.linkedin_invite?.total || 0;
  };

  const getInmailsCount = userStats => {
    return userStats?.actions?.thisPeriod?.linkedin_inmail?.total || 0;
  };

  const visibleData =
    rowsPerPage === "all"
      ? campaignsStats
      : campaignsStats.slice(0, rowsPerPage);

  const handleLoginAs = async email => {
    try {
      const res = await loginAsAgencyUser(email);

      if (res?.sessionToken) {
        useAuthStore.getState().setLoginAsToken(res.sessionToken);
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
  const getConnectionBadgeColor = (user, provider) => {
    const account = user.accounts?.[provider];
    if (!account) {
      return "#9CA3AF";
    }
    if (VALID_ACCOUNT_STATUSES.includes(account.status)) {
      return "#038D65";
    }
    return "#DE4B32";
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
            {visibleColumns.includes("Badges") && (
              <th className="px-3 py-[20px] !font-[400]">Badges</th>
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
          {visibleData.map((item, index) => {
            const acceptPercentage = calculateAcceptPercentage(item.stats);
            const replyPercentage = calculateReplyPercentage(item.stats);
            const invitesCount = getInvitesCount(item.stats);
            const inmailsCount = getInmailsCount(item.stats);

            return (
              <tr
                key={item.email || item.id || index}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC]"
              >
                <td className="px-3 py-[20px] !font-[400]">{index + 1}</td>

                {visibleColumns.includes("User Email") && (
                  <td
                    className="px-3 py-[20px] !font-[400] text-[#0387FF] cursor-pointer"
                    onClick={() =>
                      navigate(`/agency/users/edit/${item.email}`)
                    }
                  >
                    {item.email || <Empty />}
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
                    {item.pro ? "Pro" : <Empty />}
                  </td>
                )}

                {visibleColumns.includes("Accept %") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {acceptPercentage !== null ? (
                      `${acceptPercentage}%`
                    ) : (
                      <Empty />
                    )}
                  </td>
                )}

                {visibleColumns.includes("Reply %") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {replyPercentage !== null ? (
                      `${replyPercentage}%`
                    ) : (
                      <Empty />
                    )}
                  </td>
                )}

                {visibleColumns.includes("Invites") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {invitesCount > 0 ? invitesCount : 0}
                  </td>
                )}

                {visibleColumns.includes("Inmail") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {inmailsCount > 0 ? inmailsCount : 0}
                  </td>
                )}

                {visibleColumns.includes("Badges") && (
                  <td className="px-3 py-5 flex gap-2 items-center">
                    <div
                      title={
                        !item.accounts?.linkedin
                          ? "LinkedIn account not connected"
                          : VALID_ACCOUNT_STATUSES.includes(
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
                      className="rounded-full border-2 flex items-center justify-center w-4.5 h-4.5"
                      style={{
                        borderColor: getConnectionBadgeColor(item, "email"),
                      }}
                      title={
                        !item.accounts?.email
                          ? "Email account not connected"
                          : VALID_ACCOUNT_STATUSES.includes(
                              item.accounts.email.status,
                            )
                          ? "Email account connected"
                          : "Email account disconnected"
                      }
                    >
                      <EmailIcon1
                        className="w-3.5 h-3"
                        fill={getConnectionBadgeColor(item, "email")}
                      />
                    </div>

                    {/* <RunIcon className="w-5 h-5" />
                    <RunIcon className="w-5 h-5 " /> */}
                  </td>
                )}

                {visibleColumns.includes("Enabled") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    {item.enabled === 1 ? "Enabled" : "Disabled" || <Empty />}
                  </td>
                )}

                {visibleColumns.includes("Action") && (
                  <td className="px-3 py-[20px] !font-[400]">
                    <div className="flex items-center justify-start gap-x-2.5">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleLoginAs(item.email)}
                      >
                        <LoginIcon />
                      </div>
                      <div className="cursor-pointer">
                        <DotIcon />
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
