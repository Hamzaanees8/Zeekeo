import React, { useEffect, useState } from "react";
import TableWrapper from "../../../components/TableWrapper";
import {
  ThreeDashIcon,
  PauseIcon,
  PlayIcon,
  GraphIcon,
  PencilIcon,
  DeleteIcon,
} from "../../../components/Icons.jsx";
import PeriodCard from "./PeriodCard.jsx";
import TooltipInfo from "../../../components/TooltipInfo.jsx";
import { useNavigate } from "react-router";
import {
  deleteCampaign,
  getCampaigns,
  getCampaignStats,
  updateCampaign,
} from "../../../services/campaigns.js";
import toast from "react-hot-toast";
import DeleteModal from "./DeleteModal.jsx";

// Utility to get value depending on tab
const getStatValue = (statObj, mode = "total") => {
  if (!statObj) return 0;

  if (mode === "total") {
    return statObj.total ?? 0;
  }

  if (mode === "24h") {
    const now = new Date();
    const cutoff = now.getTime() - 24 * 60 * 60 * 1000;

    return Object.entries(statObj.hourly || {}).reduce(
      (sum, [dateHour, val]) => {
        const [year, month, day, hour] = dateHour.split("-").map(Number);
        const statDate = new Date(year, month - 1, day, hour).getTime();
        console.log("log datetime..", statDate);
        return statDate >= cutoff ? sum + val : sum;
      },
      0,
    );
  }

  return 0;
};

const STAT_LABELS = {
  linkedin_view: "Views",
  linkedin_invite: "Invites",
  linkedin_invite_accepted: "Accepted",
  linkedin_message: "Messages",
  linkedin_inmail: "InMails",
  linkedin_reply: "Replies",
  linkedin_like_post: "Post Likes",
  linkedin_follow: "Follows",
  linkedin_endorse: "Endorsements",
  // email_message: "Email Sequences",
};

// Build array of normalized stats
const buildPeriodStats = (stats, activeTab) => {
  return Object.entries(STAT_LABELS).map(([key, label]) => {
    const statObj = stats[key];
    const value = getStatValue(statObj, activeTab);

    return {
      title: label,
      value,
      info: "Sample stat info",
    };
  });
};

const CampaignsTable = ({ activeTab, dateFrom = null, dateTo = null }) => {
  const [openRow, setOpenRow] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [deleteCampaignId, setDeleteCampignId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsRes = await getCampaigns();

        // fetch stats for each campaign
        const campaignsWithStats = await Promise.all(
          campaignsRes.map(async c => {
            try {
              const stats = await getCampaignStats({
                campaignId: c.campaign_id,
                startDate: dateFrom,
                endDate: dateTo,
              });
              return { ...c, campaignStats: stats || {} };
            } catch (err) {
              console.error(
                "Failed to fetch stats for campaign",
                c.campaign_id,
                err,
              );
              return { ...c, campaignStats: {} }; // fail-safe
            }
          }),
        );

        setCampaigns(campaignsWithStats);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        toast.error("Failed to fetch campaigns");
      }
    };

    fetchCampaigns();
  }, []);

  // Fetch stats for a single campaign when row toggles
  const toggleRow = async campaignId => {
    if (openRow === campaignId) {
      setOpenRow(null);
      return;
    }

    // optional: refetch stats if needed (e.g. to refresh)
    if (!campaigns.find(c => c.campaign_id === campaignId)?.campaignStats) {
      try {
        const stats = await getCampaignStats({
                campaignId,
                startDate: dateFrom,
                endDate: dateTo,
              });
        setCampaigns(prev =>
          prev.map(c =>
            c.campaign_id === campaignId
              ? { ...c, campaignStats: stats || {} }
              : c,
          ),
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch campaign stats");
      }
    }

    setOpenRow(campaignId);
  };
  /* 
  useEffect(() => {
    if (openRow) {
      setData(prev =>
        prev.map(c =>
          c.campaign_id === openRow
            ? {
                ...c,
                periodStats: Object.entries(campaignStats).map(
                  ([key, value]) => {
                    let statValue = 0;
                    if (activeTab === "total") statValue = value.total;
                    else if (activeTab === "24h") {
                      const now = new Date();
                      statValue = Object.entries(value.hourly)
                        .filter(([dateHour]) => {
                          const [year, month, day, hour] = dateHour
                            .split("-")
                            .map(Number);
                          const statDate = new Date(
                            year,
                            month - 1,
                            day,
                            hour,
                          );
                          return now - statDate <= 24 * 60 * 60 * 1000;
                        })
                        .reduce((sum, [, val]) => sum + val, 0);
                    }

                    return {
                      title: key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, l => l.toUpperCase()),
                      value: statValue.toString(),
                      info: "Sample stat info",
                    };
                  },
                ),
              }
            : c,
        ),
      );
    }
  }, [activeTab]); */

  /*   useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getCampaigns();
        setData(data);
      } catch (err) {
        toast.error("Failed to Load data");
      }
    };

    fetchCampaigns();
  }, []); */

  // Update status handler
  const toggleStatus = async campaignId => {
    try {
      const current = campaigns.find(c => c.campaign_id === campaignId);
      const newStatus = current?.status === "running" ? "paused" : "running";

      await updateCampaign(campaignId, { status: newStatus });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId ? { ...c, status: newStatus } : c,
        ),
      );

      toast.success("Status updated");
    } catch {
      toast.error("Failed to update campaign status");
    }
  };

  // Delete handler
  const handleDeleteCampaign = async () => {
    if (!deleteCampaignId) return;
    try {
      await deleteCampaign(deleteCampaignId);
      toast.success("Campaign deleted successfully");
      setCampaigns(prev =>
        prev.filter(c => c.campaign_id !== deleteCampaignId),
      );
      setDeleteCampignId(null);
    } catch (err) {
      toast.error("Failed to delete campaign");
      console.error(err);
    }
  };

  return (
    <>
      <table className="w-full">
        <thead className="text-left font-poppins mb-[16px]">
          <tr className="text-[16px] text-[#6D6D6D]">
            <th className="px-3 pt-[10px] !font-[400]"></th>
            <th className="px-3 pt-[10px] !font-[400]">#</th>
            <th className="px-3 pt-[10px] !font-[400]">Campaign</th>
            <th className="px-3 pt-[10px] !font-[400] text-center">Views</th>
            <th className="px-3 pt-[10px] !font-[400] text-center">
              Profiles
            </th>
            <th className="px-3 pt-[10px] !font-[400] text-center">
              Acceptance
            </th>
            <th className="px-3 pt-[10px] !font-[400] text-center">
              Response
            </th>
            <th className="px-3 pt-[10px] !font-[400] text-center">Status</th>
            <th className="px-3 pt-[10px] !font-[400]">Actions</th>
          </tr>
        </thead>
        {campaigns.map((row, index) => {
          const stats = row.campaignStats || {};
          return (
            <React.Fragment key={row.campaign_id}>
              <tr
                className={`font-normal text-[12px] text-[#454545] ${
                  openRow === row.campaign_id
                    ? "border-b-0"
                    : "border-b border-[#00000020]"
                }`}
              >
                <td className="px-4 py-2 ">
                  <button
                    onClick={() => toggleRow(row.campaign_id)}
                    className="cursor-pointer"
                  >
                    <ThreeDashIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 text-center">
                  {getStatValue(stats?.linkedin_view, activeTab)}
                </td>
                <td className="px-4 py-2 text-center">
                  {getStatValue(stats?.fetch_profiles, activeTab)}
                </td>
                <td className="px-4 py-2 text-center">
                  {getStatValue(stats?.linkedin_invite_accepted, activeTab)}
                </td>
                <td className="px-4 py-2 text-center">
                  {getStatValue(stats?.linkedin_reply, activeTab)}
                </td>

                <td className="px-4 py-2 text-center">
                  <button
                    className={`text-xs px-3 w-[80px] py-1 text-white ${
                      row.status === "running"
                        ? "bg-[#25C396]"
                        : "bg-[#0077B6]"
                    }`}
                  >
                    {row.status === "running" ? "Running" : "Paused"}
                  </button>
                </td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <div className="relative group">
                    <button
                      className={`rounded-full p-[2px] bg-white cursor-pointer border ${
                        row.status === "running"
                          ? "border-[#16A37B]"
                          : "border-[#03045E]"
                      }`}
                      onClick={() => toggleStatus(row.campaign_id)}
                    >
                      {row.status === "running" ? (
                        <PlayIcon className="w-4 h-4 fill-[#16A37B]" />
                      ) : (
                        <PauseIcon className="w-4 h-4 fill-[#03045E]" />
                      )}
                    </button>

                    {/* Tooltip */}
                    <span className="w-[100px] text-center absolute top-0 right-0 -translate-y-full translate-x-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {row.status === "running" ? "Running" : "Paused"}
                    </span>
                  </div>

                  <div className="relative group">
                    <button className="rounded-full bg-white cursor-pointer p-[2px] border border-[#0077B6]">
                      <GraphIcon className="w-4 h-4 fill-[#0077B6]" />
                    </button>

                    {/* Tooltip */}
                    <span className="w-[100px] text-center absolute top-0 right-0 -translate-y-full translate-x-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Graph Stats
                    </span>
                  </div>

                  <div className="relative group inline-block">
                    <button
                      onClick={() =>
                        navigate(`/campaigns/edit/${row.campaign_id}`)
                      }
                      className="rounded-full bg-white cursor-pointer p-[2px] border border-[#12D7A8]"
                    >
                      <PencilIcon className="w-4 h-4 fill-[#12D7A8]" />
                    </button>

                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Edit Campaign
                    </span>
                  </div>
                  <div className="relative group inline-block">
                    <button
                      onClick={() => setDeleteCampignId(row.campaign_id)}
                      className="rounded-full bg-white cursor-pointer p-[2px] border border-[#D80039]"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>

                    {/* Tooltip */}
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Delete Campaign
                    </span>
                  </div>
                </td>
              </tr>

              {/* Expanded Row */}
              {openRow === row.campaign_id && (
                <tr className="border-b border-[#00000020]">
                  <td colSpan="9" className="px-4 py-3">
                    <div className="grid grid-cols-9 grid-rows-1 gap-3 mt-3">
                      {buildPeriodStats(stats, activeTab).map((stat, idx) => (
                        <div
                          key={`${row.campaign_id}-${stat.title}`}
                          className="bg-white p-2 relative"
                        >
                          <PeriodCard title={stat.title} value={stat.value} />
                          <TooltipInfo
                            text={stat.info}
                            className="absolute bottom-2 right-2"
                            isLast={idx === stats.length - 1}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </table>
      {deleteCampaignId && (
        <DeleteModal
          onClose={() => setDeleteCampignId(null)}
          onClick={handleDeleteCampaign}
        />
      )}
    </>
  );
};

export default CampaignsTable;
