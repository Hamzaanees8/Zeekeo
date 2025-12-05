import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getWebhooks,
  saveWebhooks,
  testWebhook,
} from "../../services/integrations";

// supported events
const SUPPORTED_WEBHOOK_EVENTS = [
  {
    id: "profile_connected",
    text: "Send new connections to webhook",
    info: "Enable to send all new connections from your campaigns to the webhook.\n Event id: profile_connected",
  },
  {
    id: "invite_sent",
    text: "Notification for sent invitations",
    info: "Enable to send all invitations from your campaigns to the webhook\nEvent id:  invite_sent",
  },
  {
    id: "linkedin_account_disconnected",
    text: "Notification for Linkedin disconnected",
    info: `This option will automatically sent you a notification to the webhook whenever a user's LinkedIn account was disconnected from our platform\nEvent id: linkedin_account_disconnected`,
  },
  {
    id: "reply_received",
    text: "Notification for received message",
    info: `Enable to send all messages from your campaigns to the webhook\nEvent id: reply_received`,
  },
  {
    id: "message_sent",
    text: "Notification for sent message",
    info: `Enable to send a notification when message sent from our platform \nEvent id: message_sent`,
  },
  {
    id: "campaign_first_started",
    text: "Notification for starting campaign for a first time",
    info: "Enable to send a notification for starting a campaign for the first time to the webhook\nEvent id: campaign_first_started",
  },
  {
    id: "campaign_updated",
    text: "Notification for updated campaigns",
    info: "Enable to send a notification for updating a campaign to the webhook\nEvent id: campaign_updated",
  },
  {
    id: "positive_conversation",
    text: "Notification for positive conversations",
    info: "Enable to send a notification when a reply is marked as positive\nEvent id: positive_conversation",
  },
];

// initialize webhook state
const initializeWebhooks = (fetchedWebhooks) => {
  const initialWebhooks = {};
  SUPPORTED_WEBHOOK_EVENTS.forEach((event) => {
    initialWebhooks[event.id] = {
      enabled: fetchedWebhooks[event.id]?.enabled || false,
      url: fetchedWebhooks[event.id]?.url || "",
    };
  });
  return initialWebhooks;
};

export default function WebhooksIntegrationPanel({ onClose }) {
  const [webhooks, setWebhooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testSendingEvent, setTestSendingEvent] = useState(null);

  useEffect(() => {
    const fetchWebhooksData = async () => {
      setLoading(true);
      try {
        const data = await getWebhooks();
        if (data) {
          setWebhooks(initializeWebhooks(data));
        }
      } catch (error) {
        toast.error("Failed to load webhooks configuration.");
      } finally {
        setLoading(false);
      }
    };
    fetchWebhooksData();
  }, []);

  // Handler for saving webhooks
  const handleSaveWebhooks = async () => {
    setIsSaving(true);

    const enabledWebhooks = Object.entries(webhooks).filter(
      ([key, config]) => config.enabled,
    );

    for (const [key, config] of enabledWebhooks) {
      // Check if the URL is empty or only whitespace
      if (!config.url || config.url.trim().length === 0) {
        const eventName =
          SUPPORTED_WEBHOOK_EVENTS.find((e) => e.id === key)?.text || key;
        toast.error(
          `The event "${eventName}" is enabled but requires a valid Webhook URL.`,
        );
        setIsSaving(false);
        return;
      }
    }

    try {
      const dataToSave = Object.keys(webhooks).reduce((acc, key) => {
        acc[key] = {
          enabled: webhooks[key].enabled,
          url: (webhooks[key].url || "").trim(),
        };
        return acc;
      }, {});

      const response = await saveWebhooks(dataToSave);
      console.log("Webhook save response:", response);

      if (response) {
        toast.success("Webhooks configuration saved successfully!");
      } else {
        toast.error("Webhooks could not be saved.");
      }
    } catch (error) {
      console.error("Webhook save error:", error);
      toast.error("Webhooks could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler for toggling the enabled state (FIXED and safer)
  const handleToggleWebhook = (eventId) => {
    setWebhooks((prev) => {
      const currentConfig = prev[eventId] || {};

      return {
        ...prev,
        [eventId]: {
          ...currentConfig,
          enabled: !currentConfig.enabled,
        },
      };
    });
  };

  // Handler for URL input change (Improved for safety)
  const handleUrlChange = (eventId, url) => {
    setWebhooks((prev) => {
      const currentConfig = prev[eventId] || {};

      return {
        ...prev,
        [eventId]: {
          ...currentConfig,
          url: url,
        },
      };
    });
  };

  // Handler for sending a test event
  const handleSendTestEvent = async (event) => {
    const eventId = event.id;
    const url = webhooks[eventId]?.url;

    if (!url || url.trim().length === 0) {
      toast.error("Please provide a valid URL before sending a test event.");
      return;
    }

    setTestSendingEvent(eventId);
    try {
      const response = await testWebhook(eventId, url);

      if (response && response.success) {
        toast.success(`Event '${event.text}' data sent successfully!`);
      } else {
        toast.error(`Failed to send test event '${event.text}'.`);
      }
    } catch (error) {
      toast.error(`Failed to send test event '${event.text}'.`);
    } finally {
      setTestSendingEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <i className="fas fa-spinner fa-spin text-2xl text-gray-600"></i>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md w-full min-h-[600px]">
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-[#7E7E7E] font-[500] font-urbanist text-[20px] font-semibold ">
          Webhooks Configuration
        </h2>
        <button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="cursor-pointer text-[#7E7E7E] font-[500] "
        >
          X
        </button>
      </div>

      <div className="space-y-6">
        {SUPPORTED_WEBHOOK_EVENTS.map((event) => (
          <div
            key={event.id}
            className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 pb-4"
          >
            <div className="flex w-full md:w-1/2 items-start space-x-4">
              {/* Toggle Switch with Conditional Text Labels */}
              <label className="relative inline-flex items-center cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={webhooks[event.id]?.enabled || false}
                  onChange={() => handleToggleWebhook(event.id)}
                  className="sr-only peer"
                />

                {(() => {
                  const checkedLabel = "ON";
                  const uncheckedLabel = "OFF";

                  return (
                    <div className="w-24 h-8 bg-gray-200 rounded-full peer peer-checked:bg-[#0387FF] transition-all duration-300 relative flex items-center p-0.5 px-1">
                      <div
                        className={`
            absolute h-6 w-6 bg-white rounded-full shadow-md transition-transform duration-300 z-10 
            ${
              webhooks[event.id]?.enabled
                ? "transform translate-x-[64px]"
                : "transform translate-x-0"
            }
        `}
                      ></div>

                      {/* Text for the unchecked/disabled state (shows when OFF/MANUAL) */}
                      <span
                        className={`absolute right-3 text-xs font-semibold ${
                          webhooks[event.id]?.enabled
                            ? "opacity-0"
                            : "opacity-100"
                        } transition-opacity duration-300 text-gray-700`}
                      >
                        {uncheckedLabel}
                      </span>

                      {/* Text for the checked/enabled state (shows when ON/AUTO) */}
                      <span
                        className={`absolute left-3 text-xs font-semibold ${
                          webhooks[event.id]?.enabled
                            ? "opacity-100"
                            : "opacity-0"
                        } transition-opacity duration-300 text-white`}
                      >
                        {checkedLabel}
                      </span>
                    </div>
                  );
                })()}
              </label>
              {/* Event Text and Info */}
              <div className="flex flex-col">
                <p className="text-base font-medium text-gray-700">
                  {event.text}
                </p>

                <p className="text-xs italic text-gray-500 mt-1 whitespace-pre-line">
                  {event.info}
                </p>
              </div>
            </div>

            {/* URL Input and Test Button */}
            <div className="flex w-full md:w-1/2 items-center space-x-3">
              <input
                type="url"
                className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:ring-[#0387FF] focus:border-[#0387FF] disabled:bg-gray-50"
                value={webhooks[event.id]?.url || ""}
                onChange={(e) => handleUrlChange(event.id, e.target.value)}
                placeholder="Enter webhook endpoint URL"
                disabled={
                  !webhooks[event.id]?.enabled ||
                  isSaving ||
                  testSendingEvent === event.id
                }
              />
              <button
                onClick={() => handleSendTestEvent(event)}
                disabled={
                  !(webhooks[event.id]?.url || "").trim() ||
                  testSendingEvent === event.id ||
                  !webhooks[event.id]?.enabled
                }
                className="px-4 py-2 text-sm font-medium rounded-md transition duration-150 border border-[#0387FF] cursor-pointer rounded-[4px] bg-white text-[#0387FF] disabled:opacity-50 disabled:cursor-not-allowed w-[120px] flex items-center justify-center"
              >
                Send Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Save Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
        <button
          onClick={onClose}
          className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-8 py-2 rounded-md cursor-pointer transition duration-150"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          onClick={handleSaveWebhooks}
          disabled={isSaving}
          className="btn bg-[#0387FF] text-white hover:bg-[#006bd1] px-8 py-2 rounded-md transition duration-150 flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <i className="fas fa-spinner fa-spin mr-2"></i>
          ) : (
            <i className="fas fa-save mr-2"></i>
          )}
          Save
        </button>
      </div>
    </div>
  );
}
