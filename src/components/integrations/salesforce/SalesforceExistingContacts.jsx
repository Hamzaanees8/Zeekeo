import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getSalesforceContacts } from "../../../services/integrations";
import { createCampaign } from "../../../services/campaigns";
import { getCurrentUser } from "../../../utils/user-helpers";
import CampaignNameModal from "../CampaignNameModal";

export default function SalesforceExistingContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(null);
  const [nowPageLoading, setNowPageLoading] = useState(false);

  const PAGE_LIMIT = 50;

  // For selection and campaign creation
  const [selectedContactIds, setSelectedContactIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);

  const navigate = useNavigate();

  // Memoized contact data for campaign logic
  const selectableContacts = useMemo(
    () => contacts.filter((c) => c.linkedin_profile),
    [contacts],
  );
  const selectedCampaignContacts = useMemo(
    () => selectableContacts.filter((c) => selectedContactIds.has(c.id)),
    [selectableContacts, selectedContactIds],
  );
  const profileUrls = useMemo(
    () =>
      selectedCampaignContacts
        .map((c) => c.linkedin_profile)
        .filter((url) => url),
    [selectedCampaignContacts],
  );
  const isCreateCampaignEnabled = profileUrls.length > 0;

  const fetchContacts = async (offsetToFetch = 0, append = false) => {
    try {
      setLoading(!append);
      setNowPageLoading(append);

      const queryParams = {
        limit: PAGE_LIMIT,
        offset: offsetToFetch,
      };

      const data = await getSalesforceContacts(queryParams);

      if (data.success) {
        setContacts((prev) =>
          append ? [...prev, ...data.contacts] : data.contacts,
        );
        setCurrentOffset(offsetToFetch);
        setTotalRecords(data.totalSize); // Set the total records found
      }
    } catch (err) {
      console.error("Error loading Salesforce contacts", err);
    } finally {
      setLoading(false);
      setNowPageLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const hasMoreRecords =
    totalRecords !== null && currentOffset + contacts.length < totalRecords;
  const nextOffset = currentOffset + PAGE_LIMIT;

  // Selection Handlers
  const handleSelectContact = (contactId, hasProfileUrl, isChecked) => {
    if (!hasProfileUrl) {
      toast.error(
        "Only contacts with a LinkedIn profile URL can be selected for the campaign.",
      );
      return;
    }

    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(contactId);
      } else {
        newSet.delete(contactId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isChecked) => {
    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        selectableContacts.forEach((c) => newSet.add(c.id));
      } else {
        newSet.clear();
      }
      return newSet;
    });
  };

  const isAllSelected =
    selectedCampaignContacts.length > 0 &&
    selectedCampaignContacts.length === selectableContacts.length;

  const handleCreateCampaign = async (campaignName) => {
    setIsCreatingCampaign(true);
    setIsModalOpen(false);

    const currentUser = getCurrentUser();
    const hasSchedule =
      currentUser?.settings?.schedule?.days &&
      Object.keys(currentUser.settings.schedule.days).length > 0;

    const campaignData = {
      campaign: {
        name: campaignName,
        source: {
          profile_urls: true,
        },
        settings: {
          include_first_degree_connections_only: false,
          exclude_first_degree_connections: true,
          exclude_past_campaigns_targets: true,
          exclude_replied_profiles: false,
          split_open: false,
          import_open_only: false,
        },
        ...(hasSchedule && { schedule: currentUser.settings.schedule }),
        workflow: {},
      },
      profile_urls: profileUrls,
    };

    try {
      const response = await createCampaign(campaignData);

      if (response?.campaign_id) {
        toast.success(
          `Campaign '${campaignName}' created successfully! Please add your workflow and schedule.`,
        );
        setSelectedContactIds(new Set());
        navigate(`/campaigns/edit/${response.campaign_id}`, {
          replace: true,
        });
      } else {
        toast.error(response?.message || "Failed to create campaign.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to save campaign.";
      if (err?.response?.status !== 401) {
        toast.error(msg);
      }
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleOpenModal = () => {
    if (isCreateCampaignEnabled) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <CampaignNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCampaign}
        isLoading={isCreatingCampaign}
      />

      <div className="card card-custom shadow-md rounded-xl border border-gray-200 p-4 bg-white">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Salesforce Contacts
            </h2>
            <button
              onClick={handleOpenModal}
              disabled={!isCreateCampaignEnabled || isCreatingCampaign}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition duration-150 ${
                isCreateCampaignEnabled && !isCreatingCampaign
                  ? "bg-[#0387FF] cursor-pointer"
                  : "bg-[#0387FF] cursor-not-allowed"
              }`}
            >
              {isCreatingCampaign ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : null}
              Create Campaign ({profileUrls.length} selected)
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-600"></i>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-200 rounded-md">
                {/* Table Head */}
                <thead className="bg-gray-50 text-gray-700 text-sm">
                  <tr>
                    <th className="p-2 text-center w-[30px]"></th>
                    <th className="p-2 w-[40px] text-center">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={isAllSelected}
                        disabled={selectableContacts.length === 0}
                      />
                    </th>
                    <th className="p-2 text-center w-[100px]">Assigned?</th>
                    <th className="p-2 text-center w-[100px]">LinkedIn</th>
                    <th className="p-2 text-left">First Name</th>
                    <th className="p-2 text-left">Last Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Company</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {contacts.length > 0 ? (
                    contacts.map((c, i) => {
                      const hasProfile = !!c.linkedin_profile;
                      const isSelected = selectedContactIds.has(c.id);

                      return (
                        <tr
                          key={c.id || i}
                          className="hover:bg-gray-50 text-sm border-t"
                        >
                          <td></td>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) =>
                                handleSelectContact(
                                  c.id,
                                  hasProfile,
                                  e.target.checked,
                                )
                              }
                              disabled={!hasProfile}
                              title={
                                !hasProfile
                                  ? "Requires LinkedIn profile to select"
                                  : ""
                              }
                            />
                          </td>
                          <td className="text-center">
                            {c.z2_campaigns_id ? (
                              <span className="text-green-600 font-medium">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="text-center">
                            {hasProfile ? (
                              <a
                                href={c.linkedin_profile}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline"
                              >
                                Profile
                              </a>
                            ) : (
                              <span
                                className="text-red-500 font-medium"
                                title="Required for campaign"
                              >
                                -
                              </span>
                            )}
                          </td>
                          <td className="p-2">{c.first_name || "-"}</td>
                          <td className="p-2">{c.last_name || "-"}</td>
                          <td className="p-2">{c.email || "-"}</td>
                          <td className="p-2">{c.title || "-"}</td>
                          <td className="p-2">{c.company || "-"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="text-center py-4 text-gray-500"
                      >
                        No contacts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Load more */}
              {contacts.length > 0 && (
                <div className="flex justify-center py-4">
                  {nowPageLoading ? (
                    <i className="fas fa-spinner fa-spin text-gray-600"></i>
                  ) : hasMoreRecords ? (
                    <button
                      onClick={() => fetchContacts(nextOffset, true)}
                      className="btn btn-primary px-4 py-2 text-sm font-medium text-[#0277e5] rounded-md bg-white hover:bg-white border border-[#0277e5] cursor-pointer"
                    >
                      Load More Contacts
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      All contacts loaded
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
