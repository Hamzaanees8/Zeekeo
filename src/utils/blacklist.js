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
    // Remove leading/trailing whitespace
    url = url.trim();

    // Add protocol if missing
    if (!url.match(/^https?:\/\//)) {
      url = "https://" + url;
    }

    // Parse URL
    const parsedUrl = new URL(url);

    // Only process LinkedIn URLs
    if (!parsedUrl.hostname.includes("linkedin.com")) {
      return null;
    }

    // Normalize hostname (remove www.)
    let normalizedHostname = parsedUrl.hostname.toLowerCase();
    if (normalizedHostname.startsWith("www.")) {
      normalizedHostname = normalizedHostname.substring(4);
    }

    // Only keep the path, remove query params and fragments
    let normalizedPath = parsedUrl.pathname.toLowerCase();

    // Remove trailing slash
    if (normalizedPath.endsWith("/") && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    // Construct normalized URL
    return `https://${normalizedHostname}${normalizedPath}`;
  } catch (error) {
    // Invalid URL
    return null;
  }
}

/**
 * Check if a string looks like an email address
 * @param {string} str - String to check
 * @returns {boolean} - True if looks like email
 */
function isEmail(str) {
  return typeof str === "string" && str.includes("@") && str.includes(".");
}

/**
 * Normalize company website URL for matching
 * @param {string} url - URL to normalize
 * @returns {string|null} - Normalized domain or null
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
 * Check if a profile matches a blacklist entry
 * @param {Object} profile - Profile object with identifiers
 * @param {string} entry - Blacklist entry to match against
 * @returns {boolean} - True if profile matches the entry
 */
export function checkProfileMatch(profile, entry) {
  const normalizedEntry = entry.trim().toLowerCase();

  // Check LinkedIn URL match
  const normalizedEntryUrl = normalizeLinkedInUrl(entry);
  if (normalizedEntryUrl) {
    const profileUrls = [
      profile.classic_profile_url,
      profile.sales_profile_url,
      profile.public_identifier
        ? `https://linkedin.com/in/${profile.public_identifier}`
        : null,
    ].filter(Boolean);

    for (const url of profileUrls) {
      const normalizedProfileUrl = normalizeLinkedInUrl(url);
      if (normalizedProfileUrl === normalizedEntryUrl) {
        return true;
      }
    }
  }

  // Check profile IDs (classic_id, sales_navigator_id, public_identifier)
  if (
    profile.classic_id &&
    profile.classic_id.toLowerCase() === normalizedEntry
  ) {
    return true;
  }
  if (
    profile.sales_navigator_id &&
    profile.sales_navigator_id.toLowerCase() === normalizedEntry
  ) {
    return true;
  }
  if (
    profile.public_identifier &&
    profile.public_identifier.toLowerCase() === normalizedEntry
  ) {
    return true;
  }

  // Check email addresses
  if (isEmail(entry)) {
    const profileEmails = [
      profile.email,
      profile.contact_email,
      profile.email_address,
    ].filter(Boolean);

    for (const email of profileEmails) {
      if (email.toLowerCase() === normalizedEntry) {
        return true;
      }
    }
  }

  // Check company name (exact match, case insensitive)
  // Check both current_positions and work_experience for company names
  const currentCompaniesNames = [
    ...(profile.current_positions?.map(position => position.company) || []),
    ...(profile.work_experience?.map(exp => exp.company) || []),
  ].filter(Boolean);
  if (
    currentCompaniesNames.some(name => name.toLowerCase() === normalizedEntry)
  ) {
    return true;
  }

  // Check company website (from profile.websites array or contact_info.websites)
  const normalizedEntryWebsite = normalizeCompanyUrl(entry);
  if (normalizedEntryWebsite) {
    const profileWebsites = [
      ...(profile.websites || []),
      ...(profile.contact_info?.websites || []),
    ].filter(Boolean);

    for (const website of profileWebsites) {
      const normalizedProfileWebsite = normalizeCompanyUrl(website);
      if (
        normalizedProfileWebsite &&
        normalizedProfileWebsite === normalizedEntryWebsite
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a profile is blacklisted
 * @param {Object} profile - Profile object
 * @param {Array<string>} blacklist - Array of blacklist entries
 * @returns {boolean} - True if profile is blacklisted
 */
export function isProfileBlacklisted(profile, blacklist) {
  if (!blacklist || blacklist.length === 0) {
    return false;
  }

  return blacklist.some(entry => checkProfileMatch(profile, entry));
}

/**
 * Add computed blacklisted status to profiles
 * @param {Array<Object>} profiles - Array of profile objects
 * @param {Array<string>} blacklist - Array of blacklist entries
 * @returns {Array<Object>} - Profiles with blacklisted field added
 */
export function addBlacklistStatus(profiles, blacklist) {
  if (!blacklist || blacklist.length === 0) {
    return profiles.map(p => ({ ...p, blacklisted: false }));
  }

  return profiles.map(profile => ({
    ...profile,
    blacklisted: isProfileBlacklisted(profile, blacklist),
  }));
}
