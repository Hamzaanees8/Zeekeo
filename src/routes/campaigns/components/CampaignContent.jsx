import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  CalenderIcon,
  DropArrowIcon,
  DownloadIcon,
  FilterIcon,
} from "../../../components/Icons.jsx";
import Follows from "./graph-cards/Follows.jsx";
import LinkedInSequences from "./graph-cards/LinkedInSequences.jsx";
import Endorsements from "./graph-cards/Endorsements.jsx";
import InMails from "./graph-cards/InMails.jsx";
import AcceptanceRate from "./graph-cards/AcceptanceRate.jsx";
import ProfileViews from "./graph-cards/ProfileViews.jsx";
import Invites from "./graph-cards/Invites.jsx";
import PeriodHeaderActions from "./PeriodHeaderActions.jsx";
import CampaignsTable from "./CampaignsTable.jsx";
import { Link } from "react-router";
import LinkedInMessages from "./graph-cards/LinkedInMessages.jsx";
import { getCurrentUser } from "../../../utils/user-helpers.jsx";
import toast from "react-hot-toast";
import Button from "../../../components/Button.jsx";
import {
  getCampaigns,
  getCampaignsStats,
  streamCampaignProfiles,
} from "../../../services/campaigns.js";
import ProgressModal from "../../../components/ProgressModal.jsx";

export const CampaignContent = () => {
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
  const [activeTab, setActiveTab] = useState("total");
  const [campaign, setCampaign] = useState("All Campaigns");
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTabDays, setActiveTabDays] = useState("7days");
  const [stats, setStats] = useState();

  const [selectedFilter, setSelectedFilter] = useState("All Campaigns");
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadInterval, setDownloadInterval] = useState(null);
  const handleCampaignSelect = option => {
    setCampaign(option);
    setShowCampaigns(false);
  };

  const toggleCampaigns = () => setShowCampaigns(!showCampaigns);
  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const formattedDateRange = `${dateFrom} - ${dateTo}`;
  const user = getCurrentUser();
  const linkedin = user?.accounts?.linkedin;
  const email = user?.accounts?.email;
  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];

  const platforms = [
    {
      name: "LinkedIn",
      color: VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
        ? "bg-approve"
        : "bg-[#f61d00]",
      tooltip: VALID_ACCOUNT_STATUSES.includes(linkedin?.status)
        ? "You have LinkedIn Connected"
        : "You don't have LinkedIn Connected",
    },
    {
      name: "Sales Navigator",
      color: linkedin?.data?.sales_navigator?.contract_id
        ? "bg-approve"
        : "bg-[#f61d00]",
      tooltip: linkedin?.data?.sales_navigator?.contract_id
        ? "Sales Navigator is active"
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dateTo = new Date(); // today
        const dateFrom = new Date();
        dateFrom.setDate(dateTo.getDate() - 7); // 7 days ago

        // Convert both to YYYY-MM-DD format
        const dateFromStr = dateFrom.toISOString().split("T")[0];
        const dateToStr = dateTo.toISOString().split("T")[0];

        console.log("Campaign Stats from:", dateFromStr, "to:", dateToStr);

        const campaignstats = await getCampaignsStats({
          dateFrom: dateFromStr,
          dateTo: dateToStr,
        });

        setStats(campaignstats);
      } catch (err) {
        console.error("Failed to fetch campaigns Stats", err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns Stats");
        }
      }
    };

    fetchStats();
  }, []);
  const getMetricValues = metricKey => {
    if (!stats?.actions?.thisPeriod?.[metricKey]) return { total: 0, max: 0 };

    const { daily, total } = stats.actions.thisPeriod[metricKey];
    const todayStr = new Date().toISOString().split("T")[0];

    if (activeTabDays === "today") {
      return { total: daily?.[todayStr] || 0, max: daily?.[todayStr] || 0 };
    }

    if (activeTabDays === "7days") {
      const counts = Object.values(daily || {});
      return {
        total: counts.reduce((a, b) => a + b, 0),
        max: Math.max(...counts, 0),
      };
    }

    return { total: 0, max: 0 };
  };
  const getLast7DaysMetric = (stats, metricKey) => {
    const today = new Date();
    const daily = stats?.actions?.thisPeriod?.[metricKey]?.daily || {};
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

      data.push({
        date: key,
        count: daily[key] || 0,
      });
    }

    const countsArr = data.map(d => d.count);
    return {
      data,
      max: Math.max(...countsArr, 1), // avoid 0 division
    };
  };

  const getMetricSeries = metricKey => {
    const daily = stats?.actions?.thisPeriod?.[metricKey]?.daily || {};
    const entries = Object.entries(daily).map(([date, count]) => ({
      date,
      count,
    }));

    const sorted = entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    const counts = sorted.map(v => v.count);
    const lastDate = sorted.length ? sorted[sorted.length - 1].date : null; // ✅ last date

    const series = sorted.map(v => ({
      ...v,
      isToday: v.date === lastDate, // mark last available date as "today"
    }));

    return {
      series,
      max: Math.max(...counts, 0),
    };
  };

  const getLast7DaysAcceptance = stats => {
    const today = new Date();
    const invitesDaily =
      stats?.actions?.thisPeriod?.linkedin_invite?.daily || {};
    const acceptedDaily =
      stats?.actions?.thisPeriod?.linkedin_invite_accepted?.daily || {};

    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0]; // YYYY-MM-DD

      data.push({
        date: key,
        invites: invitesDaily[key] || 0,
        accepted: acceptedDaily[key] || 0,
      });
    }

    const invitesArr = data.map(d => d.invites);
    return {
      data,
      max: Math.max(...invitesArr, 1),
    };
  };

  const { data: acceptanceData, max } = getLast7DaysAcceptance(stats);
  const { total: messagesTotal, max: messagesMax } =
    getMetricValues("linkedin_message");
  const { total: inMailsTotal, max: inMailsMax } =
    getMetricValues("linkedin_inmail");
  const { total: followsTotal, max: followsMax } =
    getMetricValues("linkedin_follow");
  const { total: endorsementsTotal, max: endorsementsMax } =
    getMetricValues("linkedin_endorse");
  const { data: profileViewsData, max: profileViewsMax } = getLast7DaysMetric(
    stats,
    "linkedin_view",
  );
  const { data: invitesData, max: invitesMax } = getLast7DaysMetric(
    stats,
    "linkedin_invite",
  );
  const hasAction = (actions, type) => {
    if (!actions) return false;
    return Object.values(actions).some(a => a.type === type && a.success);
  };
  const formatTenure = tenure => {
    if (!tenure) return "";
    const { years = 0, months = 0 } = tenure;
    let parts = [];
    if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
    if (months) parts.push(`${months} mo${months > 1 ? "s" : ""}`);
    return parts.join(" ");
  };

  const getJobStartDate = tenure => {
    if (!tenure) return "";
    return dayjs()
      .subtract(tenure.years || 0, "year")
      .subtract(tenure.months || 0, "month")
      .format("MMM YYYY");
  };
  const exportToCSV = (data, filename = "profiles.csv") => {
    if (!data || !data.length) {
      alert("No data available");
      return;
    }

    // Define your CSV headers
    const headers = [
      "Profile ID",
      "Profile URL",
      "First Name",
      "Last Name",
      "Email",
      "Title",
      "Company",
      "Relationship",
      "Mutuals",
      "Website",
      "Industry",
      "Location",
      "Tenure at Role",
      "Job Start Date",
      "Blacklisted",
      "Skipped",
      "Invited",
      "InMailed",
      "LinkedIn Messaged",
      "Email Messaged",
      "Followed",
      "Liked Post",
      "Replied",
      "Replied At",
      "Campaign ID",
      "Campaign Name",
    ];

    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach(profile => {
      const values = [
        profile.profile_id || "",
        profile.classic_profile_url || profile.sales_profile_url || "",
        profile.first_name || "",
        profile.last_name || "",
        profile.email_address || "",
        profile.work_experience?.[0]?.position ||
          profile.current_positions?.[0]?.role ||
          profile.headline ||
          "",
        profile.work_experience?.[0]?.company ||
          profile.current_positions?.[0]?.company ||
          "",
        profile.network_distance || "",
        profile.shared_connections_count || 0,
        profile.websites?.[0] || "",
        profile.current_positions?.[0]?.industry || "",
        profile.location || profile.current_positions?.[0]?.location || "",
        formatTenure(profile.tenure_at_role) || "",
        getJobStartDate(profile.tenure_at_role) || "",
        profile.blacklisted === true ? "Yes" : "No",
        profile.skip === true ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_invite") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_inmail") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_message") ? "Yes" : "No",
        hasAction(profile.actions, "email_message") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_follow") ? "Yes" : "No",
        hasAction(profile.actions, "linkedin_like_post") ? "Yes" : "No",
        profile.replied_at ? "Yes" : "No",
        profile.replied_at || "",
        profile.campaign_id || "",
        profile.campaign_name || "",
      ];

      const escaped = values.map(val => {
        if (typeof val === "object") val = JSON.stringify(val);
        if (val === null || val === undefined) val = "";
        return `"${val}"`;
      });

      csvRows.push(escaped.join(","));
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownload = async () => {
    setShowProgress(true);
    setProgress(0);

    const user = getCurrentUser();
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours(),
    ).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(
      now.getSeconds(),
    ).padStart(2, "0")}`;

    const fileName =
      `${user.first_name}_${user.last_name}_${timestamp}.csv`.replace(
        /\s+/g,
        "_",
      );

    try {
      const campaigns = await getCampaigns();

      // ✅ Use profiles_count directly
      const totalProfiles = campaigns.reduce(
        (acc, c) => acc + (c.profiles_count || 0),
        0,
      );

      let processed = [];
      let processedCount = 0;

      // process campaigns immediately
      const profilePromises = campaigns.map(async campaign => {
        if (!campaign.profiles_count) return;

        const { profiles } = await streamCampaignProfiles(
          campaign.campaign_id,
          null,
        );

        if (Array.isArray(profiles)) {
          const withCampaignName = profiles.map(p => ({
            ...p,
            campaign_name: campaign.name || "",
          }));

          const chunkSize = Math.ceil(withCampaignName.length / 5);
          let index = 0;

          return new Promise(resolve => {
            const interval = setInterval(() => {
              const chunk = withCampaignName.slice(index, index + chunkSize);

              processed = [...processed, ...chunk];
              processedCount += chunk.length;
              index += chunkSize;

              const percentage = Math.min(
                (processedCount / totalProfiles) * 100,
                100,
              );
              setProgress(Math.round(percentage));

              if (index >= withCampaignName.length) {
                clearInterval(interval);
                resolve();
              }
            }, 200);
          });
        }
      });

      await Promise.all(profilePromises);

      exportToCSV(processed, fileName);
      setTimeout(() => setShowProgress(false), 600);
    } catch (err) {
      console.error("Error fetching campaigns/profiles:", err);
      setShowProgress(false);
    }
  };

  const handleAbort = () => {
    if (downloadInterval) {
      clearInterval(downloadInterval);
      setDownloadInterval(null);
    }
    setShowProgress(false);
  };
  return (
    <>
      <div className="px-[30px] py-[40px] border-b w-full relative">
        <div className="flex items-center gap-[40px] mb-6">
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
        <div className="flex flex-wrap items-center justify-between">
          {/* Heading */}
          <h1 className="text-[48px] font-urbanist text-grey-medium font-medium ">
            Campaigns
          </h1>
          <div className="flex flex-wrap items-center justify-end mt-5 gap-2">
            {linkedin ? (
              <Link
                to="/campaigns/create"
                className="flex items-center gap-2 border rounded-[6px] border-grey px-3 py-2 bg-white text-grey-light text-[16px] font-urbanist leading-[130%]"
              >
                <span className="text-[25px]">+</span> Create Campaign
              </Link>
            ) : (
              <button
                onClick={() =>
                  toast.error(
                    "Please connect your LinkedIn and email accounts to create a campaign",
                  )
                }
                className="flex items-center gap-2 border-[2px] rounded-[6px] border-[#f61d00] px-3 py-2 bg-white text-grey cursor-pointer text-[16px] font-urbanist leading-[130%]"
              >
                <span className="text-[25px]">+</span> Create Campaign
              </button>
            )}

            <div className="flex justify-end">
              <div className="flex items-center bg-[#F1F1F1] border-[1px] border-[#0387FF] rounded-[4px]">
                <Button
                  className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
                    activeTabDays === "7days"
                      ? "bg-[#0387FF] text-white"
                      : "text-[#0387FF] hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTabDays("7days")}
                >
                  7 Days
                </Button>
                <Button
                  className={`px-5 py-2 text-[12px] font-semibold cursor-pointer rounded-[4px] ${
                    activeTabDays === "today"
                      ? "bg-[#0387FF] text-white"
                      : "text-[#0387FF] hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTabDays("today")}
                >
                  Today
                </Button>
              </div>
            </div>
            <button className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white">
              <DownloadIcon className="w-4 h-4" />
            </button>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={toggleFilters}
                className="w-8 h-8 border border-grey-400 rounded-full flex items-center justify-center bg-white"
              >
                <FilterIcon className="w-4 h-4" />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-md z-10 p-3">
                  <p className="text-sm text-gray-700 mb-2">
                    Filters coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="">
          <div className="grid grid-cols-5 gap-6 mt-6">
            <div className="col-span-1 row-span-2 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <AcceptanceRate data={acceptanceData} max={max} />
            </div>
            <div className="col-span-1 border rounded-[8px] shadow-md">
              <LinkedInMessages total={messagesTotal} max={messagesMax} />
            </div>
            <div className="col-span-1 border rounded-[8px] shadow-md">
              <InMails total={inMailsTotal} maxFollows={inMailsMax} />
            </div>
            <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <ProfileViews data={profileViewsData} max={profileViewsMax} />
            </div>
            <div className="col-span-2 row-span-1 border border-[#7E7E7E] rounded-[8px] shadow-md">
              <Invites data={invitesData} max={invitesMax} />
            </div>
            <div className="col-span-1 border rounded-[8px] shadow-md">
              <Follows total={followsTotal} maxFollows={followsMax} />
            </div>
            <div className="col-span-1 border rounded-[8px] shadow-md">
              <Endorsements
                total={endorsementsTotal}
                maxFollows={endorsementsMax}
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PeriodHeaderActions
            activeTab={activeTab}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            setActiveTab={setActiveTab}
            onDownload={handleDownload}
          />
        </div>
        <div className="">
          <CampaignsTable
            selectedFilter={selectedFilter}
            activeTab={activeTab}
            dateFrom={dateFrom}
            dateTo={dateTo}
            linkedin={linkedin}
            email={email}
          />
        </div>
      </div>
      {showProgress && (
        <ProgressModal
          onClose={handleAbort}
          title="Exporting CSV..."
          action="Abort Process"
          progress={progress}
        />
      )}
    </>
  );
};
