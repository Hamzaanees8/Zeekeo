/**
 * Checks if the current domain is a whitelabel domain.
 * Returns true for localhost (for testing) and whitelabel domains.
 * Returns false for zeekeo.com domains (except test-wl subdomain).
 */
export const isWhitelabelDomain = () => {
  const hostname = window.location.hostname;

  // Treat localhost as whitelabel for testing
  if (hostname === "localhost" || hostname.includes("127.0.0.1")) {
    return true;
  }

  // Special case for testing whitelabel on zeekeo.com subdomain
  if (hostname.includes("test-wl.launchpad.zeekeo.com")) {
    return true;
  }

  // Not whitelabel if main zeekeo.com domain
  if (hostname.includes("zeekeo.com")) {
    return false;
  }

  // Any other domain is considered whitelabel
  return true;
};
