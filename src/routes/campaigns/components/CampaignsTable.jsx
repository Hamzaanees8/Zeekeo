import React, { useEffect, useState } from "react";
import {
  ThreeDashIcon,
  PauseIcon,
  PlayIcon,
  GraphIcon,
  PencilIcon,
  DeleteIcon,
  FaceIcon,
  LinkedIn,
  CopyIcon,
  Person2,
  DropArrowIcon,
  Unarchive,
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
import { useRef, useLayoutEffect } from "react";

function useSmoothReorder(list) {
  const positions = useRef(new Map());

  useLayoutEffect(() => {
    const newPositions = new Map();
    positions.current.forEach((prevBox, key) => {
      const domNode = document.querySelector(`[data-row-id="${key}"]`);
      if (!domNode) return;
      const newBox = domNode.getBoundingClientRect();
      const dx = prevBox.left - newBox.left;
      const dy = prevBox.top - newBox.top;

      if (dx || dy) {
        requestAnimationFrame(() => {
          domNode.style.transform = `translate(${dx}px, ${dy}px)`;
          domNode.style.transition = "transform 0s";
          requestAnimationFrame(() => {
            domNode.style.transform = "";
            domNode.style.transition = "transform 300ms ease";
          });
        });
      }
      newPositions.set(key, newBox);
    });

    // save latest positions
    document
      .querySelectorAll("[data-row-id]")
      .forEach(node =>
        newPositions.set(node.dataset.rowId, node.getBoundingClientRect()),
      );

    positions.current = newPositions;
  }, [list]);
}

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
const renderSourceIcon = source => {
  if (source?.profile_urls) {
    return (
      <div className="flex items-center gap-1">
        <Person2 className="w-5 h-5 text-[#7E7E7E]" />
      </div>
    );
  }
  if (source?.filter_url) {
    return (
      <a
        href={source.filter_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1"
      >
        <LinkedIn className="w-5.5 h-5.5" />
      </a>
    );
  }
  if (source?.filter_api) {
    return (
      <div className="flex items-center gap-1">
        <CopyIcon className="w-4.5 h-4.5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <CopyIcon className="w-4.5 h-4.5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
    </div>
  );
};

const STAT_LABELS = {
  linkedin_view: "Views",
  linkedin_invite: "Invites",
  linkedin_invite_accepted: "Accepted",
  linkedin_message: "Messages Sent",
  linkedin_inmail: "InMails",
  linkedin_reply: "Replies",
  linkedin_like_post: "Post Likes",
  linkedin_follow: "Follows",
  linkedin_endorse: "Endorsements",
  email_message: "Emails Sent",
};

// Build array of normalized stats
const buildPeriodStats = (stats, activeTab) => {
  return Object.entries(STAT_LABELS).map(([key, label]) => {
    const statObj = stats[key];
    const value = getStatValue(statObj, activeTab);

    return {
      title: label,
      value,
      info: `These are stats for ${label}`,
    };
  });
};

const CampaignsTable = ({
  activeTab,
  dateFrom = null,
  dateTo = null,
  linkedin,
  selectedFilter,
}) => {
  const [openRow, setOpenRow] = useState(null);
  const [draggedRowIndex, setDraggedRowIndex] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [deleteCampaignId, setDeleteCampignId] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleDragStart = index => {
    setDraggedRowIndex(index);
  };

  const handleDragOver = e => {
    e.preventDefault(); // ✅ Required so drop will work
  };

  const handleDrop = async index => {
    if (draggedRowIndex === null) return;

    const updated = [...campaigns];
    const [movedCampaign] = updated.splice(draggedRowIndex, 1);
    updated.splice(index, 0, movedCampaign);

    setCampaigns(updated);
    setDraggedRowIndex(null);

    // Update priority on backend
    try {
      // You can send the entire array or just the moved campaign with its new position
      await Promise.all(
        updated.map((c, idx) =>
          updateCampaign(c.campaign_id, { priority: idx + 1 }),
        ),
      );
      toast.success("Campaign priority updated");
    } catch (err) {
      console.error("Failed to update campaign priority", err);
      toast.error("Failed to update campaign priority");
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaignsRes = await getCampaigns();

        console.log("fetching campaigns...");
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
        campaignsWithStats.sort((a, b) => {
          if (a.priority == null && b.priority == null) return 0;
          if (a.priority == null) return 1;
          if (b.priority == null) return -1;
          return a.priority - b.priority;
        });
        setCampaigns(campaignsWithStats);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaigns");
        }
      }
    };

    fetchCampaigns();
  }, []);
  console.log("campaigns...", campaigns);
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
        if (err?.response?.status !== 401) {
          toast.error("Failed to fetch campaign stats");
        }
      }
    }

    setOpenRow(campaignId);
  };

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
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to update campaign status");
      }
    }
  };
  const handleArchiveCampaign = async campaignId => {
    try {
      await updateCampaign(campaignId, { status: "archived" });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId ? { ...c, status: "archived" } : c,
        ),
      );

      toast.success("Campaign archived Successfully");
      setDeleteCampignId(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to archive campaign");
      }
      console.error(err);
    }
  };
  const handleUnarchive = async campaignId => {
    try {
      await updateCampaign(campaignId, { status: "paused" });

      setCampaigns(prev =>
        prev.map(c =>
          c.campaign_id === campaignId ? { ...c, status: "paused" } : c,
        ),
      );

      toast.success("Campaign unarchived Successfully");
      setDeleteCampignId(null);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to unarchive campaign");
      }
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
      if (err?.response?.status !== 401) {
        toast.error("Failed to delete campaign");
      }
      console.error(err);
    }
  };
  const totalRows = campaigns.length;
  useSmoothReorder(campaigns);
  const filteredCampaigns = campaigns.filter(c => {
    if (selectedFilter === "All Campaigns") return true;
    if (selectedFilter === "Paused") return c.status === "paused";
    if (selectedFilter === "Running") return c.status === "running";
    if (selectedFilter === "Archived") return c.status === "archived";
    return true;
  });

  return (
    <div className="border border-[#7E7E7E] rounded-[8px] overflow-hidden shadow-md max-h-[650px] overflow-y-auto custom-scroll">
      <table className="w-full   bg-white">
        <thead className="text-left font-poppins mb-[16px]">
          <tr className="text-[16px] text-[#6D6D6D] border-b border-b-[#00000020]">
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]"></th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]"></th>
            <th className="px-2 pt-[10px] !font-[400] pb-[10px]">#</th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]">Campaign</th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]">Sources</th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Profiles
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Invites
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Acceptance Rate %
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Response Rate %
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              <div className="flex items-center gap-x-2.5">
                <FaceIcon className="fill-[#1FB33F]" />
                <p>Responses</p>
              </div>
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px] text-center">
              Status
            </th>
            <th className="px-3 pt-[10px] !font-[400] pb-[10px]">Actions</th>
          </tr>
        </thead>
        {filteredCampaigns?.map((row, index) => {
          const stats = row.campaignStats || {};
          return (
            <React.Fragment key={row.campaign_id}>
              <tr
                data-row-id={row.campaign_id}
                className={`font-normal text-[12px] text-[#454545] ${
                  openRow === row.campaign_id
                    ? "border-b-0"
                    : "border-b border-[#00000020]"
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
              >
                <td className="px-4 py-2 cursor-grab">
                  <div className="flex justify-center items-center">
                    <ThreeDashIcon className="w-5 h-5 text-gray-600" />
                  </div>
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => toggleRow(row.campaign_id)}
                    className="cursor-pointer"
                  >
                    <DropArrowIcon className="w-3 h-3 text-gray-600" />
                  </button>
                </td>
                <td className="px-2 py-2 text-center">{index + 1}</td>
                <td className="px-4 py-2 max-w-[200px]">{row.name}</td>
                <td className="px-4 py-2 text-center">
                  <div className="flex items-center justify-center">
                    {renderSourceIcon(row.source)}
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{row.profiles_count}</td>
                <td className="px-4 py-2 text-center">
                  {getStatValue(stats?.linkedin_invite, activeTab)}
                </td>
                <td className="px-4 py-2 text-center relative group">
                  {(() => {
                    const invites = getStatValue(
                      stats?.linkedin_invite,
                      activeTab,
                    );
                    const accepted = getStatValue(
                      stats?.linkedin_invite_accepted,
                      activeTab,
                    );
                    if (invites === 0) return "0%";
                    return ((accepted / invites) * 100).toFixed(1) + "%";
                  })()}

                  <div
                    className={`absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10 left-1/2 -translate-x-1/2 whitespace-nowrap shadow text-left
      ${index >= totalRows / 2 ? "bottom-full" : "top-full"}`}
                  >
                    <div className="font-semibold text-[11px] mb-1 flex items-center">
                      Acceptance:&nbsp;
                      {(() => {
                        const invites = getStatValue(
                          stats?.linkedin_invite,
                          activeTab,
                        );
                        const accepted = getStatValue(
                          stats?.linkedin_invite_accepted,
                          activeTab,
                        );
                        if (invites === 0) return "0%";
                        return ((accepted / invites) * 100).toFixed(1) + "%";
                      })()}
                    </div>
                    <div>
                      {getStatValue(stats?.linkedin_invite, activeTab)} Invited
                    </div>
                    <div>
                      {getStatValue(
                        stats?.linkedin_invite_accepted,
                        activeTab,
                      )}{" "}
                      Accepted
                    </div>
                  </div>
                </td>

                <td className="px-4 py-2 text-center">
                  <div className="relative inline-block group">
                    {(() => {
                      const linkedinMessages = getStatValue(
                        stats?.linkedin_message,
                        activeTab,
                      );
                      const linkedinReplies = getStatValue(
                        stats?.linkedin_reply,
                        activeTab,
                      );
                      const emailMessages = getStatValue(
                        stats?.email_message,
                        activeTab,
                      );
                      const emailReplies = getStatValue(
                        stats?.email_reply,
                        activeTab,
                      );

                      const totalMessages = linkedinMessages + emailMessages;
                      const totalReplies = linkedinReplies + emailReplies;

                      if (totalMessages === 0) return "0%";
                      return (
                        ((totalReplies / totalMessages) * 100).toFixed(1) + "%"
                      );
                    })()}
                    <div
                      className={`absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10 left-1/2 -translate-x-1/2 whitespace-nowrap shadow text-left
                          ${
                            index >= totalRows / 2
                              ? "bottom-full mb-2"
                              : "top-full mt-2"
                          }`}
                    >
                      <div className="mb-2">
                        <div className="font-semibold text-[12px] mb-1">
                          LinkedIn (
                          {(() => {
                            const msgs = getStatValue(
                              stats?.linkedin_message,
                              activeTab,
                            );
                            const replies = getStatValue(
                              stats?.linkedin_reply,
                              activeTab,
                            );
                            if (msgs === 0) return "0%";
                            return ((replies / msgs) * 100).toFixed(1) + "%";
                          })()}
                          )
                        </div>
                        <div>
                          {getStatValue(stats?.linkedin_message, activeTab)}{" "}
                          Contacted
                        </div>
                        <div>
                          {getStatValue(stats?.linkedin_reply, activeTab)}{" "}
                          Responded
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-[12px] mb-1">
                          Email (
                          {(() => {
                            const msgs = getStatValue(
                              stats?.email_message,
                              activeTab,
                            );
                            const replies = getStatValue(
                              stats?.email_reply,
                              activeTab,
                            );
                            if (msgs === 0) return "0%";
                            return ((replies / msgs) * 100).toFixed(1) + "%";
                          })()}
                          )
                        </div>
                        <div>
                          {getStatValue(stats?.email_message, activeTab)}{" "}
                          Emails
                        </div>
                        <div>
                          {getStatValue(stats?.email_reply, activeTab)} Replied
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-center relative group">
                  {(() => {
                    const positive = getStatValue(
                      stats?.conversation_sentiment_positive,
                      activeTab,
                    );
                    const neutral = getStatValue(
                      stats?.conversation_sentiment_neutral,
                      activeTab,
                    );
                    const negative = getStatValue(
                      stats?.conversation_sentiment_negative,
                      activeTab,
                    );

                    const total = positive + neutral + negative;
                    if (total === 0) return "0%";

                    return ((positive / total) * 100).toFixed(1) + "%";
                  })()}
                  <div
                    className={`absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 z-10 left-1/2 -translate-x-1/2 whitespace-nowrap shadow text-left
      ${index >= totalRows / 2 ? "bottom-full" : "top-full"}`}
                  >
                    {(() => {
                      const positive = getStatValue(
                        stats?.conversation_sentiment_positive,
                        activeTab,
                      );
                      const neutral = getStatValue(
                        stats?.conversation_sentiment_neutral,
                        activeTab,
                      );
                      const negative = getStatValue(
                        stats?.conversation_sentiment_negative,
                        activeTab,
                      );
                      const total = positive + neutral + negative;

                      if (total === 0) return "0 Positives (0%)";

                      return `${positive} Positives  (${(
                        (positive / total) *
                        100
                      ).toFixed(1)}%)`;
                    })()}
                  </div>
                </td>

                <td className="px-4 py-2 text-center">
                  {linkedin ? (
                    <button
                      className={`text-xs px-3 w-[80px] py-1 text-white rounded-[10px] ${
                        row.fetch_status === "pending"
                          ? "bg-[#0387FF]"
                          : row.status === "running"
                          ? "bg-[#25C396]"
                          : row.status === "paused"
                          ? "bg-gray-400"
                          : row.status === "archived"
                          ? "bg-gray-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {row.fetch_status === "pending"
                        ? "Fetching"
                        : row.status === "running"
                        ? "Running"
                        : row.status === "paused"
                        ? "Paused"
                        : row.status === "archived"
                        ? "Archived"
                        : "Unknown"}
                    </button>
                  ) : (
                    <button className="text-xs px-3 w-[120px] py-1 text-white rounded-[10px] bg-[#f61d00]">
                      Disconnected
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    {linkedin &&
                      row.fetch_status !== "pending" &&
                      row.status !== "archived" && (
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
                          <span className="w-[100px] text-center absolute top-[-5px] right-0 -translate-y-full translate-x-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {row.status === "running" ? "Running" : "Paused"}
                          </span>
                        </div>
                      )}

                    <div className="relative group">
                      <button
                        onClick={() => toggleRow(row.campaign_id)}
                        className="rounded-full bg-white cursor-pointer p-[2px] border border-[#0077B6]"
                      >
                        <GraphIcon className="w-4 h-4 fill-[#0077B6]" />
                      </button>

                      {/* Tooltip */}
                      <span className="w-[100px] text-center absolute top-[-5px] right-7 -translate-y-full translate-x-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    {row.status === "archived" && (
                      <div className="relative group">
                        <button
                          onClick={() => handleUnarchive(row.campaign_id)}
                          className="rounded-full bg-white cursor-pointer p-[2px] border border-[#03045E]"
                        >
                          <Unarchive className="w-4 h-4 fill-[#03045E]" />
                        </button>

                        {/* Tooltip */}
                        <span className="w-[100px] text-center absolute top-[-5px] right-7 -translate-y-full translate-x-full bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Unarchive
                        </span>
                      </div>
                    )}
                    <div className="relative group inline-block">
                      <button
                        onClick={() => {
                          setDeleteCampignId(row.campaign_id);
                          setStatus(row.status);
                        }}
                        className="rounded-full bg-white cursor-pointer p-[2px] border border-[#D80039]"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>

                      {/* Tooltip */}
                      <span className="absolute -top-7 left-[-20px] -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Delete Campaign
                      </span>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Expanded Row */}
              {openRow === row.campaign_id && (
                <tr className="border-b border-[#00000020]">
                  <td colSpan="12" className="px-4 py-3">
                    <div className="grid grid-cols-10 grid-rows-1 gap-3 mt-3">
                      {buildPeriodStats(stats, activeTab).map((stat, idx) => (
                        <div
                          key={`${row.campaign_id}-${stat.title}`}
                          className="bg-[#EFEFEF] p-2 relative shadow border border-[#00000020] rounded-[4px]"
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
          onArchive={() => handleArchiveCampaign(deleteCampaignId)}
          onUnarchive={() => handleUnarchive(deleteCampaignId)}
          status={status}
        />
      )}
    </div>
  );
};

export default CampaignsTable;
