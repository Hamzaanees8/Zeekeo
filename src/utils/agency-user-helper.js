export const convertToCSV = data => {
  if (!data || data.length === 0) return "";

  const columns = [
    "Email",
    "First Name",
    "Last Name",
    "Status",
    "Pro Account",
    "LinkedIn Connected",
    "Email Connected",
    "LinkedIn Premium",
    "Campaigns Running",
    "Unread Positive Conversations",
    "Total Views",
    "Total Invites",
    "Total Messages",
    "Total InMails",
    "Total Follows",
    "Total Likes",
    "Total Endorses",
    "Total Accepted Invites",
    "Total Replies",
    "Positive Sentiment Conversations",
    "Neutral Sentiment Conversations",
    "Negative Sentiment Conversations",
    "Meetings Booked",
    "Deals Closed",
    "LinkedIn Connected At",
    "Email Connected At",
  ];

  const headers = columns.join(",");

  const rows = data.map(user => {
    const linkedinAccount = user.accounts?.linkedin;
    const emailAccount = user.accounts?.email;

    const stats = user.stats || {};
    const actions = stats.actions?.thisPeriod || {};

    // Calculate totals from action data
    const totalViews = actions.linkedin_view?.total || 0;
    const totalInvites = actions.linkedin_invite?.total || 0;
    const totalMessages = actions.linkedin_message?.total || 0;
    const totalInMails = actions.linkedin_inmail?.total || 0;
    const totalFollows = actions.linkedin_follow?.total || 0;
    const totalLikes = actions.linkedin_like_post?.total || 0;
    const totalEndorses = actions.linkedin_endorse?.total || 0;
    const totalAcceptedInvites = actions.linkedin_invite_accepted?.total || 0;
    const totalReplies = actions.reply?.total || 0;

    const positiveSentiment =
      actions.conversation_sentiment_positive?.total || 0;
    const neutralSentiment =
      actions.conversation_sentiment_neutral?.total || 0;
    const negativeSentiment =
      actions.conversation_sentiment_negative?.total || 0;
    const meetingsBooked =
      actions.conversation_sentiment_meeting_booked?.total || 0;
    const dealsClosed = actions.conversation_sentiment_deal_closed?.total || 0;

    const rowData = [
      `"${user.email || ""}"`,
      `"${user.first_name || ""}"`,
      `"${user.last_name || ""}"`,
      `"${user.enabled ? "Active" : "Inactive"}"`,
      `"${user.pro ? "Yes" : "No"}"`,
      `"${linkedinAccount ? "Yes" : "No"}"`,
      `"${emailAccount ? "Yes" : "No"}"`,
      `"${linkedinAccount?.data?.premium ? "Yes" : "No"}"`,
      `"${stats.campaignsRunning || 0}"`,
      `"${stats.unreadPositiveConversations || 0}"`,
      `"${totalViews}"`,
      `"${totalInvites}"`,
      `"${totalMessages}"`,
      `"${totalInMails}"`,
      `"${totalFollows}"`,
      `"${totalLikes}"`,
      `"${totalEndorses}"`,
      `"${totalAcceptedInvites}"`,
      `"${totalReplies}"`,
      `"${positiveSentiment}"`,
      `"${neutralSentiment}"`,
      `"${negativeSentiment}"`,
      `"${meetingsBooked}"`,
      `"${dealsClosed}"`,
      `"${
        linkedinAccount?.connected_at
          ? new Date(linkedinAccount.connected_at).toLocaleDateString()
          : ""
      }"`,
      `"${
        emailAccount?.connected_at
          ? new Date(emailAccount.connected_at).toLocaleDateString()
          : ""
      }"`,
    ];

    return rowData.join(",");
  });

  return [headers, ...rows].join("\n");
};

export const downloadCSV = (csvContent, filename = "users.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
