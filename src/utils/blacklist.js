/**
 * Normalize LinkedIn URLs to a consistent format for matching
 * @param {string} url - The URL to normalize
 * @returns {string|null} - Normalized URL or null if not a valid LinkedIn URL
 */
function normalizeLinkedInUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    url = url.trim();
    if (!url.match(/^https?:\/\//)) {
      url = "https://" + url;
    }

    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.includes("linkedin.com")) {
      return null;
    }

    let normalizedHostname = parsedUrl.hostname.toLowerCase();
    if (normalizedHostname.startsWith("www.")) {
      normalizedHostname = normalizedHostname.substring(4);
    }

    let normalizedPath = parsedUrl.pathname.toLowerCase();
    if (normalizedPath.endsWith("/") && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    return `https://${normalizedHostname}${normalizedPath}`;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a string looks like an email address
 */
function isEmail(str) {
  return typeof str === "string" && str.includes("@") && str.includes(".");
}

/**
 * Normalize company website URL for matching
 */
function normalizeCompanyUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    url = url.trim();
    if (!url.match(/^https?:\/\//)) {
      url = "https://" + url;
    }

    const parsedUrl = new URL(url);
    let hostname = parsedUrl.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }

    return hostname;
  } catch (error) {
    return null;
  }
}

/**
 * Pre-index blacklist entries into Sets for O(1) lookups
 * This is the key optimization - we process the blacklist ONCE
 * instead of re-parsing for every profile
 *
 * @param {Array<string>} blacklist - Array of blacklist entries
 * @returns {Object} - Indexed blacklist with Sets for each type
 */
export function createBlacklistIndex(blacklist) {
  const index = {
    linkedinUrls: new Set(),
    emails: new Set(),
    companies: new Set(),
    websites: new Set(),
    identifiers: new Set(),
  };

  if (!blacklist || blacklist.length === 0) {
    return index;
  }

  for (const entry of blacklist) {
    if (!entry || typeof entry !== "string") continue;

    const normalized = entry.trim().toLowerCase();
    if (!normalized) continue;

    // Add to identifiers (covers IDs, public identifiers, and plain text)
    index.identifiers.add(normalized);

    // Check if it's a LinkedIn URL
    const linkedinUrl = normalizeLinkedInUrl(entry);
    if (linkedinUrl) {
      index.linkedinUrls.add(linkedinUrl);
    }

    // Check if it's an email
    if (isEmail(entry)) {
      index.emails.add(normalized);
    }

    // Check if it's a website/domain
    const website = normalizeCompanyUrl(entry);
    if (website) {
      index.websites.add(website);
    }

    // Also add as potential company name
    index.companies.add(normalized);
  }

  return index;
}

/**
 * Check if a profile is blacklisted using pre-indexed Sets (O(1) lookups)
 * @param {Object} profile - Profile object
 * @param {Object} index - Pre-indexed blacklist from createBlacklistIndex
 * @returns {boolean} - True if profile is blacklisted
 */
export function isProfileBlacklistedFast(profile, index) {
  // Check LinkedIn URLs
  const profileUrls = [
    profile.classic_profile_url,
    profile.sales_profile_url,
    profile.public_identifier
      ? `https://linkedin.com/in/${profile.public_identifier}`
      : null,
  ].filter(Boolean);

  for (const url of profileUrls) {
    const normalized = normalizeLinkedInUrl(url);
    if (normalized && index.linkedinUrls.has(normalized)) {
      return true;
    }
  }

  // Check profile IDs (O(1) Set lookups)
  if (profile.classic_id && index.identifiers.has(profile.classic_id.toLowerCase())) {
    return true;
  }
  if (profile.sales_navigator_id && index.identifiers.has(profile.sales_navigator_id.toLowerCase())) {
    return true;
  }
  if (profile.public_identifier && index.identifiers.has(profile.public_identifier.toLowerCase())) {
    return true;
  }

  // Check email addresses
  const profileEmails = [
    profile.email,
    profile.contact_email,
    profile.email_address,
  ].filter(Boolean);

  for (const email of profileEmails) {
    if (index.emails.has(email.toLowerCase())) {
      return true;
    }
  }

  // Check company names
  const companyNames = [
    ...(profile.current_positions?.map(p => p.company) || []),
    ...(profile.work_experience?.map(e => e.company) || []),
  ].filter(Boolean);

  for (const company of companyNames) {
    if (index.companies.has(company.toLowerCase())) {
      return true;
    }
  }

  // Check websites
  const profileWebsites = [
    ...(profile.websites || []),
    ...(profile.contact_info?.websites || []),
  ].filter(Boolean);

  for (const website of profileWebsites) {
    const normalized = normalizeCompanyUrl(website);
    if (normalized && index.websites.has(normalized)) {
      return true;
    }
  }

  return false;
}

/**
 * Add computed blacklisted status to profiles using fast indexed lookup
 * @param {Array<Object>} profiles - Array of profile objects
 * @param {Array<string>} blacklist - Array of blacklist entries
 * @returns {Array<Object>} - Profiles with blacklisted field added
 */
export function addBlacklistStatus(profiles, blacklist) {
  if (!blacklist || blacklist.length === 0) {
    return profiles.map(p => ({ ...p, blacklisted: false }));
  }

  // Create index ONCE for all profiles
  const index = createBlacklistIndex(blacklist);

  // Now check each profile with O(1) lookups
  return profiles.map(profile => ({
    ...profile,
    blacklisted: isProfileBlacklistedFast(profile, index),
  }));
}

// Keep old functions for backwards compatibility
export function checkProfileMatch(profile, entry) {
  const index = createBlacklistIndex([entry]);
  return isProfileBlacklistedFast(profile, index);
}

export function isProfileBlacklisted(profile, blacklist) {
  if (!blacklist || blacklist.length === 0) {
    return false;
  }
  const index = createBlacklistIndex(blacklist);
  return isProfileBlacklistedFast(profile, index);
}
