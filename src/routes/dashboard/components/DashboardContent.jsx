import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";
import DashboardStats from "./DashboardStats.jsx";
import CampaignInsights from "./CampaignInsights.jsx";
import ICPInsights from "./ICPInsights.jsx";
import ProfileInsights from "./ProfileInsights.jsx";
import { getCampaigns } from "../../../services/campaigns.js";
import toast from "react-hot-toast";
import SocialSellingIndexStats from "./SocialSellingIndexStats.jsx";
import ProgressModal from "../../../components/ProgressModal.jsx";
import { downloadCSV } from "../../../utils/agency-user-helper.js";
import { getInsights } from "../../../services/insights.js";
import { DownloadIcon } from "../../../components/Icons.jsx";
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

  // Export state
  const contentRef = useRef(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [forceLoadSections, setForceLoadSections] = useState(false);

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
          const response = await getAgencyUsersFromAdmin(agencyEmail, { all: true });
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
          const response = await getAgencyUsersFromAgency({ all: "true" });
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
  const VALID_LINKEDIN_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];

  // Email (Nylas) status check - only "connected" is valid
  const isEmailConnected = email?.status === "connected";
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
      color: VALID_LINKEDIN_STATUSES.includes(linkedin?.status)
        ? "bg-approve"
        : "bg-[#f61d00]",
      tooltip: linkedin?.status
        ? VALID_LINKEDIN_STATUSES.includes(linkedin?.status)
          ? "You have LinkedIn Connected"
          : "LinkedIn account disconnected"
        : "You don't have LinkedIn Connected",
    },
    {
      name: "Sales Navigator",
      color:
        VALID_LINKEDIN_STATUSES.includes(linkedin?.status) &&
        linkedin?.data?.sales_navigator?.contract_id
          ? "bg-approve"
          : "bg-[#f61d00]",
      tooltip: linkedin?.data?.sales_navigator?.contract_id
        ? VALID_LINKEDIN_STATUSES.includes(linkedin?.status)
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
      color: isEmailConnected ? "bg-approve" : "bg-[#f61d00]",
      tooltip: isEmailConnected ? "Email is connected" : "Email is not connected",
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

  // Wait for all loading spinners to disappear
  const waitForLoadingToComplete = async (maxWaitMs = 15000) => {
    const startTime = Date.now();
    const checkInterval = 500;

    while (Date.now() - startTime < maxWaitMs) {
      // Check for common loading indicators
      const loadingIndicators = document.querySelectorAll(
        '.animate-spin, [class*="loading"], [class*="Loading"]',
      );

      // Check if any loading text is visible
      const loadingTextElements = Array.from(
        document.querySelectorAll("*"),
      ).filter(
        el =>
          el.textContent?.includes("Loading") &&
          el.offsetParent !== null &&
          el.children.length === 0,
      );

      if (loadingIndicators.length === 0 && loadingTextElements.length === 0) {
        // No loading indicators found, wait a bit more for any final renders
        await new Promise(r => setTimeout(r, 500));
        return true;
      }

      await new Promise(r => setTimeout(r, checkInterval));
    }

    // Timeout reached, proceed anyway
    console.warn("Loading timeout reached, proceeding with PDF export");
    return false;
  };

  // Trigger all lazy-loaded sections to fetch their data without scrolling
  const triggerLazyLoads = async () => {
    // Set forceLoad flag to trigger all child components to load
    setForceLoadSections(true);

    // Wait for React to re-render and components to start loading
    await new Promise(r => setTimeout(r, 100));

    // Wait for all loading indicators to disappear
    await waitForLoadingToComplete();
  };

  // CSV Export function
  const handleDashboardDownload = async () => {
    setShowDownloadModal(true);
    setDownloadProgress(0);

    try {
      setDownloadProgress(10);

      // Fetch all data for CSV export
      const params = {
        fromDate: dateFrom,
        toDate: dateTo,
        types: [
          "campaignsRunning",
          "unreadPositiveConversations",
          "actions",
          "latestMessages",
          "last24Actions",
          "icpInsights",
          "profileInsights",
          "ssiScores",
        ],
      };

      const insights = await getInsights(params);
      setDownloadProgress(50);

      // Build CSV sections
      let csvSections = [];

      // 1. Dashboard Stats Summary
      csvSections.push("Dashboard Stats Summary");
      csvSections.push("Metric,This Period,Last Period");
      csvSections.push(
        `Campaigns Running,${insights?.campaignsRunning || 0},N/A`,
      );
      csvSections.push(
        `Unread Positive Replies,${insights?.unreadPositiveConversations || 0},N/A`,
      );
      csvSections.push(
        `Views,${insights?.actions?.thisPeriod?.linkedin_view?.total || 0},${insights?.actions?.lastPeriod?.linkedin_view?.total || 0}`,
      );
      csvSections.push(
        `Accepted,${insights?.actions?.thisPeriod?.linkedin_invite_accepted?.total || 0},${insights?.actions?.lastPeriod?.linkedin_invite_accepted?.total || 0}`,
      );
      csvSections.push(
        `Replies,${insights?.actions?.thisPeriod?.linkedin_reply?.total || 0},${insights?.actions?.lastPeriod?.linkedin_reply?.total || 0}`,
      );
      csvSections.push(
        `Invites,${insights?.actions?.thisPeriod?.linkedin_invite?.total || 0},${insights?.actions?.lastPeriod?.linkedin_invite?.total || 0}`,
      );
      csvSections.push(
        `LinkedIn Messages,${insights?.actions?.thisPeriod?.linkedin_message?.total || 0},${insights?.actions?.lastPeriod?.linkedin_message?.total || 0}`,
      );
      csvSections.push(
        `Follows,${insights?.actions?.thisPeriod?.linkedin_follow?.total || 0},${insights?.actions?.lastPeriod?.linkedin_follow?.total || 0}`,
      );
      csvSections.push(
        `InMails,${insights?.actions?.thisPeriod?.linkedin_inmail?.total || 0},${insights?.actions?.lastPeriod?.linkedin_inmail?.total || 0}`,
      );
      csvSections.push("");
      setDownloadProgress(60);

      // 2. Campaign Insights - Actions breakdown
      csvSections.push("Campaign Insights - Actions");
      csvSections.push("Action Type,This Period Total,Last Period Total");
      const actionTypes = [
        "linkedin_view",
        "linkedin_invite",
        "linkedin_invite_accepted",
        "linkedin_message",
        "linkedin_reply",
        "linkedin_inmail",
        "linkedin_follow",
        "linkedin_like_post",
        "linkedin_endorse",
        "email_message",
      ];
      actionTypes.forEach(action => {
        csvSections.push(
          `${action},${insights?.actions?.thisPeriod?.[action]?.total || 0},${insights?.actions?.lastPeriod?.[action]?.total || 0}`,
        );
      });
      csvSections.push("");
      setDownloadProgress(70);

      // 3. ICP Insights (if available)
      if (insights?.icpInsights?.profiles?.length > 0) {
        csvSections.push("ICP Insights - Top Titles");
        csvSections.push("Title,Count");
        const titleCounts = {};
        insights.icpInsights.profiles.forEach(p => {
          if (p.title) {
            titleCounts[p.title] = (titleCounts[p.title] || 0) + 1;
          }
        });
        Object.entries(titleCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([title, count]) => {
            csvSections.push(`"${title.replace(/"/g, '""')}",${count}`);
          });
        csvSections.push("");
      }
      setDownloadProgress(80);

      // 4. Profile Insights (if available)
      if (insights?.profileInsights?.length > 0) {
        csvSections.push("Profile Insights - Recent Profile Views");
        csvSections.push("Name,Headline,Network Distance,Viewed At");
        insights.profileInsights.slice(0, 20).forEach(p => {
          csvSections.push(
            `"${(p.name || "").replace(/"/g, '""')}","${(p.headline || "").replace(/"/g, '""')}","${p.network_distance || ""}","${p.viewed_at ? new Date(p.viewed_at).toISOString() : ""}"`,
          );
        });
        csvSections.push("");
      }
      setDownloadProgress(85);

      // 5. SSI Scores (if available)
      if (insights?.ssiScores && Object.keys(insights.ssiScores).length > 0) {
        csvSections.push("Social Selling Index");
        csvSections.push("Metric,Value");
        csvSections.push(
          `Overall SSI Score,${insights.ssiScores?.memberScore?.overall || 0}`,
        );

        const industryGroup = insights.ssiScores?.groupScore?.find(
          g => g.groupType === "INDUSTRY",
        );
        const networkGroup = insights.ssiScores?.groupScore?.find(
          g => g.groupType === "NETWORK",
        );

        csvSections.push(`Industry SSI Rank,${industryGroup?.rank || 0}%`);
        csvSections.push(`Network SSI Rank,${networkGroup?.rank || 0}%`);

        if (insights.ssiScores?.memberScore?.subScores) {
          insights.ssiScores.memberScore.subScores.forEach(sub => {
            csvSections.push(
              `${sub.name || sub.type || "Sub Score"},${sub.score || 0}`,
            );
          });
        }
        csvSections.push("");
      }
      setDownloadProgress(90);

      const finalCsv = csvSections.join("\n");
      const userName =
        user?.first_name || user?.email?.split("@")[0] || "User";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${userName}_dashboard_export_${date}.csv`;
      downloadCSV(finalCsv, filename);

      setDownloadProgress(100);
      setTimeout(() => {
        setShowDownloadModal(false);
        setDownloadProgress(0);
        toast.success("Dashboard export complete");
      }, 800);
    } catch (error) {
      console.error("Dashboard CSV download failed:", error);
      toast.error("Download failed");
      setShowDownloadModal(false);
      setDownloadProgress(0);
    }
  };

  // PDF Export function - Uses browser's native print dialog for perfect CSS rendering
  const generateHighQualityPDF = async () => {
    setIsPrinting(true);
    setShowDownloadModal(true);
    setDownloadProgress(5);

    try {
      // Phase 1: Load all data (0-100%)
      setDownloadProgress(10);

      // Trigger all lazy-loaded sections to load their data
      setForceLoadSections(true);
      await new Promise(r => setTimeout(r, 100));
      setDownloadProgress(30);

      // Wait for all loading indicators to disappear
      await waitForLoadingToComplete();
      setDownloadProgress(80);

      // Extra wait for final renders
      await new Promise(r => setTimeout(r, 1000));
      setDownloadProgress(100);

      // Show 100% briefly before opening print dialog
      await new Promise(r => setTimeout(r, 500));
      setShowDownloadModal(false);

      // Get the dashboard content
      const printContent = contentRef.current;
      if (!printContent) {
        throw new Error("No content found to export");
      }

      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=1200,height=800");
      if (!printWindow) {
        throw new Error("Could not open print window. Please allow popups.");
      }

      // Get all stylesheets from the current page
      const styleSheets = Array.from(document.styleSheets);
      let cssText = "";

      styleSheets.forEach(sheet => {
        try {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              cssText += rule.cssText + "\n";
            });
          }
        } catch (e) {
          // Cross-origin stylesheets can't be accessed, skip them
          if (sheet.href) {
            cssText += `@import url("${sheet.href}");\n`;
          }
        }
      });

      // Build the print document
      const userName = user?.first_name || user?.email?.split("@")[0] || "User";
      const date = new Date().toISOString().split("T")[0];

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${userName} Dashboard - ${date}</title>
          <style>
            ${cssText}

            /* Print-specific styles */
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              .exclude-from-pdf,
              .no-print,
              [data-skip-pdf] {
                display: none !important;
              }
            }

            /* Base styles for the print view */
            body {
              margin: 0;
              padding: 20px;
              background: white;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }

            /* Hide elements that shouldn't be printed */
            .exclude-from-pdf,
            .no-print,
            [data-skip-pdf] {
              display: none !important;
            }

            /* Ensure colors print correctly */
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            // Auto-trigger print dialog when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        setIsPrinting(false);
        setDownloadProgress(0);
        setForceLoadSections(false);
        toast.success("Print dialog opened - Save as PDF");
      }, 600);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setShowDownloadModal(false);
      setIsPrinting(false);
      setDownloadProgress(0);
      setForceLoadSections(false);
      toast.error(error.message || "PDF export failed");
    }
  };

  return (
    <>
      <div ref={contentRef} className="p-6 border-b w-full relative print-section">
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
                  className="relative flex items-center text-[10px] text-grey-medium group cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => navigate("/settings?tab=Integrations")}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${platform.color}`}
                  ></span>
                  {platform.name}
                  <div
                    className={`absolute top-full opacity-0 group-hover:opacity-100 transition
                  ${platform.color} text-white text-[10px] rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none`}
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
          onDownloadCSV={handleDashboardDownload}
          onDownloadPDF={generateHighQualityPDF}
        />
        <CampaignInsights campaigns={campaigns} forceLoad={forceLoadSections} />
        <ICPInsights forceLoad={forceLoadSections} />
        <ProfileInsights forceLoad={forceLoadSections} />
        <SocialSellingIndexStats forceLoad={forceLoadSections} />
      </div>
      {showDownloadModal && (
        <ProgressModal
          onClose={() => {
            setShowDownloadModal(false);
            setDownloadProgress(0);
            setIsPrinting(false);
          }}
          title="Export Dashboard"
          action="Abort Process"
          progress={downloadProgress}
        />
      )}
    </>
  );
};
