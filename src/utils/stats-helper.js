import {
  AcceptIcon,
  CalenderIcon,
  DownloadIcon,
  DropArrowIcon,
  EmailIcon2,
  FilterIcon,
  FollowsIcon,
  InMailsIcon,
  InvitesIcon,
  Like,
  MessageIcon,
  RepliesIcon,
  Star,
  Thumb,
  ViewIcon,
} from "../components/Icons"
import jaroWinkler from "talisman/metrics/jaro-winkler";
import levenshtein from "talisman/metrics/levenshtein";

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a, b) {
  const jw = jaroWinkler(a, b);
  const levNorm = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  return (jw * 0.7 + levNorm * 0.3);
}

export function clusterTitles(jobs, threshold = 0.6) {
  const clusters = [];

  jobs.forEach(job => {
    const norm = normalizeTitle(job.title);

    let found = clusters.find(c => similarity(c.base, norm) >= threshold);

    if (found) {
      found.value += job.count;
      found.originals.push(job.title);
    } else {
      clusters.push({
        base: norm,
        title: job.title,
        count: job.count,
        originals: [job.title],
      });
    }
  });

  return clusters;
}


export const metricConfig = [
  {
    key: "linkedin_view",
    title: "Views",
    icon: ViewIcon,
    tooltip: "This is the number of LinkedIn views.",
  },
  {
    key: "linkedin_invite",
    title: "Invites",
    icon: InvitesIcon,
    tooltip: "Number of invites sent.",
  },
  {
    key: "linkedin_invite_accepted",
    title: "Accepted",
    icon: AcceptIcon,
    tooltip: "Invites that were accepted.",
  },
  {
    key: "linkedin_follow",
    title: "Follows",
    icon: FollowsIcon,
    tooltip: "Number of profiles followed.",
  },
  {
    key: "linkedin_inmail",
    title: "InMails",
    icon: InMailsIcon,
    tooltip: "Number of InMails sent.",
  },
  {
    key: "linkedin_message",
    title: "LinkedIn Messages",
    icon: MessageIcon,
    tooltip: "Messages sent via LinkedIn.",
  },
  {
    key: "linkedin_reply",
    title: "Replies",
    icon: RepliesIcon,
    tooltip: "Replies received.",
  },
  {
    key: "linkedin_like_post",
    title: "Post Likes",
    icon: Like,
    tooltip: "Likes on posts.",
  },
  {
    key: "linkedin_endorse",
    title: "Endorsement",
    icon: Star,
    tooltip: "Received endorsements.",
  },
  {
    key: "email_message",
    title: "Email Messages",
    icon: EmailIcon2,
    tooltip: "Messages sent via email.",
  },
];

export function getPreviousPeriod(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);

  // number of days in current range
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // previous period ends 1 day before current start
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);

  // previous period start = prevEnd - (diffDays - 1)
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - diffDays + 1);

  return {
    prevFrom: prevStart.toISOString().slice(0, 10),
    prevTo: prevEnd.toISOString().slice(0, 10),
  };
}

export function generateDateRange(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  const dates = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}