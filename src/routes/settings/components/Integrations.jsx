import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
  APIKeys,
  Hubspot,
  LinkedIn,
  MailIcon,
  Salesforce,
  TwitterIcon,
  Webhooks,
  Hyperise,
  ToolIcon,
  StepReview,
} from "../../../components/Icons";
import LinkedInModal from "./LinkedInModal";
import ConnectionTable from "./ConnectionTable";
import AddAccountModal from "./AddAccountModal";
import SignatureEditorModal from "./SignatureEditorModal";
import UnsubscribeModal from "./UnsubscribeModal";
import toast from "react-hot-toast";
import { createIntegration, DeleteAccount } from "../../../services/settings";
import { getCurrentUser } from "../../../utils/user-helpers";
import DeleteModal from "./DeleteModal";

const integrationsData = [
  {
    key: "linkedin",
    name: "LinkedIn",
    description: "LinkedIn is the world’s largest professional network.",
    icon: <LinkedIn className="w-6 h-6 fill-[#0A66C2]" />,
    status: "Connect",
    color: "#16A37B",
  },
  {
    key: "x",
    name: "X",
    description:
      "Connect your X account to like the latest post of your target audience.",
    icon: <TwitterIcon className="w-5 h-5 !fill-[#454545]" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
  {
    key: "email",
    name: "Email Integration",
    description:
      "Connect your email to trigger scheduled email sequences for creating powerful automated workflows",
    icon: <MailIcon className="w-5 h-5 !fill-[#04479C]" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description:
      "Connect your Hubspot account would allow you to send profile data from Hubspot to our platform and vice-versa.",
    icon: <Hubspot className="w-5 h-5 !fill-[#FF5C35]" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    description: "Connect your SalesForce account to share profile data.",
    icon: <Salesforce className="w-7 h-7" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
  {
    key: "hyperise",
    name: "Hyperise",
    description:
      "Hyperise integration to customize your outreach with various personalized media.",
    icon: <Hyperise className="w-5 h-5" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
  {
    key: "api",
    name: "API Keys",
    description:
      "Advanced method to access/update data on dashboards & automate complex reporting/importing tasks.",
    icon: <APIKeys className="w-5 h-5" />,
    status: "Connected",
    color: "#16A37B",
  },
  {
    key: "webhooks",
    name: "Webhooks",
    description:
      "Webhooks allows you to receive data to specific endpoint URL when specific events happen",
    icon: <Webhooks className="w-5 h-5" />,
    status: "Disconnected",
    color: "#7E7E7E",
  },
];

const imapSmtpData = [
  {
    id: "172950439324",
    name: "James Jordan",
    email: "james.jordan@email.com",
  },
];

const oauthData = [
  {
    id: "172950439324",
    provider: "Google",
    name: "James Jordan",
    email: "james.jordan@email.com",
  },
];

const Integrations = () => {
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showEmailIntegration, setShowEmailIntegration] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSignatureData, setSelectedSignatureData] = useState(null);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({
    premium: false,
    navigator: false,
    recruiter: false,
    twitter: false,
    city: "",
    country: "",
  });

  const location = useLocation();
  const hubspotConnected = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hubSpotCode = params.get("code");

    if (hubSpotCode && !hubspotConnected.current) {
      hubspotConnected.current = true;
      console.log("HubSpot OAuth code:", hubSpotCode);
      handleHubspotOAuthCode(hubSpotCode);
    }
  }, [location.search]);

  const user = getCurrentUser();

  const handleHubspotOAuthCode = async code => {
    try {
      // TO DO - call API to generate access & refresh tokens using the code & store it in db

      toast.success("HubSpot connected successfully!");

      // Update integrationStatus for HubSpot only
      setIntegrationStatus(prev =>
        prev.map(item =>
          item.key === "hubspot"
            ? { ...item, status: "Connected", color: "#16A37B" }
            : item,
        ),
      );
    } catch (err) {
      console.error("Error exchanging HubSpot token:", err);
      toast.error("Error connecting HubSpot.");
    }
  };

  const handleEditSignature = rowData => {
    setSelectedSignatureData(rowData);
    setShowSignatureModal(true);
  };

  const isNonEmptyObject = obj =>
    obj && typeof obj === "object" && Object.keys(obj).length > 0;

  const VALID_ACCOUNT_STATUSES = [
    "OK",
    "SYNC_SUCCESS",
    "RECONNECTED",
    "CREATION_SUCCESS",
  ];

  const checkConnectionStatus = (user, key) => {
    const account = user?.accounts?.[key];
    if (key === "linkedin") {
      const linkedinAccount = user.accounts?.linkedin;
      if (!linkedinAccount) {
        //log(User ${userEmail} has no LinkedIn account, skipping...);
        return "Connect";
      } else if (!VALID_ACCOUNT_STATUSES.includes(linkedinAccount.status)) {
        return "Reconnect";
      } else {
        return "Connected";
      }
    } else {
      if (!isNonEmptyObject(account)) return "Connect";
      return "Connected";
    }
  };
  const [integrationStatus, setIntegrationStatus] = useState(
    integrationsData.map(item => ({
      ...item,
      status: checkConnectionStatus(user, item.key),
    })),
  );
  const getConnectAction = key => {
    console.log(key);

    switch (key) {
      case "linkedin":
        setShowLinkedInModal(true);
        break;
      case "email":
        handleEmailIntegrations();
        break;
      case "hubspot":
        handleHubspotConnect();
        break;
      default:
        console.log(`No connect action defined for ${key}`);
        break;
    }
  };

  const handleHubspotConnect = () => {
    const HUBSPOT_CLIENT_ID = import.meta.env.VITE_HUBSPOT_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_HUBSPOT_REDIRECT_URI;
    const SCOPES = [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.lists.write",
      "crm.lists.read",
    ].join(" ");

    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI,
    )}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
  };

  const handleLinkedInIntegrations = async () => {
    try {
      const linkedinAccount = user?.accounts?.linkedin;
      const isReconnect =
        linkedinAccount &&
        !VALID_ACCOUNT_STATUSES.includes(linkedinAccount.status);

      const dataToSend = {
        provider: "linkedin",
        country: selectedOptions.country,
        city: selectedOptions.city.split("-")[1],
        ...(isReconnect && { accountId: linkedinAccount.id }),
      };

      const response = await createIntegration(dataToSend);

      if (response?.url) {
        window.location.href = response.url;
      }

      //toast.success("LinkedIn Integrated Successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to integrate linkedIn.");
    }
  };
  const handleEmailIntegrations = async () => {
    try {
      const dataToSend = {
        provider: "email",
      };

      const response = await createIntegration(dataToSend);

      if (response?.url) {
        window.location.href = response.url;
      }

      //toast.success("Email Integrated Successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to integrate email.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedIntegration) return;

    try {
      const accountKey = selectedIntegration.key;
      const accountId = user.accounts?.[accountKey]?.id;

      if (!accountId) throw new Error("Missing account ID");
      await DeleteAccount(accountId);

      toast.success(`${selectedIntegration.name} disconnected successfully!`);
      setIntegrationStatus(prev =>
        prev.map(item =>
          item.key === accountKey
            ? { ...item, status: "Connect", color: "#7E7E7E" }
            : item,
        ),
      );
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to disconnect account.");
    }
  };
  return (
    <>
      <div className="relative w-[390px] h-[35px]">
        <span className="absolute left-2 top-1/2 -translate-y-1/2">
          <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
        </span>
        <input
          type="text"
          placeholder="Search"
          className="w-full border border-[#7E7E7E] rounded-[4px] text-base h-[35px] text-[#7E7E7E] font-medium pl-8 pr-3 bg-white focus:outline-none"
        />
      </div>
      {!showEmailIntegration ? (
        <div className="flex flex-col gap-11 rounded-[8px] overflow-hidden">
          <div className="rounded-[8px] overflow-hidden border border-[#7E7E7E] ">
            <table className="w-full bg-white text-left text-[#7E7E7E] font-poppins">
              <thead className="">
                <tr>
                  <th className=""></th>
                  <th className="p-3 font-[400] text-[15px]">Name</th>
                  <th className="p-3 font-[400] text-[15px]">Description</th>
                  <th></th>
                  <th className="p-3 font-[400] text-[15px] text-center">
                    Connection
                  </th>
                </tr>
              </thead>
              <tbody>
                {integrationStatus.map((item, idx) => (
                  <tr key={idx} className=" border-t border-[#7e7e7e1f]">
                    <td className="p-3 text-[12px]">{item.icon}</td>
                    <td className="p-3 text-[15px]">
                      <span className="font-[400] text-[15px]">
                        {item.name}
                      </span>
                    </td>
                    <td className="p-3 text-[15px]">{item.description}</td>
                    <td className="p-3 text-center">
                      <ToolIcon className="w-5 h-5" />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        className={`border flex gap-2 font-[12px] w-[144px] rounded-[6px] items-center px-2 py-1 ml-auto cursor-pointer ${
                          item.status === "Connected"
                            ? "text-[#16A37B] border-[#16A37B]"
                            : "text-[#7E7E7E] border-[#7E7E7E]"
                        }`}
                        onClick={() => {
                          item.status === "Connect" ||
                          item.status === "Reconnect"
                            ? getConnectAction(item.key)
                            : undefined;
                        }}
                      >
                        <span
                          className={`w-[7px] h-[7px] rounded-full ${
                            item.status === "Connect" ||
                            item.status === "Reconnect"
                              ? "bg-[#7E7E7E]"
                              : "bg-[#16A37B]"
                          }`}
                        ></span>
                        {item.status}
                      </button>
                      {item.status === "Connected" && (
                        <button
                          className="mt-2 border flex gap-2 font-[12px] w-[144px] text-[#D62828] border-[#D62828] rounded-[6px] items-center px-2 py-1 ml-auto cursor-pointer"
                          onClick={() => {
                            setSelectedIntegration(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <span className="w-[7px] h-[7px] rounded-full bg-[#D62828]"></span>
                          Disconnect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showDeleteModal && (
            <DeleteModal
              onClose={() => setShowDeleteModal(false)}
              onClick={handleDeleteAccount}
            />
          )}

          {showLinkedInModal && (
            <LinkedInModal
              onClose={() => setShowLinkedInModal(false)}
              onConnect={async () => {
                // setIntegrationStatus(prev =>
                //   prev.map(item =>
                //     item.name === "LinkedIn"
                //       ? { ...item, status: "Connected", color: "#16A37B" }
                //       : item,
                //   ),
                // );
                await handleLinkedInIntegrations();
                setShowLinkedInModal(false);
              }}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
            />
          )}
        </div>
      ) : (
        <div>
          <ConnectionTable
            title="IMAP/SMTP Connections"
            data={imapSmtpData}
            showProvider={false}
            setShowAddAccountModal={setShowAddAccountModal}
            onEditSignature={handleEditSignature}
            onEditUnsubscribe={() => setShowUnsubscribeModal(true)}
          />
          <ConnectionTable
            title="OAuth Connections"
            data={oauthData}
            showProvider={true}
            setShowAddAccountModal={setShowAddAccountModal}
            onEditSignature={handleEditSignature}
            onEditUnsubscribe={() => setShowUnsubscribeModal(true)}
          />
        </div>
      )}

      {showAddAccountModal && (
        <AddAccountModal onClose={() => setShowAddAccountModal(false)} />
      )}
      {showSignatureModal && (
        <SignatureEditorModal
          onClose={() => setShowSignatureModal(false)}
          data={selectedSignatureData}
        />
      )}
      {showUnsubscribeModal && (
        <UnsubscribeModal onClose={() => setShowUnsubscribeModal(false)} />
      )}
    </>
  );
};

export default Integrations;
