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
import {
  jobTitleKeywordMap,
  standardJobTitles,
} from "../data/standardJobTitles";
import {
  industryKeywordMap,
  standardIndustries,
} from "../data/standardIndustries";
import { standardLocations } from "../data/standardLocations";

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeTitle(title) {
  // console.log("normalizing title:", title);
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(
      /\b(gtm|ai|ml|llm|startup|founding|team|platform|solutions|company|inc|llc|ltd|group)\b/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a, b) {
  const jw = jaroWinkler(a, b);
  const levNorm = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  return jw * 0.7 + levNorm * 0.3;
}

export function matchTextByKeywords(value, keywordsMap) {
  //console.log("matching by keywords:", value);
  for (const [standard, keywords] of Object.entries(keywordsMap)) {
    if (keywords.some((k) => value.includes(k.toLowerCase()))) {
      return standard;
    }
  }
  return null;
}

/**
 * Match a value against a standard list using keyword and fuzzy similarity
 */
export function matchToStandardList(
  value,
  standardList,
  threshold = 0.4,
  type = "general",
) {
  if (!value || !standardList?.length) return value;

  const normalized = normalizeTitle(value);

  // Keyword-based match
  if (type === "industry" || type === "title") {
    const keywordsMap =
      type === "industry" ? industryKeywordMap : jobTitleKeywordMap;
    const keywordMatch = matchTextByKeywords(normalized, keywordsMap);
    if (keywordMatch) return keywordMatch;
  }

  // Fuzzy match fallback
  let best = { title: value, score: 0 };

  for (const std of standardList) {
    const stdNorm = normalizeTitle(std);
    const score = similarity(stdNorm, normalized);
    if (score > best.score) best = { title: std, score };
  }

  // Confidence threshold
  return best.score >= threshold ? best.title : value;
}

/**
 * Align clusters to a known standard list (e.g., job titles, industries, locations)
 */
export function alignToStandardList(clusters, standardList, type = "general") {
  const standardized = {};

  clusters.forEach((item) => {
    const stdName = matchToStandardList(item.title, standardList, 0.5, type);
    if (!standardized[stdName]) {
      standardized[stdName] = {
        title: stdName,
        count: 0,
        originals: [],
      };
    }
    standardized[stdName].count += item.count;
    standardized[stdName].originals.push(...item.originals);
  });

  // Convert object back to array
  return Object.values(standardized);
}

export const sortData = (data) => [...data].sort((a, b) => b.count - a.count);

export function clusterTitles(jobs, threshold = 0.6) {
  const clusters = [];

  jobs.forEach((job) => {
    // console.log("clustering job title:", job);

    if (!job?.title) {
      return;
    }
    const norm = normalizeTitle(job.title);

    let found = clusters.find((c) => similarity(c.base, norm) >= threshold);

    if (found) {
      found.count += job.count;
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

  return sortData(clusters);
}

export function limitDistributionsToTopN(distributions, limit = 50) {
  if (!Array.isArray(distributions) || distributions.length === 0) return [];

  // Always sort descending by count
  const sorted = [...distributions].sort(
    (a, b) => (b.count || 0) - (a.count || 0),
  );

  // If length is within limit, just return sorted
  if (sorted.length <= limit) {
    return sorted;
  }

  // Otherwise, keep top (limit - 1)
  const top = sorted.slice(0, limit - 1);
  const others = sorted.slice(limit - 1);

  const totalOthersCount = others.reduce(
    (sum, item) => sum + (item.count || 0),
    0,
  );
  const mergedOriginals = others.flatMap((o) => o.originals || []);

  const othersEntry = {
    base: "others",
    title: "Others",
    count: totalOthersCount,
    originals: mergedOriginals,
  };

  return [...top, othersEntry];
}

function pickFirstOrNull(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }
  return null;
}

// Flattens a profile into the relevant attributes and metrics
const normalizeProfile = (p) => {
  const currentPos = p.current_position || {};
  const workExperience = p.work_experience || {};

  const finalTitle =
    pickFirstOrNull(currentPos.role) ||
    pickFirstOrNull(workExperience.role) ||
    p.headline ||
    "Unknown";

  const finalLocation =
    pickFirstOrNull(currentPos.location) ||
    pickFirstOrNull(workExperience.location) ||
    "Unknown";

  const finalIndustry = pickFirstOrNull(currentPos.industry) || "Unknown";

  return {
    title: finalTitle,
    industry: finalIndustry,
    location: finalLocation,
    isAccepted: !!p.connected_at,
    isReplied: !!p.replied_at,
    isPositive: p.isPositive === true,
  };
};

// Generic function to add a count for a metric (e.g., 'isAccepted') to a specific distribution list (e.g., 'title_distributions')
const aggregateMetricToDistribution = (
  distributions,
  key,
  metricValue,
  fieldName,
) => {
  if (metricValue) {
    // Use an internal, un-clustered format { title: 'CEO', count: 1 }
    const distributionKey = `${fieldName}_distributions`;
    distributions[distributionKey].push({
      title: key, // Using 'title' as the generic key for clustering later
      count: 1,
    });
  }
};

export const buildIcpInsightsByMetric = (profiles) => {
  const rawLists = {
    acceptance: {
      title_distributions: [],
      industry_distributions: [],
      location_distributions: [],
    },
    replies: {
      title_distributions: [],
      industry_distributions: [],
      location_distributions: [],
    },
    positive_responses: {
      title_distributions: [],
      industry_distributions: [],
      location_distributions: [],
    },
  };

  for (const p of profiles) {
    // Step 1: Normalize the profile data
    const profile = normalizeProfile(p);

    // Step 2: Define metrics and their corresponding output keys
    const metricsMap = [
      { check: profile.isAccepted, key: "acceptance" },
      { check: profile.isReplied, key: "replies" },
      { check: profile.isPositive, key: "positive_responses" },
    ];

    // Step 3: Filter and add raw data to the appropriate lists
    for (const metric of metricsMap) {
      if (metric.check) {
        // Only add to the lists if the metric condition is met
        rawLists[metric.key].title_distributions.push(profile.title);
        rawLists[metric.key].industry_distributions.push(profile.industry);
        rawLists[metric.key].location_distributions.push(profile.location);
      }
    }
  }

  //console.log("Built ICP Insights Raw Lists:", rawLists);

  return rawLists;
};

export const getRawDistributionList = (
  rawData,
  distributionType,
  filterType = "all",
) => {
  // 1. Determine the key used in the rawData object (e.g., 'title_distributions')
  const distributionKey = `${distributionType}_distributions`;

  if (filterType !== "all") {
    // --- Scenario 1: Filter by a specific metric type ---

    // Check if the requested filterType exists in the rawData
    if (rawData[filterType] && rawData[filterType][distributionKey]) {
      return rawData[filterType][distributionKey];
    }

    // Return empty array if the filter/key is invalid
    console.warn(
      `Invalid filterType or distributionType for filtering: ${filterType}.${distributionKey}`,
    );
    return [];
  }

  // --- Scenario 2: Combine all metric types (filterType = 'all') ---

  let combinedList = [];

  // Iterate over the three main metric keys (acceptance, replies, positive_responses)
  const metricKeys = Object.keys(rawData);

  for (const metricKey of metricKeys) {
    if (rawData[metricKey] && rawData[metricKey][distributionKey]) {
      // Use spread operator to merge the arrays
      combinedList.push(...rawData[metricKey][distributionKey]);
    }
  }

  return combinedList;
};

export const aggregateDistributionList = (rawList) => {
  // 1. Use a Map or a simple object to store counts for each unique item.
  const countsMap = new Map();

  for (const item of rawList) {
    // Normalize the item (trim, handle case-insensitivity if needed)
    const key = item.trim();

    // Increment the count
    const currentCount = countsMap.get(key) || 0;
    countsMap.set(key, currentCount + 1);
  }

  //console.log("Counts Map:", countsMap);

  // 2. Transform the Map/object into the desired array format.
  const aggregatedList = [];
  countsMap.forEach((count, title) => {
    aggregatedList.push({
      // Renaming the key to 'title' for consistency, even if it's an industry or location
      title: title,
      count: count,
    });
  });

  // Optional: Sort the list by count (descending) for better visualization
  aggregatedList.sort((a, b) => b.count - a.count);

  // console.log("Aggregated List before clustering:", aggregatedList);

  const clusters = clusterTitles(aggregatedList);

  return clusters;
};

export const finalizeDistributionData = (aggregatedList, type = "general") => {
  const standardList =
    type === "title"
      ? standardJobTitles
      : type === "industry"
      ? standardIndustries
      : type === "location"
      ? standardLocations
      : [];
  return alignToStandardList(aggregatedList, standardList, type);
};

export const mergeICPInsightsByDate = (apiData) => {
  //console.log("api response", apiData);
  const merged = {
    acceptance: initEmpty(),
    replies: initEmpty(),
    positive_responses: initEmpty(),
  };

  Object.values(apiData).forEach((dayData) => {
    const icp = dayData.icp_insights || {};
    // console.log("day data", dayData);

    ["acceptance", "replies", "positive_responses"].forEach((type) => {
      const section = icp[type] || {};
      [
        "title_distributions",
        "industry_distributions",
        "location_distributions",
      ].forEach((distType) => {
        merged[type][distType].push(...(section[distType] || []));
      });
    });
  });

  // Step 1: Aggregate raw titles/industries/locations
  for (const type of Object.keys(merged)) {
    for (const distType of Object.keys(merged[type])) {
      merged[type][distType] = clusterTitles(merged[type][distType]);

      // Step 2: Align to standard lists
      if (distType === "title_distributions") {
        merged[type][distType] = alignToStandardList(
          merged[type][distType],
          standardJobTitles,
          "title",
        );
      } else if (distType === "industry_distributions") {
        merged[type][distType] = alignToStandardList(
          merged[type][distType],
          standardIndustries,
          "industry",
        );
      } else if (distType === "location_distributions") {
        merged[type][distType] = alignToStandardList(
          merged[type][distType],
          standardLocations,
          "location",
        );
      }
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
export const aggregateAllInsightTypes = (mergedInsights) => {
  const combined = initEmpty();

  ["acceptance", "replies", "positive_responses"].forEach((type) => {
    [
      "title_distributions",
      "industry_distributions",
      "location_distributions",
    ].forEach((distType) => {
      combined[distType].push(...(mergedInsights[type][distType] || []));
    });
  });

  // console.log("combined before align", combined);

  for (const distType of Object.keys(combined)) {
    combined[distType] = clusterTitles(combined[distType]);

    if (distType === "title_distributions") {
      combined[distType] = alignToStandardList(
        combined[distType],
        standardJobTitles,
        "title",
      );
    } else if (distType === "industry_distributions") {
      combined[distType] = alignToStandardList(
        combined[distType],
        standardIndustries,
        "industry",
      );
    } else if (distType === "location_distributions") {
      combined[distType] = alignToStandardList(
        combined[distType],
        standardLocations,
        "location",
      );
    }
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

  const startDate = makeLocalDate(start);
  const endDate = makeLocalDate(end);

  const dates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    dates.push(dateStr);
  }
  return dates;
}

export function makeLocalDate(input) {
  if (input instanceof Date) {
    // Already a Date object, so clone it to avoid mutation
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  if (typeof input === "string") {
    const [year, month, day] = input.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  throw new Error("Invalid date input: " + input);
}

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)} min${seconds >= 120 ? "s" : ""} ago`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)} hour${
      seconds >= 7200 ? "s" : ""
    } ago`;
  if (seconds < 2592000)
    return `${Math.floor(seconds / 86400)} day${
      seconds >= 172800 ? "s" : ""
    } ago`;

  return new Date(timestamp).toLocaleDateString();
};
