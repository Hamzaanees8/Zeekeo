import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";
import DashboardStats from "./DashboardStats.jsx";
import CampaignInsights from "./CampaignInsights.jsx";
import ICPInsights from "./ICPInsights.jsx";
import ProfileInsights from "./ProfileInsights.jsx";
import { getCampaigns } from "../../../services/campaigns.js";
import toast from "react-hot-toast";
import SocialSellingIndexStats from "./SocialSellingIndexStats.jsx";
import {
  getAgencyUsersFromUser,
  loginAsUserFromUser,
  updateUser,
} from "../../../services/users.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import usePreviousStore from "../../stores/usePreviousStore.js";
import { api } from "../../../services/api.js";
import {
  defaultSelected,
  permissionKeyMap,
  permissionsList,
} from "../../../utils/permissions.js";
import {
  getAgencyUsersFromAgency,
  loginAsAgencyUserFromAgency,
} from "../../../services/agency.js";
import {
  getAgencyUsersFromAdmin,
  loginAsUserFromAdmin,
} from "../../../services/admin.js";
import useAgencyStore from "../../stores/useAgencyStore.js";

export const DashboardContent = () => {
  const store = useAuthStore();
  const getOriginalUser = () => {
    return store.originalUser || store.currentUser;
  };
  const originalUser = getOriginalUser();
  const previousView = usePreviousStore.getState().previousView;
  const agencyEmail = useAgencyStore.getState().agencyEmail;
  const now = new Date();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const navigate = useNavigate();

  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD

  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [selectedAgencyUser, setSelectedAgencyUser] = useState(null);
  const user = getCurrentUser();
  const setUser = useAuthStore(state => state.setUser);
  const updateImpersonatedUser = useAuthStore(
    state => state.updateImpersonatedUser,
  );
  const isImpersonating = useAuthStore(state => state.isImpersonating());
  const isAgencyAdmin =
    !!originalUser?.agency_admin === true || previousView === "agency";
  const isAdmin =
    originalUser?.admin === 1 && store.impersonationChain.length > 0;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users");
        let user = response.user;

        if (user.agency_username && !user.agency_permissions) {
          let newPermissions = {};
          if (user.agency_admin) {
            newPermissions = Object.fromEntries(
              permissionsList.map(p => [permissionKeyMap[p], true]),
            );
          } else {
            newPermissions = Object.fromEntries(
              permissionsList.map(p => [
                permissionKeyMap[p],
                defaultSelected.includes(p),
              ]),
            );
          }

          try {
            const updatedUser = await updateUser({
              agency_permissions: newPermissions,
            });

            // Use updateImpersonatedUser if we're in impersonation mode
            if (isImpersonating) {
              updateImpersonatedUser(updatedUser);
            } else {
              setUser(updatedUser);
            }
          } catch (err) {
            console.error(
              "[Dashboard] Failed to sync permissions with backend, updating locally:",
              err,
            );

            const userWithPermissions = {
              ...user,
              agency_permissions: newPermissions,
            };
            if (isImpersonating) {
              updateImpersonatedUser(userWithPermissions);
            } else {
              setUser(userWithPermissions);
            }
          }
        } else {
          // Use updateImpersonatedUser if we're in impersonation mode
          if (isImpersonating) {
            updateImpersonatedUser(user);
          } else {
            setUser(user);
          }
        }
      } catch (error) {
        console.error("[Dashboard] Failed to refresh user data:", error);
      }
    };

    fetchUserData();
  }, [setUser, updateImpersonatedUser]);

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      if (originalUser?.agency_admin === true && !agencyEmail) {
        try {
          const response = await getAgencyUsersFromUser(true);
          const allUsers = response?.users || response?.data?.users || [];
          const enabledUsers = allUsers.filter(user => user.enabled === 1);
          setAgencyUsers(enabledUsers);
        } catch (err) {
          console.error("Failed to load agency users", err);
        }
      } else if (isAdmin && previousView !== "agency" && agencyEmail) {
        try {
          const response = await getAgencyUsersFromAdmin(agencyEmail);
          const allUsers = response?.users || response?.data?.users || [];
          const enabledUsers = allUsers.filter(user => user.enabled === 1);
          setAgencyUsers(enabledUsers);
        } catch (err) {
          console.error("Failed to load agency users", err);
        }
      } else if (
        store.impersonationChain.length > 0 &&
        previousView === "agency"
      ) {
        try {
          const response = await getAgencyUsersFromAgency();
          const allUsers = response?.users || response?.data?.users || [];
          const enabledUsers = allUsers.filter(user => user.enabled === 1);
          setAgencyUsers(enabledUsers);
        } catch (err) {
          console.error("Failed to load agency users", err);
        }
      } else {
        return;
      }
    };

    fetchAgencyUsers();
  }, []);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { campaigns: data } = await getCampaigns({ all: true });

        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns");
        }
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignSelect = option => {
    setSelectedCampaigns(option);
    setShowCampaigns(false);
  };

  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const linkedin = user?.accounts?.linkedin || {};
  const email = user?.accounts?.email;
  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];
  // Check subscription status
  const paidUntil = user?.paid_until;
  const paidUntilDate = paidUntil ? new Date(paidUntil + "T00:00:00Z") : null;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const isExpired = paidUntilDate && paidUntilDate < todayDate;
  const isAgencyUser = !!originalUser?.agency_username; // User belongs to an agency
  let impersonationType;
  if (previousView === "user") {
    // If previous view was user, send 'user-agency-admin'
    impersonationType = "user-agency-admin";
  } else if (previousView === "agency") {
    // If previous view was agency, send 'user'
    impersonationType = "user";
  } else {
    // Default fallback if no previous view
    impersonationType = "user"; // or whatever default you prefer
  }
  const platforms = [
    {
      name: "LinkedIn",
      color: VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
        ? "bg-approve"
        : "bg-[#f61d00]",
      tooltip: linkedin?.status
        ? VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
          ? "You have LinkedIn Connected"
          : "LinkedIn account disconnected"
        : "You don't have LinkedIn Connected",
    },
    {
      name: "Sales Navigator",
      color:
        VALID_ACCOUNT_STATUSES.includes(linkedin?.status) &&
        linkedin?.data?.sales_navigator?.contract_id
          ? "bg-approve"
          : "bg-[#f61d00]",
      tooltip: linkedin?.data?.sales_navigator?.contract_id
        ? VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
          ? "Sales Navigator is active"
          : "Sales Navigator account disconnected"
        : "No Sales Navigator seat",
    },
    {
      name: "LinkedIn Recruiter",
      color: linkedin?.data?.recruiter ? "bg-approve" : "bg-[#f61d00]",
      tooltip: linkedin?.data?.recruiter
        ? "Recruiter license connected"
        : "Recruiter not available",
    },
    {
      name: "Email Connected",
      color: email?.id ? "bg-approve" : "bg-[#f61d00]",
      tooltip: email?.id ? "Email is connected" : "Email is not connected",
    },
  ];
  const invitesPausedUntil = user?.invitations_paused_until
    ? new Date(user.invitations_paused_until)
    : null;

  const inmailPausedUntil = user?.inmail_paused_until
    ? new Date(user.inmail_paused_until)
    : null;

  const isInvitesPausedRecently =
    invitesPausedUntil && now - invitesPausedUntil <= TWENTY_FOUR_HOURS_MS;

  const isInmailPausedRecently =
    inmailPausedUntil && now - inmailPausedUntil <= TWENTY_FOUR_HOURS_MS;
  const handleLoginAs = async (username, type = "user") => {
    try {
      let res;
      const store = useAuthStore.getState();

      // Condition 1: Agency admin logging in as a user
      if (originalUser?.agency_admin === true && !agencyEmail) {
        res = await loginAsUserFromUser(username);
      }
      // Condition 2: System admin logging in as agency or user
      else if (isAdmin && previousView !== "agency" && agencyEmail) {
        res = await loginAsUserFromAdmin(username, "user");
      }
      // Condition 3: Impersonated agency logging in as their users
      else if (
        store.impersonationChain.length > 0 &&
        previousView === "agency"
      ) {
        res = await loginAsAgencyUserFromAgency(username); // Note: username is email in this case
      } else {
        return;
      }

      if (res?.sessionToken) {
        // Handle token based on user type
        if (store.getCurrentUserType() === "user") {
          // Already in user mode - switch users
          store.switchUser(
            res.sessionToken,
            res.refreshToken || null,
            store.currentUser,
          );
          toast.success(`Switched to ${username}`);
        } else {
          // Agency → User (first time)
          store.enterImpersonation(
            res.sessionToken,
            res.refreshToken || null,
            store.currentUser,
            impersonationType,
          );
          toast.success(`Logged in as ${username}`);
        }

        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else {
        console.error("Login as user error:", res);
      }
    } catch (err) {
      console.error("Login as user failed:", err);
    }
  };

  return (
    <>
      <div className="p-6 border-b w-full relative">
        {isExpired ? (
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 rounded border bg-red-100 border-red-400 text-red-800">
              <p className="font-semibold text-sm">
                Subscription expired on {paidUntil}.{" "}
                {isAgencyUser ? "" : "Please renew to continue service."}
              </p>
              {!isAgencyUser && (
                <button
                  onClick={() => navigate("/billing")}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer"
                >
                  Renew Subscription
                </button>
              )}
            </div>
            {agencyUsers.length > 0 && (isAgencyAdmin === true || isAdmin) && (
              <div className="relative inline-block mb-6">
                <button
                  onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                  className="w-[150px] px-4 py-2 bg-white text-[#6D6D6D] rounded-md text-sm font-medium cursor-pointer border border-[#7E7E7E]"
                >
                  Switch User
                </button>

                {showAgencyDropdown && (
                  <div className="absolute mt-2 w-56 bg-white border border[#7E7E7E] rounded-md shadow-lg z-20 max-h-64 overflow-y-auto right-0 custom-scroll1">
                    {agencyUsers.map((user, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleLoginAs(user.email);
                          setSelectedAgencyUser(user);
                          setShowAgencyDropdown(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm font-medium text-[#6D6D6D]"
                      >
                        {user.first_name} {user.last_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-[40px]">
              {platforms.map((platform, index) => (
                <div
                  key={index}
                  className="relative flex items-center text-[10px] text-grey-light group"
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${platform.color}`}
                  ></span>
                  {platform.name}
                  <div
                    className={`absolute top-full opacity-0 group-hover:opacity-100 transition
                  ${platform.color} text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10`}
                  >
                    {platform.tooltip}
                  </div>
                </div>
              ))}
            </div>
            {agencyUsers.length > 0 && (isAgencyAdmin === true || isAdmin) && (
              <div className="relative inline-block mb-6">
                <button
                  onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                  className="w-[150px] px-4 py-2 bg-white text-[#6D6D6D] rounded-md text-sm font-medium cursor-pointer border border-[#7E7E7E]"
                >
                  Switch User
                </button>

                {showAgencyDropdown && (
                  <div className="absolute mt-2 w-56 bg-white border border[#7E7E7E] rounded-md shadow-lg z-20 max-h-64 overflow-y-auto right-0 custom-scroll1">
                    {agencyUsers.map((user, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleLoginAs(user.email);
                          setSelectedAgencyUser(user);
                          setShowAgencyDropdown(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm font-medium text-[#6D6D6D]"
                      >
                        {user.first_name} {user.last_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DashboardStats
          campaigns={campaigns}
          isInmailPausedRecently={isInmailPausedRecently}
          isInvitesPausedRecently={isInvitesPausedRecently}
          invitesPausedUntil={invitesPausedUntil}
          inmailPausedUntil={inmailPausedUntil}
        />
        <CampaignInsights campaigns={campaigns} />
        <ICPInsights />
        <ProfileInsights />
        <SocialSellingIndexStats />
      </div>
    </>
  );
};
