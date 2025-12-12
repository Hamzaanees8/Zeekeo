import { useCallback, useEffect, useRef, useState } from "react";
import {
  DeleteIcon,
  DotIcon,
  EmailIcon1,
  LinkedInIcon2,
  LoginIcon,
  RunIcon,
} from "../../../../components/Icons";
import { useNavigate } from "react-router";
import {
  loginAsAgencyUser,
  updateAgencyUser,
  deleteAgencyUser,
} from "../../../../services/agency";
import { useAuthStore } from "../../../stores/useAuthStore";
import toast from "react-hot-toast";
import DisableUserModal from "./DisableUserModal";
import usePreviousStore from "../../../stores/usePreviousStore";
const VALID_ACCOUNT_STATUSES = [
  "OK",
  "SYNC_SUCCESS",
  "RECONNECTED",
  "CREATION_SUCCESS",
];

const Empty = () => {
  return <div className="w-[15px] h-[7px] bg-[#CCCCCC] rounded-[6px]"></div>;
};

const Table = ({
  rowsPerPage,
  visibleColumns,
  campaignsStats,
  onUserStatusChanged,
}) => {
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const [next, setNext] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [modalAction, setModalAction] = useState("disable"); // 'disable' or 'enable'
  const previousView = usePreviousStore.getState().previousView;
  let impersonationType;
  if (previousView?.type === "user") {
    // If previous view was user, send 'user-agency-admin'
    impersonationType = "user-agency-admin";
  } else if (previousView?.type === "agency") {
    // If previous view was agency, send 'user'
    impersonationType = "user";
  } else {
    // Default fallback if no previous view
    impersonationType = "user"; // or whatever default you prefer
  }
  const handleUserStatusUpdate = async email => {
    try {
      if (modalAction === "delete") {
        // call delete endpoint (email can be single or comma-separated)
        await deleteAgencyUser(email);
        toast.success(`User ${email} has been deleted`);
      } else {
        const enabledValue = modalAction === "enable" ? 1 : 0;
        await updateAgencyUser(email, { enabled: enabledValue });
        toast.success(
          `User ${email} has been ${
            modalAction === "enable" ? "enabled" : "disabled"
          }`,
        );
      }
      setOpenDropdown(null);
      setShowDisableModal(false);
      setUserToDisable(null);
      setModalAction("disable");
      // Call parent callback to refresh data
      if (onUserStatusChanged) {
        onUserStatusChanged();
      }
    } catch (err) {
      console.error("Failed to update user status:", err);
      toast.error("Failed to update user status");
    }
  };

  const handleOpenUserStatusModal = (email, action) => {
    setUserToDisable(email);
    setModalAction(action);
    setShowDisableModal(true);
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      // Close dropdown if clicking outside a dropdown menu
      if (!event.target.closest("[data-dropdown-menu]")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        const currentUser = useAuthStore.getState().currentUser;
        usePreviousStore.getState().setPreviousView("agency");
        // FIXED: Pass refreshToken
        useAuthStore.getState().enterImpersonation(
          res.sessionToken,
          res.refreshToken || null,
          currentUser, // Original agency user
          "user", // String type
        );

        toast.success(`Logged in as ${email}`);
        navigate("/dashboard");
      } else {
        toast.error("Failed to login as user");
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

  if (visibleData.length === 0) {
    return (
      <div className="w-full border border-[#7E7E7E] rounded-[8px] shadow-md overflow-visible bg-white">
        <div className="flex items-center justify-center py-12">
          <p className="text-[#7E7E7E] text-lg font-medium">
            No users to display
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-[#7E7E7E] rounded-[8px] shadow-md overflow-y-auto min-h-[370px] custom-scroll1 bg-[#FFFFFF] overflow-visible">
      <table className="w-full">
        <thead className="bg-[#FFFFFF] text-left font-poppins">
          <tr className="text-[15px] text-[#7E7E7E] border-b border-b-[#CCCCCC]">
            <th className="px-2 py-[20px] !font-[400]"></th>

            {visibleColumns.includes("User Email") && (
              <th className="px-2 py-[20px] !font-[400]">User Email</th>
            )}
            {visibleColumns.includes("Name") && (
              <th className="px-2 py-[20px] !font-[400]">Name</th>
            )}
            {visibleColumns.includes("Type") && (
              <th className="px-2 py-[20px] !font-[400]">Type</th>
            )}
            {visibleColumns.includes("Accept %") && (
              <th className="px-2 py-[20px] !font-[400]">Accept %</th>
            )}
            {visibleColumns.includes("Reply %") && (
              <th className="px-2 py-[20px] !font-[400]">Reply %</th>
            )}
            {visibleColumns.includes("Invites") && (
              <th className="px-2 py-[20px] !font-[400]">Invites</th>
            )}
            {visibleColumns.includes("Inmail") && (
              <th className="px-2 py-[20px] !font-[400]">Inmail</th>
            )}
            {visibleColumns.includes("Badges") && (
              <th className="px-2 py-[20px] !font-[400]">Badges</th>
            )}
            {visibleColumns.includes("Enabled") && (
              <th className="px-2 py-[20px] !font-[400]">Enabled</th>
            )}
            {visibleColumns.includes("Action") && (
              <th className="px-2 py-[20px] !font-[400]">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-[#FFFFFF] overflow-visible">
          {visibleData.map((item, index) => {
            const acceptPercentage = calculateAcceptPercentage(item.stats);
            const replyPercentage = calculateReplyPercentage(item.stats);
            const invitesCount = getInvitesCount(item.stats);
            const inmailsCount = getInmailsCount(item.stats);

            return (
              <tr
                key={item.email || item.id || index}
                className="text-[#6D6D6D] text-[13px] border-b border-b-[#CCCCCC] relative"
              >
                <td className="px-2 py-[20px] !font-[400]">{index + 1}</td>

                {visibleColumns.includes("User Email") && (
                  <td
                    className="px-2 py-[20px] !font-[400] text-[#0387FF] cursor-pointer"
                    onClick={() =>
                      navigate(`/agency/users/edit/${item.email}`)
                    }
                  >
                    {item.email || <Empty />}
                  </td>
                )}

                {visibleColumns.includes("Name") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {item.first_name || item.last_name ? (
                      `${item.first_name || ""} ${item.last_name || ""}`.trim()
                    ) : (
                      <Empty />
                    )}
                  </td>
                )}

                {visibleColumns.includes("Type") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {item.pro ? "Pro" : <Empty />}
                  </td>
                )}

                {visibleColumns.includes("Accept %") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {acceptPercentage !== null ? (
                      `${acceptPercentage}%`
                    ) : (
                      <Empty />
                    )}
                  </td>
                )}

                {visibleColumns.includes("Reply %") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {replyPercentage !== null ? (
                      `${replyPercentage}%`
                    ) : (
                      <Empty />
                    )}
                  </td>
                )}

                {visibleColumns.includes("Invites") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {invitesCount > 0 ? invitesCount : 0}
                  </td>
                )}

                {visibleColumns.includes("Inmail") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {inmailsCount > 0 ? inmailsCount : 0}
                  </td>
                )}

                {visibleColumns.includes("Badges") && (
                  <td className="px-2 py-[20px]">
                    <div className="flex gap-2 items-center">
                      <div className="relative group">
                        <LinkedInIcon2
                          className="w-5 h-5"
                          fill={getConnectionBadgeColor(item, "linkedin")}
                        />
                        <div
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 text-xs text-white rounded whitespace-nowrap z-50 ${
                            !item.accounts?.linkedin
                              ? "bg-[#9CA3AF]"
                              : VALID_ACCOUNT_STATUSES.includes(
                                  item.accounts.linkedin.status,
                                )
                              ? "bg-[#038D65]"
                              : "bg-[#DE4B32]"
                          }`}
                        >
                          {!item.accounts?.linkedin
                            ? "LinkedIn account not connected"
                            : VALID_ACCOUNT_STATUSES.includes(
                                item.accounts.linkedin.status,
                              )
                            ? "LinkedIn account connected"
                            : "LinkedIn account disconnected"}
                          <div
                            className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                              !item.accounts?.linkedin
                                ? "border-t-[#9CA3AF]"
                                : VALID_ACCOUNT_STATUSES.includes(
                                    item.accounts.linkedin.status,
                                  )
                                ? "border-t-[#038D65]"
                                : "border-t-[#DE4B32]"
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="relative group">
                        <div
                          className="rounded-full border-2 flex items-center justify-center w-4.5 h-4.5"
                          style={{
                            borderColor: getConnectionBadgeColor(
                              item,
                              "email",
                            ),
                          }}
                        >
                          <EmailIcon1
                            className="w-3.5 h-3"
                            fill={getConnectionBadgeColor(item, "email")}
                          />
                        </div>
                        <div
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 text-xs text-white rounded whitespace-nowrap z-50 ${
                            !item.accounts?.email
                              ? "bg-[#9CA3AF]"
                              : VALID_ACCOUNT_STATUSES.includes(
                                  item.accounts.email.status,
                                )
                              ? "bg-[#038D65]"
                              : "bg-[#DE4B32]"
                          }`}
                        >
                          {!item.accounts?.email
                            ? "Email account not connected"
                            : VALID_ACCOUNT_STATUSES.includes(
                                item.accounts.email.status,
                              )
                            ? "Email account connected"
                            : "Email account disconnected"}
                          <div
                            className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                              !item.accounts?.email
                                ? "border-t-[#9CA3AF]"
                                : VALID_ACCOUNT_STATUSES.includes(
                                    item.accounts.email.status,
                                  )
                                ? "border-t-[#038D65]"
                                : "border-t-[#DE4B32]"
                            }`}
                          ></div>
                        </div>
                        {/* <RunIcon className="w-5 h-5" />
                    <RunIcon className="w-5 h-5 " /> */}
                      </div>
                    </div>
                  </td>
                )}
                {visibleColumns.includes("Enabled") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    {item.enabled === 1 ? (
                      <span className="text-[#038D65] font-medium">
                        Enabled
                      </span>
                    ) : (
                      <span className="bg-[#FFB3B3] px-2 py-1 rounded text-[#D62828] font-medium">
                        Disabled
                      </span>
                    )}
                  </td>
                )}
                {visibleColumns.includes("Action") && (
                  <td className="px-2 py-[20px] !font-[400]">
                    <div className="flex items-center gap-x-2.5">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleLoginAs(item.email)}
                      >
                        <LoginIcon />
                      </div>
                      {item.enabled === 1 ? (
                        <button
                          title="Disable User"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenUserStatusModal(item.email, "disable");
                          }}
                          className="w-full px-1 py-1.5 text-center text-sm text-[#6D6D6D] hover:bg-gray-300 bg-gray-200 cursor-pointer rounded-[4px]"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          title="Enable User"
                          onClick={e => {
                            e.stopPropagation();
                            handleOpenUserStatusModal(item.email, "enable");
                          }}
                          className="w-full px-1 py-1.5 text-center text-sm text-[#6D6D6D] hover:bg-gray-300 bg-gray-200 cursor-pointer rounded-[4px]"
                        >
                          Enable
                        </button>
                      )}
                      <button
                        title="Delete User"
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenUserStatusModal(item.email, "delete");
                        }}
                        className="text-red-500 hover:text-red-700 cursor-pointer p-1 rounded-full border border-[#E63946]"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {showDisableModal && (
        <DisableUserModal
          onClose={() => {
            setShowDisableModal(false);
            setUserToDisable(null);
            setModalAction("disable");
          }}
          onClick={() => handleUserStatusUpdate(userToDisable)}
          userEmail={userToDisable}
          action={modalAction}
        />
      )}
    </div>
  );
};

export default Table;
