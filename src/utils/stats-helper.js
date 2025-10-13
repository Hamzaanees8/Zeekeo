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
} from "../components/Icons";
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
  return jw * 0.7 + levNorm * 0.3;
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

export function limitDistributionsToTopN(distributions, limit = 10) {
  if (!Array.isArray(distributions) || distributions.length === 0) return [];

  // Always sort descending by count
  const sorted = [...distributions].sort((a, b) => (b.count || 0) - (a.count || 0));

  // If length is within limit, just return sorted
  if (sorted.length <= limit) {
    return sorted;
  }

  // Otherwise, keep top (limit - 1)
  const top = sorted.slice(0, limit - 1);
  const others = sorted.slice(limit - 1);

  const totalOthersCount = others.reduce((sum, item) => sum + (item.count || 0), 0);
  const mergedOriginals = others.flatMap(o => o.originals || []);

  const othersEntry = {
    base: "others",
    title: "Others",
    count: totalOthersCount,
    originals: mergedOriginals,
  };

  return [...top, othersEntry];
}


export const mergeICPInsightsByDate = apiData => {
  console.log("api response", apiData);
  const merged = {
    acceptance: initEmpty(),
    replies: initEmpty(),
    positive_responses: initEmpty(),
  };

  Object.values(apiData).forEach(dayData => {
    const icp = dayData.icp_insights || {};
    console.log("day data", dayData);

    ["acceptance", "replies", "positive_responses"].forEach(type => {
      const section = icp[type] || {};
      [
        "title_distributions",
        "industry_distributions",
        "location_distributions",
      ].forEach(distType => {
        merged[type][distType].push(...(section[distType] || []));
      });
    });
  });

  // Aggregate same titles per type
  for (const type of Object.keys(merged)) {
    for (const distType of Object.keys(merged[type])) {
      merged[type][distType] = clusterTitles(merged[type][distType]);
    }
  }

  return merged;
};

const initEmpty = () => ({
  title_distributions: [],
  industry_distributions: [],
  location_distributions: [],
});

export const convertDistributionToPieChartData = (distributionArray = []) => {
  if (!Array.isArray(distributionArray)) return {};
  return distributionArray.reduce((acc, item) => {
    if (!item.title) return acc;
    acc[item.title] = (acc[item.title] || 0) + (item.count || 0);
    return acc;
  }, {});
};

/**
 * Combine acceptance + replies + positive_responses together
 */
export const aggregateAllInsightTypes = mergedInsights => {
  const combined = initEmpty();

  ["acceptance", "replies", "positive_responses"].forEach(type => {
    [
      "title_distributions",
      "industry_distributions",
      "location_distributions",
    ].forEach(distType => {
      combined[distType].push(...(mergedInsights[type][distType] || []));
    });
  });

  // Sum duplicate titles across all types
  for (const distType of Object.keys(combined)) {
    combined[distType] = clusterTitles(combined[distType]);
  }

  return combined;
};

// Define mapping for pillar labels
export const SSI_PILLAR_LABELS = {
  PROFESSIONAL_BRAND: "Establish your professional brand",
  FIND_RIGHT_PEOPLE: "Find the right people",
  INSIGHT_ENGAGEMENT: "Engage with insights",
  STRONG_RELATIONSHIP: "Build relationships",
};

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
