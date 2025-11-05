import { createContext, useContext, useEffect, useState } from "react";
import {
  getCampaign,
  getCampaignStats,
  streamCampaignProfiles,
} from "../../../../services/campaigns";
import { GetActiveSubscription } from "../../../../services/billings";

const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [subscribedPlanId, setSubscribedPlanId] = useState("");
  const [editId, setEditId] = useState(null);
  const [stats, setStats] = useState([]);
  const [status, setStatus] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [source, setSource] = useState("");
  const [profileUrls, setProfileUrls] = useState([]);
  const [workflow, setWorkflow] = useState({});
  const [nodes, setNodes] = useState({});
  const [schedule, setSchedule] = useState({});
  const [editStatus, setEditStatus] = useState(false); // Only keep editStatus state
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const [settings, setSettings] = useState({
    exclude_first_degree_connections: false,
    exclude_past_campaigns_targets: false,
    exclude_replied_profiles: false,
    split_open: false,
    import_open_only: false,
    enable_inbox_autopilot: false,
    enable_sentiment_analysis: false,
  });

  useEffect(() => {
    if (editId) {
      const fetchCampaign = async () => {
        try {
          const data = await getCampaign(editId);
          console.log("campaign data...", data);
          if (data) {
            setCampaignName(data.name || "");
            setSource(data?.source?.filter_url || "");
            setProfileUrls(data?.profile_urls || []);
            setStatus(data.status);
            setSchedule(data.schedule);
            setSettings({
              exclude_first_degree_connections:
                data.settings.exclude_first_degree_connections || false,
              exclude_past_campaigns_targets:
                data.settings.exclude_past_campaigns_targets || false,
              exclude_replied_profiles:
                data.settings.exclude_replied_profiles || false,
              split_open: data.settings.split_open || false,
              import_open_only: data.settings.import_open_only || false,
              enable_inbox_autopilot:
                data.settings.enable_inbox_autopilot || false,
              enable_sentiment_analysis:
                data.settings.enable_sentiment_analysis || false,
            });
            setWorkflow(data.workflow);
            setNodes(data.workflow);

            // Calculate editStatus directly here
            const isEditable = data.status === "paused";
            setEditStatus(isEditable);
          }
        } catch (error) {
          console.error("Failed to fetch", error);
        }
      };

      fetchCampaign();
    }
  }, [editId]);

  useEffect(() => {
    const fetchSubscription = async () => {
      const data = await GetActiveSubscription();
      console.log("Subscription data...", data);
      setSubscribedPlanId(data?.items?.data[0]?.price?.lookup_key);
    };

    fetchSubscription();
  }, []);

  return (
    <EditContext.Provider
      value={{
        editId,
        setEditId,
        campaignName,
        setCampaignName,
        source,
        setSource,
        profileUrls,
        setProfileUrls,
        settings,
        setSettings,
        schedule,
        setSchedule,
        nodes,
        setNodes,
        status,
        setStatus,
        stats,
        setStats,
        workflow,
        setWorkflow,
        subscribedPlanId,
        editStatus, // Only export editStatus
        loadingProfiles,
        setLoadingProfiles,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error("useEditContext must be used within an EditProvider");
  }
  return context;
};
