import WorkFlowEdge from "../components/workflow/WorkFlowEdge";

import {
  StepMessages,
  PlusIcon,
  MailIcon,
  XtwitterIcon,
  SendIcon,
  EndorseIcon,
  ThumbIcon,
  UserIcon,
  EyeIcon,
  IfConnected,
  IfReplied,
  IfRepliedtoCampaign,
  IfLocked,
  IfisOpenLink,
  Ifmail,
  Ifmailopend,
  MailBounced,
  SMSIcon,
  Whatsapp,
  EyeIcon2,
  UserIcon2,
  EndorseIcon2,
  IfConnected2,
  Ifmail2,
  IfisOpenLink2,
  ThumbIcon2,
  SendIcon2,
  StepMessages2,
  PlusIcon2,
  XtwitterIcon2,
  MailIcon2,
  IfReplied2,
  IfRepliedtoCampaign2,
  IfLocked2,
  Ifmailopend2,
  MailBounced2,
  SMSIcon2,
  Whatsapp2,
  CircledAdd,
  View,
  Message,
  Invite,
} from "../components/Icons";

export const actions = {
  linkedin_view: { icon: EyeIcon, label: "View" },
  linkedin_invite: { icon: UserIcon, label: "Invite" },
  linkedin_inmail: { icon: SendIcon, label: "Send InMail" },
  linkedin_like_post: { icon: ThumbIcon, label: "Like Post" },
  linkedin_message: { icon: StepMessages, label: "Send Message" },
  linkedin_endorse: { icon: EndorseIcon, label: "Endorse" },
  linkedin_follow: { icon: PlusIcon, label: "Follow" },
  email_message: { icon: MailIcon, label: "Send Email" },
};

export const isValidActionType = type => {
  return Object.prototype.hasOwnProperty.call(actions, type);
};

export const edgeTypes = {
  custom: WorkFlowEdge,
};
export const conditions = {
  connected: { icon: IfConnected, label: "If Connected" },
  replied: { icon: IfReplied, label: "If Replied" },
  replied_to_campaign: {
    icon: IfRepliedtoCampaign,
    label: "If Replied to Campaign",
  },
  locked_to_another_campaign: {
    icon: IfLocked,
    label: "If Locked to Another Campaign",
  },
  is_open: { icon: IfisOpenLink, label: "If is Open Link" },
  email_exists: { icon: Ifmail, label: "If Email Exists" },
};
/*  { icon: Ifmailopend, label: "If Email Opened", key: "if_email_opened" },
 { icon: MailBounced, label: "If Email Bounced", key: "if_email_bounced" },
 { icon: SMSIcon, label: "If Has X", key: "if_has_x" },
 { icon: XtwitterIcon, label: "SMS", key: "if_sms_sent" },
 { icon: Whatsapp, label: "Whatsapp", key: "if_whatsapp_sent" }, */

export const nodeMeta = {
  // Actions
  linkedin_view: {
    subtitle: "Wait For",
    time: ": Immediately",
    color: "#038D65",
    category: "action",
    type: "linkedin_view",
    icon: EyeIcon2,
    delay: { hours: 2, days: 1 },
    maxdelay: 20,
    reply: true,
  },
  linkedin_invite: {
    subtitle: "Wait For",
    time: ": 1 Hour",
    color: "#038D65",
    category: "action",
    type: "linkedin_invite",
    icon: UserIcon2,
    delay: { hours: 3, days: 0 },
    maxdelay: 25,
    reply: true,
  },
  linkedin_inmail: {
    subtitle: "Wait For",
    time: ": 10 Minutes",
    color: "#038D65",
    category: "action",
    type: "linkedin_inmail",
    icon: SendIcon2,
    maxdelay: 70,
    reply: false,
  },
  linkedin_like_post: {
    subtitle: "Wait For",
    time: ": 2 Hours",
    color: "#038D65",
    category: "action",
    type: "linkedin_like_post",
    icon: ThumbIcon2,
    delay: { hours: 2, days: 0 },
    maxdelay: 30,
    reply: true,
  },
  linkedin_message: {
    subtitle: "Wait For",
    time: ": Immediately",
    color: "#038D65",
    category: "action",
    type: "linkedin_message",
    icon: StepMessages2,
    delay: { hours: 1, days: 0 },
    maxdelay: 55,
    reply: false,
  },
  linkedin_endorse: {
    subtitle: "Wait For",
    time: ": 5 Minutes",
    color: "#038D65",
    category: "action",
    type: "linkedin_endorse",
    icon: EndorseIcon2,
    delay: { hours: 2, days: 2 },
    maxdelay: 60,
    reply: false,
  },
  linkedin_follow: {
    subtitle: "Wait For",
    time: ": 3 Hours",
    color: "#038D65",
    category: "action",
    type: "linkedin_follow",
    icon: PlusIcon2,
    delay: { hours: 0, days: 5 },
    maxdelay: 80,
    reply: false,
  },

  /*   "like_tweet": {
      subtitle: "Wait For",
      time: ": 1 Day",
      color: "#038D65",
      category: "action",
      type: "like_tweet",
      icon: XtwitterIcon2,
      delay: { hours: 0, days: 14 },
      maxdelay: 60,
      reply: true,
    }, */
  email_message: {
    subtitle: "Wait For",
    time: ": Immediately",
    color: "#038D65",
    category: "action",
    type: "email_message",
    icon: MailIcon2,
    delay: { hours: 0, days: 3 },
    maxdelay: 50,
    reply: false,
  },

  // Conditions
  connected: {
    subtitle: "Check For",
    time: ": Immediately",
    color: "#0077B6",
    category: "condition",
    type: "connected",
    icon: IfConnected2,
    delay: { hours: 5, days: 5 },
    maxdelay: 40,
    reply: true,
  },
  replied: {
    subtitle: "Check For",
    time: ": 30 Minutes",
    color: "#0077B6",
    category: "condition",
    type: "replied",
    icon: IfReplied2,
    delay: { hours: 2, days: 12 },
    maxdelay: 20,
    reply: false,
  },
  replied_to_campaign: {
    subtitle: "Check For",
    time: ": 1 Hour",
    color: "#0077B6",
    category: "condition",
    type: "replied_to_campaign",
    icon: IfRepliedtoCampaign2,
    delay: { hours: 0, days: 10 },
    maxdelay: 30,
    reply: true,
  },
  locked_to_another_campaign: {
    subtitle: "Check For",
    time: ": 2 Hours",
    color: "#0077B6",
    category: "condition",
    type: "locked_to_another_campaign",
    icon: IfLocked2,
    delay: { hours: 0, days: 5 },
    maxdelay: 60,
    reply: true,
  },
  is_open: {
    subtitle: "Check For",
    time: ": Immediately",
    color: "#0077B6",
    category: "condition",
    type: "is_open",
    icon: IfisOpenLink2,
    delay: { hours: 10, days: 0 },
    maxdelay: 60,
    reply: false,
  },
  email_exists: {
    subtitle: "Check For",
    time: ": Instantly",
    color: "#0077B6",
    category: "condition",
    type: "email_exists",
    icon: Ifmail2,
    delay: { hours: 6, days: 0 },
    maxdelay: 30,
    reply: true,
  },
  /*  "if_email_opened": {
     subtitle: "Check For",
     time: ": 5 Min",
     color: "#0077B6",
     category: "condition",
     type: "if_email_opened",
     icon: Ifmailopend2,
     delay: { hours: 0, days: 5 },
     maxdelay: 40,
     reply: true,
   },
   "if_email_bounced": {
     subtitle: "Check For",
     time: ": 10 Min",
     color: "#0077B6",
     category: "condition",
     type: "if_email_bounced",
     icon: MailBounced2,
     delay: { hours: 0, days: 1 },
     maxdelay: 10,
     reply: true,
   },
   "if_has_x": {
     subtitle: "Check For",
     time: ": Variable",
     color: "#0077B6",
     category: "condition",
     type: "if_has_x",
     icon: SMSIcon2,
     delay: { hours: 0, days: 5 },
     maxdelay: 50,
     reply: false,
   },
   "if_sms_sent": {
     subtitle: "Check For",
     time: ": SMS Sent",
     color: "#0077B6",
     category: "condition",
     type: "if_sms_sent",
     icon: XtwitterIcon2,
     delay: { hours: 5, days: 5 },
     maxdelay: 80,
     reply: true,
   },
   "if_whatsapp_sent": {
     subtitle: "Check For",
     time: ": WhatsApp Sent",
     color: "#0077B6",
     category: "condition",
     type: "if_whatsapp_sent",
     delay: { hours: 0, days: 16 },
     icon: Whatsapp2,
     maxdelay: 70,
     reply: true,
   }, */
};

export const initialNodes = [
  {
    id: "start",
    type: "input", // or leave default
    position: { x: 300, y: 0 },
    data: {
      label: (
        <div className="text-[16px] text-[#454545] font-[600]">START</div>
      ),
    },
    style: {
      background: "transparent",
      border: "none",
      boxShadow: "none",
    },
  },
  {
    id: "1",
    type: "custom",
    position: { x: 288, y: 120 },
    data: {
      title: "If Connected",
      subtitle: "Check For",
      time: ": Immediately",
      color: "#0077B6",
      delay: { hours: 0, days: 0 },
      icon: CircledAdd,
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 375, y: 240 },
    data: {
      title: "View",
      subtitle: "Wait For",
      time: ": Immediately",
      color: "#038D65",
      icon: View,
      delay: { hours: 0, days: 0 },
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 375, y: 360 },
    data: {
      title: "Invite",
      subtitle: "Wait For",
      time: ": 1 Hour",
      color: "#038D65",
      icon: Invite,
      delay: { hours: 1, days: 0 },
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 375, y: 480 },
    data: {
      title: "If Connected",
      subtitle: "Check For",
      time: ": 5 Days",
      color: "#0077B6",
      icon: CircledAdd,
      delay: { hours: 0, days: 5 },
    },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 125, y: 450 },
    data: {
      id: "5",
      title: "Send Message",
      isLast: true,
      subtitle: "Wait For",
      time: ": Immediately",
      color: "#038D65",
      icon: Message,
      delay: { hours: 0, days: 0 },
    },
  },
];

export const initialEdges = [
  {
    id: "e-start-1",
    source: "start",
    target: "1",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e1-2",
    source: "1",
    sourceHandle: "check", // ✅ Explicitly use 'check'
    target: "2",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
  {
    id: "e4-5",
    source: "4",
    sourceHandle: "cross", // ✅ Explicitly use 'cross'
    target: "5",
    type: "custom",
    animated: false,
    style: { stroke: "#0096C7" },
  },
];

export const buildWorkflowOutput = (nodes, edges) => {
  const output = [];

  //console.log('edges/././')
  //console.log(edges);

  const edgeMap = {};
  for (const edge of edges) {
    if (!edgeMap[edge.source]) edgeMap[edge.source] = {};
    const condition = edge.sourceHandle || "default";

    if (condition === "check") {
      edgeMap[edge.source].true = edge.target;
    } else if (condition === "cross") {
      edgeMap[edge.source].false = edge.target;
    } else {
      // for non-condition nodes
      edgeMap[edge.source].default = edge.target;
    }
  }

  for (const node of nodes) {
    const { id, data, position } = node;

    const nodeOutput = {
      id,
      position,
      category: data.category,
      type: data.type,
    };

    // Conditionally add `properties` only if it's not a start node
    if (data.category !== "start") {
      nodeOutput.properties = {
        delay:
          (data.delay?.hours || 0) * 3600 + (data.delay?.days || 0) * 86400,
        limit: data.limit || 0,
        stop_on_reply: !!data.stop_on_reply,
      };
    }

    const connections = edgeMap[id] || {};

    if (data.category === "condition") {
      // ensure both true and false keys exist
      nodeOutput.connections = {
        true: connections.true || null,
        false: connections.false || null,
      };
    } else {
      // just regular connection
      nodeOutput.connections = {
        default: connections.default || null,
      };
    }

    output.push(nodeOutput);
  }

  return output;
};

const normalizeActionType = type => {
  const map = {
    linkedin_endorsement: "linkedin_endorse", // alias mapping
  };
  return map[type] || type;
};

export const rebuildFromWorkflow = workflowData => {
  const nodes = [];
  const edges = [];

  let x = 0,
    y = 0;
  console.log("workflow data", workflowData);
  for (const node of workflowData.nodes) {
    node.type = normalizeActionType(node.type);

    //console.log(node)
    const {
      id,
      position = { x: 0, y: 0 },
      properties = {},
      connections = {},
    } = node;

    if (id == "start") {
      nodes.push({
        id: "start",
        type: "input",
        position,
        data: {
          label: (
            <div className="text-[16px] text-[#454545] font-[600]">START</div>
          ),
        },
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
        },
      });
    } else {
      const nodeProps = nodeMeta[node.type];

      //console.log(nodeProps)
      //console.log('properties', properties)

      const nodeLabel =
        node.category == "action"
          ? actions[node.type].label
          : conditions[node.type].label;

      let nodedelay = {};
      if (id !== "start") {
        const delay = properties?.delay;

        nodedelay = {
          delay:
            typeof delay === "number"
              ? formatDelayToDaysHours(delay)
              : typeof delay === "object" && delay !== null
              ? delay
              : { days: 0, hours: 0 },
        };
      }

      //  console.log('properties template', properties?.template)

      const nodeInfo = {
        id,
        type: "workflow",
        data: {
          ...nodeProps,
          ...properties,
          ...nodedelay,
          category: node.category,
          type: node.type,
          title: nodeLabel,
          template: properties?.template ? properties.template : {},
        },
      };

      if (position?.x !== undefined && position?.y !== undefined) {
        nodeInfo.position = {
          x: position.x,
          y: position.y,
        };
      }

      // Build node object
      nodes.push({
        id,
        type: "workflow",
        data: {
          ...nodeProps,
          ...properties,
          ...nodedelay,
          category: node.category,
          type: node.type,
          title: nodeLabel,
          template: properties?.template ? properties.template : {},
          maxPerDay: properties?.limit ? properties.limit : 0,
          stopOnReply: properties?.stop_on_reply
            ? properties.stop_on_reply
            : false,
        },
        position: {
          x: position?.x,
          y: position?.y,
        },
      });
    }

    // Build edge(s) based on category
    if (node.category === "condition") {
      if (connections.true) {
        edges.push({
          id: `e-${id}-true`,
          source: id,
          sourceHandle: "check", // handle id for "true" path
          target: connections.true,
          type: "custom",
          animated: false,
          style: { stroke: "#0096C7" },
        });
      }
      if (connections.false) {
        edges.push({
          id: `e-${id}-false`,
          source: id,
          sourceHandle: "cross", // handle id for "false" path
          target: connections.false,
          type: "custom",
          animated: false,
          style: { stroke: "#0096C7" },
        });
      }
    } else {
      if (connections.default) {
        edges.push({
          id: `e-${id}-default`,
          source: id,
          //  sourceHandle: "default",
          target: connections.default,
          type: "custom",
          animated: false,
          style: { stroke: "#0096C7" },
        });
      }
    }
  }

  //console.log('nodes', nodes)
  //console.log(JSON.stringify(edges))
  return { nodes, edges };
};

export const formatDelayToDaysHours = delayInSeconds => {
  const SECONDS_IN_A_DAY = 86400;
  const SECONDS_IN_AN_HOUR = 3600;

  const days = Math.floor(delayInSeconds / SECONDS_IN_A_DAY);
  const hours = Math.floor(
    (delayInSeconds % SECONDS_IN_A_DAY) / SECONDS_IN_AN_HOUR,
  );

  return { days: days, hours: hours };
};
