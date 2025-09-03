import { createContext, useContext, useEffect, useState } from "react";
import {
  getCampaign,
  getCampaignStats,
  streamCampaignProfiles,
} from "../../../../services/campaigns";
const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [editId, setEditId] = useState(null);
  const [stats, setStats] = useState([]);
  const [status, setStatus] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [source, setSource] = useState("");
  const [profileUrls, setProfileUrls] = useState([]);
  const [workflow, setWorkflow] = useState({});
  const [nodes, setNodes] = useState({});
  const [schedule, setSchedule] = useState({});
  const [settings, setSettings] = useState({
    exclude_first_degree_connections: false,
    exclude_past_campaigns_targets: false,
    exclude_replied_profiles: false,
    split_premium: false,
    import_premium_only: false,
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
              split_premium: data.settings.split_premium || false,
              import_premium_only: data.settings.import_premium_only || false,
            });
            setWorkflow(data.workflow);
            setNodes(data.workflow);
          }
        } catch (error) {
          console.error("Failed to fetch", error);
        }
      };

      fetchCampaign();
    }
  }, [editId]);

/*   useEffect(() => {
    const fetchCampaignStats = async () => {
      try {
        const data = await getCampaignStats({ campaignId: editId });
        setStats(data);
      } catch (err) {
        if (err?.response?.status !== 401) {
          toast.error("Failed to load data");
        }
      }
    };

    if (editId) {
      fetchCampaignStats();
    }
  }, [editId]); */
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
