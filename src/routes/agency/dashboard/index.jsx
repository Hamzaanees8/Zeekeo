import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
  LeftNavigate,
  RightNavigate,
  AdminUsersIcon,
  InvitesIcon,
  SequencesIcon,
  AcceptIcon,
  RepliesIcon,
  MeetingIcon,
  CampaignsIcon,
  CampaignsIcon1,
} from "../../../components/Icons.jsx";
import MultiMetricChart from "../../dashboard/components/graph-cards/MultiMetricChart.jsx";
import Table from "../components/Table.jsx";
import HorizontalBarChart from "./components/HorizontalBarChart.jsx";
import VerticalBarChart from "./components/VerticalBarChart.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import { api } from "../../../services/api.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import toast from "react-hot-toast";
import ProgressModal from "../../../components/ProgressModal.jsx";
import { downloadCSV } from "../../../utils/agency-user-helper.js";
import {
  getAgencyUsers,
  getCampaigns,
  getInsights,
  getUsersWithCampaignsAndStats,
  getAgencySettings, // Import the API function
} from "../../../services/agency.js";
import { metricConfig } from "../../../utils/stats-helper.js";
import NotificationsCard from "./components/NotificationCard.jsx";
import TwoLevelCircleCard from "../../dashboard/components/graph-cards/TwoLevelCircleCard.jsx";
import PeriodCard from "../../dashboard/components/PeriodCard.jsx";
import TooltipInfo from "../../dashboard/components/TooltipInfo.jsx";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore.js";

const headers = ["User", "Campaigns", "Msgs.sent", "Accept %", "Reply %"];
const dummyNotifications = [
  {
    username: "Richard",
    message: "Server CPU usage is high.",
    status: "critical",
  },
  {
    username: "Ahmed",
    message: "New user signup: emma@example.com",
    status: "okay",
  },
  {
    username: "Suresh",
    message: "Memory usage is nearing capacity.",
    status: "warning",
  },
  {
    username: "Ahmed",
    message: "Security patch applied successfully.",
    status: "okay",
  },
  {
    username: "Suresh",
    message: "Database connection timeout detected.",
    status: "critical",
  },
];

const AgencyDashboard = () => {
  const navigate = useNavigate();
  const contentRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  // Get today's date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // format YYYY-MM-DD
  const EMPTY_DATA = [];
  // Get one month back
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split("T")[0];
  const dropdownRef = useRef(null);
  const dropdownRefUser = useRef(null);
  const [dateFrom, setDateFrom] = useState(lastMonthStr);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dateTo, setDateTo] = useState(todayStr);
  const [campaigns, setCampaigns] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailStats, setShowEmailStats] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const toggleUsers = () => setShowUsers(!showUsers);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);
  const [campaignsData, setCampaignsData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [campaignsStats, setCampaignsStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [currentSentimentPage, setCurrentSentimentPage] = useState(1);
  const [usersPerSentimentPage] = useState(5);
  const [currentUserStatsPage, setCurrentUserStatsPage] = useState(1);
  const [usersPerStatsPage] = useState(5);
  const setUser = useAuthStore(state => state.setUser);
  const { background, textColor } = useAgencySettingsStore();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/agency");
        setUser(response.agency);
      } catch (error) {
        console.error("[Dashboard] Failed to refresh user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (
        dropdownRefUser.current &&
        !dropdownRefUser.current.contains(event.target)
      ) {
        setShowUsers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDatePicker, setShowUsers]);

  // ✅ Multi-select user dropdown with full "All Users" logic
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [appliedUserIds, setAppliedUserIds] = useState([]);

  const handleMultiUserSelect = value => {
    if (value === "all") {
      const allUserEmails = userOptions
        .filter(opt => opt.value !== "all")
        .map(opt => opt.value);

      if (selectedUsers.length === allUserEmails.length) {
        setSelectedUsers([]); // Unselect all
      } else {
        setSelectedUsers(allUserEmails); // Select all
      }
    } else {
      setSelectedUsers(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value],
      );
    }
  };

  const applyUserSelection = async () => {
    setAppliedUserIds(selectedUsers);
    setShowUsers(false);
    const response = await getCampaigns(selectedUsers);
    setCampaigns(response?.campaigns || []);
  };

  useEffect(() => {
    const fetchAgencyUsers = async () => {
      try {
        const res = await getAgencyUsers();
        const users = res?.users || [];
        const options = [
          { label: "All Users", value: "all" },
          ...users.map(u => ({
            label: `${u.first_name || ""} ${u.last_name || ""}`.trim(),
            value: u.email,
          })),
        ];
        const ids = users.map(u => u.email);
        setUserOptions(options);
        setUserData(options);
        setUserIds(ids);
      } catch (err) {
        console.error("Error fetching agency users:", err);
      }
    };

    fetchAgencyUsers();
  }, []);

  useEffect(() => {
    if (!userIds.length) return; // Do nothing until userIds are available

    const fetchUserData = async () => {
      try {
        const response = await getCampaigns(userIds);
        setCampaignsData(response.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      }
    };

    fetchUserData();
  }, [userIds]);

  useEffect(() => {
    if (!userIds.length) return; // Do nothing until userIds are available

    const fetchDashboardStats = async params => {
      const insights = await getUsersWithCampaignsAndStats(params);
      setCampaignsStats(insights);
    };

    const params = {
      userIds: userIds,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };

    fetchDashboardStats(params);
  }, [dateFrom, dateTo, userIds]);

  useEffect(() => {
    if (!userIds.length) return;
    const fetchDashboardStats = async params => {
      const insights = await getInsights(params);
      setDashboardStats(insights);
    };

    const params = {
      userIds: userIds,
      fromDate: dateFrom,
      toDate: dateTo,
      types: ["campaignsRunning", "unreadPositiveConversations", "actions"],
    };

    fetchDashboardStats(params);
  }, [dateFrom, dateTo, userIds]);

  useEffect(() => {
    if (dashboardStats?.actions) {
      buildChartData();
    }
  }, [dashboardStats]);

  function getDailyStatValue(metricData, dateStr) {
    if (!metricData || !metricData.daily) return 0;
    return metricData.daily[dateStr] ?? 0;
  }

  function buildChartData() {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const { lastPeriod, thisPeriod } = dashboardStats?.actions;
    const data = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const row = { date: dateStr };

      metricConfig.forEach(({ key }) => {
        row[key] = getDailyStatValue(thisPeriod?.[key], dateStr);
      });

      data.push(row);
    }

    setChartData(data);
  }
  const changePercentage = (current, prev) => {
    const diffPercent =
      prev > 0 ? Math.round(((current - prev) / prev) * 100) : 0;

    return diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`;
  };
  const parsedDateFrom = new Date(dateFrom);
  const parsedDateTo = new Date(dateTo);

  const campaignsThisPeriod = campaignsData.filter(campaign => {
    const createdAt = new Date(campaign.created_at);
    return createdAt >= parsedDateFrom && createdAt <= parsedDateTo;
  });
  const periodDuration = parsedDateTo.getTime() - parsedDateFrom.getTime();
  const prevDateFrom = new Date(parsedDateFrom.getTime() - periodDuration);
  const prevDateTo = new Date(parsedDateFrom.getTime() - 1);

  const campaignsLastPeriod = campaignsData.filter(campaign => {
    const createdAt = new Date(campaign.created_at);
    return createdAt >= prevDateFrom && createdAt <= prevDateTo;
  });

  const transformCampaignData = stats => {
    return stats.map(user => {
      const statusCounts = {
        Running: 0,
        Paused: 0,
        Fetching: 0,
        Failed: 0,
      };
      if (user.campaigns && Array.isArray(user.campaigns)) {
        user.campaigns.forEach(campaign => {
          if (campaign.status === "running") {
            statusCounts.Running++;
          } else if (campaign.status === "paused") {
            statusCounts.Paused++;
          }
          if (campaign.fetch_status === "pending") {
            statusCounts.Fetching++;
          } else if (campaign.fetch_status === "failed") {
            statusCounts.Failed++;
          }
        });
      }
      return {
        name: `${user.first_name} ${user.last_name}`,
        ...statusCounts,
      };
    });
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = transformCampaignData(campaignsStats).slice(
    indexOfFirstUser,
    indexOfLastUser,
  );
  const totalPages = Math.ceil(campaignsStats.length / usersPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const getPaginationText = () => {
    const startUser = (currentPage - 1) * usersPerPage + 1;
    const endUser = Math.min(
      currentPage * usersPerPage,
      campaignsStats.length,
    );
    return `Users ${startUser}-${endUser}`;
  };
  // Transform sentiment data
  const transformSentimentData = stats => {
    return stats.map(user => {
      const sentimentCounts = {
        Positive:
          user.stats?.actions?.thisPeriod?.conversation_sentiment_positive
            ?.total || 0,
        Negative:
          user.stats?.actions?.thisPeriod?.conversation_sentiment_negative
            ?.total || 0,
        Neutral:
          user.stats?.actions?.thisPeriod?.conversation_sentiment_neutral
            ?.total || 0,
      };

      return {
        name: `${user.first_name} ${user.last_name}`,
        ...sentimentCounts,
      };
    });
  };

  // Add pagination logic for sentiments
  const indexOfLastSentimentUser =
    currentSentimentPage * usersPerSentimentPage;
  const indexOfFirstSentimentUser =
    indexOfLastSentimentUser - usersPerSentimentPage;
  const currentSentimentUsers = transformSentimentData(campaignsStats).slice(
    indexOfFirstSentimentUser,
    indexOfLastSentimentUser,
  );
  const totalSentimentPages = Math.ceil(
    campaignsStats.length / usersPerSentimentPage,
  );

  const handleNextSentimentPage = () => {
    if (currentSentimentPage < totalSentimentPages) {
      setCurrentSentimentPage(currentSentimentPage + 1);
    }
  };

  const handlePrevSentimentPage = () => {
    if (currentSentimentPage > 1) {
      setCurrentSentimentPage(currentSentimentPage - 1);
    }
  };

  const getSentimentPaginationText = () => {
    const startUser = (currentSentimentPage - 1) * usersPerSentimentPage + 1;
    const endUser = Math.min(
      currentSentimentPage * usersPerSentimentPage,
      campaignsStats.length,
    );
    return `Users ${startUser}-${endUser}`;
  };

  // Transform user stats data
  const transformUserStatsData = stats => {
    return stats.map(user => {
      const messagesSent =
        user.stats?.actions?.thisPeriod?.linkedin_message?.total || 0;
      const invitesSent =
        user.stats?.actions?.thisPeriod?.linkedin_invite?.total || 0;
      const invitesAccepted =
        user.stats?.actions?.thisPeriod?.linkedin_invite_accepted?.total || 0;
      const replies =
        user.stats?.actions?.thisPeriod?.linkedin_message_reply?.total || 0;

      // Calculate percentages
      const acceptPercentage =
        invitesSent > 0
          ? ((invitesAccepted / invitesSent) * 100).toFixed(1) + "%"
          : "0%";

      const replyPercentage =
        messagesSent > 0
          ? ((replies / messagesSent) * 100).toFixed(1) + "%"
          : "0%";

      return {
        User: `${user.first_name} ${user.last_name}`,
        Campaigns: user.campaigns?.length || 0,
        "Msgs.sent": messagesSent,
        Invites: invitesSent,
        "Accept %": acceptPercentage,
        "Reply %": replyPercentage,
      };
    });
  };

  // Add pagination logic for user stats
  const indexOfLastStatsUser = currentUserStatsPage * usersPerStatsPage;
  const indexOfFirstStatsUser = indexOfLastStatsUser - usersPerStatsPage;
  const currentStatsUsers = transformUserStatsData(campaignsStats).slice(
    indexOfFirstStatsUser,
    indexOfLastStatsUser,
  );
  const totalStatsPages = Math.ceil(campaignsStats.length / usersPerStatsPage);

  const handleNextStatsPage = () => {
    if (currentUserStatsPage < totalStatsPages) {
      setCurrentUserStatsPage(currentUserStatsPage + 1);
    }
  };

  const handlePrevStatsPage = () => {
    if (currentUserStatsPage > 1) {
      setCurrentUserStatsPage(currentUserStatsPage - 1);
    }
  };

  const getStatsPaginationText = () => {
    const startUser = (currentUserStatsPage - 1) * usersPerStatsPage + 1;
    const endUser = Math.min(
      currentUserStatsPage * usersPerStatsPage,
      campaignsStats.length,
    );
    return `Displaying ${startUser}-${endUser} of ${campaignsStats.length} Users`;
  };

  const convertObjectsToCSV = data => {
    if (!data || data.length === 0) return "";
    const keys = Object.keys(data[0]);
    const header = keys.join(",");
    const rows = data.map(obj =>
      keys.map(k => `"${String(obj[k] ?? "").replace(/"/g, '""')}"`).join(","),
    );
    return [header, ...rows].join("\n");
  };

  const handleDashboardDownload = async () => {
    setShowDownloadModal(true);
    setDownloadProgress(0);
    try {
      // 1. Card summaries
      const cardHeaders = ["Metric,This Period,Last Period"];
      const cardRows = [
        `Campaigns,${campaignsThisPeriod.length},${campaignsLastPeriod.length}`,
        `Message Sent,${
          dashboardStats?.actions?.thisPeriod?.linkedin_message?.total || 0
        },${
          dashboardStats?.actions?.lastPeriod?.linkedin_message?.total || 0
        }`,
        `Reply Rate (avg),${Math.ceil(
          dashboardStats?.actions?.thisPeriod?.linkedin_message_reply?.total /
            (userIds?.length || 1),
        )},${Math.ceil(
          dashboardStats?.actions?.lastPeriod?.linkedin_message_reply?.total /
            (userIds?.length || 1),
        )}`,
        `Invites,${
          dashboardStats?.actions?.thisPeriod?.linkedin_invite?.total || 0
        },${dashboardStats?.actions?.lastPeriod?.linkedin_invite?.total || 0}`,
        `Invites Accept (avg),${Math.ceil(
          dashboardStats?.actions?.thisPeriod?.linkedin_invite_accepted
            ?.total / (userIds?.length || 1),
        )},${Math.ceil(
          dashboardStats?.actions?.lastPeriod?.linkedin_invite_accepted
            ?.total / (userIds?.length || 1),
        )}`,
        `Meetings,${
          dashboardStats?.actions?.thisPeriod
            ?.conversation_sentiment_meeting_booked?.total || 0
        },${
          dashboardStats?.actions?.lastPeriod
            ?.conversation_sentiment_meeting_booked?.total || 0
        }`,
      ];

      // 2. Big graph (chartData)
      const chartHeaders =
        chartData.length > 0 ? Object.keys(chartData[0]).join(",") : "";
      const chartRows = chartData.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(","),
      );

      // 3. Campaign Across Users
      const acrossHeaders =
        currentUsers.length > 0 ? Object.keys(currentUsers[0]).join(",") : "";
      const acrossRows = currentUsers.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(","),
      );

      // 4. Campaign Activity
      const activityHeaders =
        currentSentimentUsers.length > 0
          ? Object.keys(currentSentimentUsers[0]).join(",")
          : "";
      const activityRows = currentSentimentUsers.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(","),
      );

      // 5. User Stats
      const statsHeaders =
        currentStatsUsers.length > 0
          ? Object.keys(currentStatsUsers[0]).join(",")
          : "";
      const statsRows = currentStatsUsers.map(row =>
        Object.values(row)
          .map(v => `"${v}"`)
          .join(","),
      );

      // Compose CSV with section headers
      let csvSections = [];
      csvSections.push("Dashboard Card Summaries");
      csvSections.push(cardHeaders);
      csvSections.push(...cardRows);
      csvSections.push("");
      csvSections.push("Big Graph (MultiMetricChart)");
      if (chartHeaders) csvSections.push(chartHeaders);
      csvSections.push(...chartRows);
      csvSections.push("");
      csvSections.push("Campaign Across Users");
      if (acrossHeaders) csvSections.push(acrossHeaders);
      csvSections.push(...acrossRows);
      csvSections.push("");
      csvSections.push("Campaign Activity");
      if (activityHeaders) csvSections.push(activityHeaders);
      csvSections.push(...activityRows);
      csvSections.push("");
      csvSections.push("User Stats");
      if (statsHeaders) csvSections.push(statsHeaders);
      csvSections.push(...statsRows);

      const finalCsv = csvSections.join("\n");
      const { currentUser: user } = useAuthStore.getState();
      const Name = user?.username?.replace(/\s+/g, "_") || "Agency";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${Name}_dashboard_export_${date}.csv`;
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

  const generateHighQualityPDF = async () => {
    setIsPrinting(true);
    setShowDownloadModal(true);
    setDownloadProgress(5);

    // --- Smooth Progress Helper ---
    let smoothInterval = null;
    const startSmoothProgress = () => {
      if (smoothInterval) clearInterval(smoothInterval);
      smoothInterval = setInterval(() => {
        setDownloadProgress(prev => (prev < 99 ? prev + 1 : prev));
      }, 120); // smooth animation every 120ms
    };
    const stopSmoothProgress = () => {
      if (smoothInterval) clearInterval(smoothInterval);
    };

    startSmoothProgress(); // start animation immediately

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const elements = document.querySelectorAll(".print-section");

      const sectionWeight = 90 / elements.length;

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const originalOverflow = element.style.overflow;
        const originalHeight = element.style.height;
        const originalScrollTop = element.scrollTop;
        const originalWindowScroll = window.scrollY;

        element.style.overflow = "visible";
        element.style.height = "auto";
        element.scrollTop = 0;
        window.scrollTo(0, element.offsetTop);

        const canvas = await html2canvas(element, {
          scale: 1.3,
          useCORS: true,
          backgroundColor: "#ffffff",

          onprogress: percent => {
            const base = i * sectionWeight;
            const activeProgress = base + percent * sectionWeight;
            setDownloadProgress(prev =>
              Math.max(prev, Math.floor(activeProgress)),
            );
          },

          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
          scrollX: 0,
          scrollY: 0,

          onclone: (clonedDoc, clonedElement) => {
            clonedElement.style.overflow = "visible";
            clonedElement.style.height = "auto";
            clonedElement.style.maxHeight = "none";
            clonedElement.style.display = "block";

            let parent = clonedElement.parentElement;
            while (parent) {
              if (
                parent.style.overflow === "hidden" ||
                parent.style.overflow === "scroll" ||
                parent.style.overflow === "auto"
              ) {
                parent.style.overflow = "visible";
              }
              parent = parent.parentElement;
            }

            const toHide = clonedElement.querySelectorAll(
              ".exclude-from-pdf, [data-skip-pdf], .no-print",
            );
            toHide.forEach(el => (el.style.display = "none"));
          },
        });

        element.style.overflow = originalOverflow;
        element.style.height = originalHeight;
        element.scrollTop = originalScrollTop;
        window.scrollTo(0, originalWindowScroll);

        const imgData = canvas.toDataURL("image/jpeg", 0.65);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        const ratio = canvas.height / canvas.width;
        const renderedImgHeight = pdfWidth * ratio;

        if (renderedImgHeight <= pdfPageHeight) {
          if (i > 0) pdf.addPage();
          pdf.addImage(
            imgData,
            "JPEG",
            0,
            0,
            pdfWidth,
            renderedImgHeight,
            undefined,
            "FAST",
          );
        } else {
          const pxPerUnit = canvas.width / pdfWidth;
          const sliceHeightPx = Math.floor(pdfPageHeight * pxPerUnit);

          let remainingHeight = canvas.height;
          let sliceTop = 0;
          let pageIndex = 0;

          while (remainingHeight > 0) {
            const currentSliceHeight = Math.min(
              sliceHeightPx,
              remainingHeight,
            );

            const sliceCanvas = document.createElement("canvas");
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = currentSliceHeight;

            const ctx = sliceCanvas.getContext("2d");
            ctx.drawImage(
              canvas,
              0,
              sliceTop,
              canvas.width,
              currentSliceHeight,
              0,
              0,
              canvas.width,
              currentSliceHeight,
            );

            const sliceImg = sliceCanvas.toDataURL("image/jpeg", 0.65);
            const sliceRatio = currentSliceHeight / canvas.width;
            const slicePdfHeight = pdfWidth * sliceRatio;

            if (i > 0 || pageIndex > 0) pdf.addPage();
            pdf.addImage(
              sliceImg,
              "JPEG",
              0,
              0,
              pdfWidth,
              slicePdfHeight,
              undefined,
              "FAST",
            );

            remainingHeight -= currentSliceHeight;
            sliceTop += currentSliceHeight;
            pageIndex++;
          }
        }
      }

      // --- Stop smooth animation ---
      stopSmoothProgress();

      // Jump smoothly to 100%
      setDownloadProgress(100);
      await new Promise(r => setTimeout(r, 400));

      const { currentUser: user } = useAuthStore.getState();
      const name = user?.username?.replace(/\s+/g, "_") || "Agency";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${name}_dashboard_${date}.pdf`;

      pdf.save(filename);

      setTimeout(() => {
        setShowDownloadModal(false);
        setIsPrinting(false);
        setDownloadProgress(0);
        toast.success("PDF exported successfully");
      }, 600);
    } catch (error) {
      stopSmoothProgress();
      console.error("PDF generation failed:", error);
      setShowDownloadModal(false);
      setIsPrinting(false);
      setDownloadProgress(0);
      toast.error("PDF export failed");
    }
  };

  // Check agency subscription status
  const currentUser = useAuthStore(state => state.currentUser);
  const agencyPaidUntil = currentUser?.paid_until;
  const paidUntilDate = agencyPaidUntil
    ? new Date(agencyPaidUntil + "T00:00:00Z")
    : null;
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const isExpired = paidUntilDate && paidUntilDate < todayDate;

  return (
    <>
      <div
        ref={contentRef}
        className="px-[26px] pt-[45px] pb-[100px] border-b w-full relative print-section"
        style={{
          backgroundColor: background || "transparent",
          color: textColor || "#6D6D6D",
        }}
      >
        {isExpired && (
          <div className="mb-6 p-4 rounded border bg-red-100 border-red-400 text-red-800">
            <p className="font-semibold text-sm">
              Subscription expired on {agencyPaidUntil}. Please renew to
              continue service.
            </p>
            <button
              onClick={() => navigate("/agency/billing")}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Renew Subscription
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between">
          <h1
            className="text-[44px] font-[300]"
            style={{ color: textColor || "#6D6D6D" }}
          >
            Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-4 sm:mt-0 relative exclude-from-pdf">
            <button
              onClick={handleDashboardDownload}
              title="Download dashboard stats CSV"
              className="w-8 h-8 cursor-pointer border border-grey-400 rounded-full flex items-center justify-center bg-[#FFFFFF]"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
            <button
              onClick={generateHighQualityPDF}
              title="Download dashboard stats PDF"
              className="flex items-center gap-2 border border-grey-400 px-2 py-2 bg-[#FFFFFF] rounded-full cursor-pointer"
            >
              <span
                style={{ color: textColor || "#6D6D6D" }}
                className="text-[10px]"
              >
                PDF
              </span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-x-2">
            <p
              className="font-normal text-[28px]"
              style={{ color: textColor || "#6D6D6D" }}
            >
              Agency Stats
            </p>
            <p
              className="font-normal text-[14px]"
              style={{ color: textColor || "#6D6D6D" }}
            >
              (Team-Wide Aggregated Metrics)
            </p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDatePicker}
              className="flex w-[267px] justify-between items-center border border-[#7E7E7E]  px-3 py-2 bg-[#FFFFFF] rounded-[6px] cursor-pointer"
            >
              <CalenderIcon className="w-4 h-4 mr-2" />
              <span className="text-[#6D6D6D] text-[12px]">
                {formattedDateRange}
              </span>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-1 w-64 bg-[#FFFFFF] border border-[#7E7E7E] rounded shadow-md p-4 z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-[#6D6D6D]">From:</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="border border-[#7E7E7E] rounded px-2 py-1 text-sm"
                  />
                  <label className="text-sm text-gray-600 mt-2">To:</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="border border-[#7E7E7E] rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="mt-3 text-sm text-blues hover:underline self-end"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Period Cards Section */}
        <div className="">
          <div className="grid grid-cols-6 gap-5 mt-6">
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Campaigns"
                Topvalue={campaignsThisPeriod.length}
                Lowvalue={campaignsLastPeriod.length}
                change={changePercentage(
                  campaignsThisPeriod.length,
                  campaignsLastPeriod.length,
                )}
                icon={CampaignsIcon1}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Campaigns during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Message Sent"
                Topvalue={
                  dashboardStats?.actions?.thisPeriod?.linkedin_message?.total
                }
                Lowvalue={
                  dashboardStats?.actions?.lastPeriod?.linkedin_message?.total
                }
                change={changePercentage(
                  dashboardStats?.actions?.thisPeriod?.linkedin_message?.total,
                  dashboardStats?.actions?.lastPeriod?.linkedin_message?.total,
                )}
                icon={SequencesIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Message Sent during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Reply Rate (avg)"
                Topvalue={Math.ceil(
                  dashboardStats?.actions?.thisPeriod?.linkedin_message_reply
                    ?.total / (userIds?.length || 1),
                )}
                Lowvalue={Math.ceil(
                  dashboardStats?.actions?.lastPeriod?.linkedin_message_reply
                    ?.total / (userIds?.length || 1),
                )}
                change={changePercentage(
                  Math.ceil(
                    dashboardStats?.actions?.thisPeriod?.linkedin_message_reply
                      ?.total / (userIds?.length || 1),
                  ),
                  Math.ceil(
                    dashboardStats?.actions?.lastPeriod?.linkedin_message_reply
                      ?.total / (userIds?.length || 1),
                  ),
                )}
                icon={RepliesIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the average number of Replies during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Invites"
                Topvalue={
                  dashboardStats?.actions?.thisPeriod?.linkedin_invite?.total
                }
                Lowvalue={
                  dashboardStats?.actions?.lastPeriod?.linkedin_invite?.total
                }
                change={changePercentage(
                  dashboardStats?.actions?.thisPeriod?.linkedin_invite?.total,
                  dashboardStats?.actions?.lastPeriod?.linkedin_invite?.total,
                )}
                icon={InvitesIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the average number of Invites sent during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Invites Accept (avg)"
                Topvalue={Math.ceil(
                  dashboardStats?.actions?.thisPeriod?.linkedin_invite_accepted
                    ?.total / (userIds?.length || 1),
                )}
                Lowvalue={Math.ceil(
                  dashboardStats?.actions?.lastPeriod?.linkedin_invite_accepted
                    ?.total / (userIds?.length || 1),
                )}
                change={changePercentage(
                  Math.ceil(
                    dashboardStats?.actions?.thisPeriod
                      ?.linkedin_invite_accepted?.total /
                      (userIds?.length || 1),
                  ),
                  Math.ceil(
                    dashboardStats?.actions?.lastPeriod
                      ?.linkedin_invite_accepted?.total /
                      (userIds?.length || 1),
                  ),
                )}
                icon={AcceptIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the average number of Invites sent during the selected period during, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
            <div className="col-span-1 row-span-1 relative min-h-[166px] shadow-md bg-[#FFFFFF] rounded-[8px] border border-[#7E7E7E]">
              <PeriodCard
                title="Meetings"
                Topvalue={
                  dashboardStats?.actions?.thisPeriod
                    ?.conversation_sentiment_meeting_booked?.total
                }
                Lowvalue={
                  dashboardStats?.actions?.lastPeriod
                    ?.conversation_sentiment_meeting_booked?.total
                }
                change={changePercentage(
                  dashboardStats?.actions?.thisPeriod
                    ?.conversation_sentiment_meeting_booked?.total,
                  dashboardStats?.actions?.lastPeriod
                    ?.conversation_sentiment_meeting_booked?.total,
                )}
                icon={MeetingIcon}
                bg="bg-[#ffffff]"
              />
              <TooltipInfo
                text="This shows the number of Meetings Booked during the selected period, compared with the previous period. It helps you track outreach activity and consistency."
                className="absolute bottom-2 right-2"
              />
            </div>
          </div>
        </div>
        <div className="mt-[48px]">
          <MultiMetricChart data={chartData} />
        </div>
        <div className="mt-[48px] grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <NotificationsCard notifications={dummyNotifications} />
          </div>
          <div className="col-span-3 flex flex-col gap-y-4 bg-[#FFFFFF] border border-[#7E7E7E] rounded-[8px] shadow-md p-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-x-2">
                <p className="text-base text-[#6D6D6D] font-medium">
                  User Stats
                </p>
                <p className="font-normal text-[12px] text-[#6D6D6D]">
                  (User-Level Breakdown)
                </p>
              </div>
              <div className="flex items-center gap-x-2.5">
                <button
                  onClick={handlePrevStatsPage}
                  disabled={currentUserStatsPage === 1}
                  className={`${
                    currentUserStatsPage === 1
                      ? "text-[#6D6D6D] cursor-not-allowed"
                      : "text-[#6D6D6D] cursor-pointer"
                  }`}
                >
                  <LeftNavigate className="text-[#6D6D6D]" />
                </button>
                <p className="text-[#0387FF] text-xs font-normal">
                  {getStatsPaginationText()}
                </p>
                <button
                  onClick={handleNextStatsPage}
                  disabled={currentUserStatsPage === totalStatsPages}
                  className={`${
                    currentUserStatsPage === totalStatsPages
                      ? "text-[#6D6D6D] cursor-not-allowed"
                      : "text-[#6D6D6D] cursor-pointer"
                  }`}
                >
                  <RightNavigate className="text-[#6D6D6D]" />
                </button>
              </div>
            </div>
            <Table
              headers={headers}
              data={currentStatsUsers}
              rowsPerPage="all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-[#6D6D6D] font-medium">
                Inactivity Tracking
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">Events</p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <LineBarChart />
          </div>
          <div className="w-[540px] bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm text-[#6D6D6D] font-medium">
                Target Tracking (Current week vs last week)
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <LeftNavigate className="text-[#0387FF]" />
                <p className="text-[#0387FF] text-xs font-normal">Replies</p>
                <RightNavigate className="text-[#0387FF]" />
              </div>
            </div>
            <WeeklyLineChart />
          </div> */}
          <div className="w-full bg-[#FFFFFF] p-5 border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-[#6D6D6D] font-medium">
                Campaign Across Users
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`${
                    currentPage === 1
                      ? "text-[#6D6d6d] cursor-not-allowed"
                      : "text-[#0387FF] cursor-pointer"
                  }`}
                >
                  <LeftNavigate className="text-[#6D6D6D]" />
                </button>
                <p className="text-[#0387FF] text-xs font-normal">
                  {getPaginationText()}
                </p>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`${
                    currentPage === totalPages
                      ? "text-[#6D6D6D] cursor-not-allowed"
                      : "text-[#0387FF] cursor-pointer"
                  }`}
                >
                  <RightNavigate className="text-[#6D6D6D]" />
                </button>
              </div>
            </div>
            <HorizontalBarChart data={currentUsers} />
          </div>
          <div className="w-full bg-[#FFFFFF] pt-5 px-5 pb-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base text-[#6D6D6D] font-medium">
                Campaign Activity
              </h2>
              <div className="flex items-center justify-between gap-x-2">
                <button
                  onClick={handlePrevSentimentPage}
                  disabled={currentSentimentPage === 1}
                  className={`${
                    currentSentimentPage === 1
                      ? "text-[#6D6D6D] cursor-not-allowed"
                      : "text-[#0387FF] cursor-pointer"
                  }`}
                >
                  <LeftNavigate className="text-[#6D6D6D]" />
                </button>
                <p className="text-[#0387FF] text-xs font-normal">
                  {getSentimentPaginationText()}
                </p>
                <button
                  onClick={handleNextSentimentPage}
                  disabled={currentSentimentPage === totalSentimentPages}
                  className={`${
                    currentSentimentPage === totalSentimentPages
                      ? "text-[#6D6D6D] cursor-not-allowed"
                      : "text-[#0387FF] cursor-pointer"
                  }`}
                >
                  <RightNavigate className="text-[#6D6D6D]" />
                </button>
              </div>
            </div>
            <VerticalBarChart data={currentSentimentUsers} />
          </div>
        </div>

        <div className="flex items-center justify-between my-[48px]">
          <h1
            className="text-[48px] font-urbanist font-medium"
            style={{ color: textColor || "#6D6D6D" }}
          >
            User Insights
          </h1>
          <div className="relative exclude-from-pdf" ref={dropdownRefUser}>
            <button
              onClick={toggleUsers}
              className="flex w-[223px] justify-between items-center border border-[#7E7E7E] px-3 py-2 bg-[#FFFFFF] rounded-[6px] cursor-pointer"
            >
              <div className="flex items-center gap-x-3">
                <AdminUsersIcon />
                <span className="text-[#7E7E7E] text-[14px] truncate">
                  {selectedUsers.length === 0
                    ? "Select Users"
                    : selectedUsers.length ===
                      userOptions.filter(u => u.value !== "all").length
                    ? "All Users"
                    : selectedUsers.length === 1
                    ? userOptions.find(opt => opt.value === selectedUsers[0])
                        ?.label || selectedUsers[0]
                    : "Multi Select"}
                </span>
              </div>
              <DropArrowIcon className="w-3 h-3 ml-2" />
            </button>
            {showUsers && (
              <div className="absolute right-0 mt-1 w-[223px] bg-[#FFFFFF] border border-[#7E7E7E] rounded-[6px] shadow-md z-10 overflow-hidden">
                <div className="max-h-[120px] overflow-y-auto">
                  {userOptions.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 px-4 py-[6px] hover:bg-[#cccccc] cursor-pointer text-sm text-[#7E7E7E]"
                    >
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={
                          option.value === "all"
                            ? selectedUsers.length ===
                              userOptions.filter(u => u.value !== "all").length
                            : selectedUsers.includes(option.value)
                        }
                        onChange={() => handleMultiUserSelect(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                <div className="flex justify-start border-t border-[#cccccc] px-3 py-2">
                  <button
                    onClick={applyUserSelection}
                    className="text-sm text-[#0387FF] hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {appliedUserIds.length > 0 ? (
          <UserDashboard
            campaigns={campaigns}
            selectedUsers={appliedUserIds}
            userData={userData}
            textColor={textColor}
          />
        ) : (
          <p
            className="text-center text-[20px] exclude-from-pdf"
            style={{ color: textColor || "#6D6D6D" }}
          >
            No users selected
          </p>
        )}
        {showDownloadModal && (
          <ProgressModal
            onClose={() => {
              setShowDownloadModal(false);
              setDownloadProgress(0);
            }}
            title="Export Dashboard Stats PDF"
            action="Abort Process"
            progress={downloadProgress}
          />
        )}
      </div>
    </>
  );
};
export default AgencyDashboard;
