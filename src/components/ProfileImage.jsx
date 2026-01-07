import { useState, useEffect } from "react";
import no_image from "../assets/no_image.png";

const S3_BASE_URL = "https://zl-profile-images.s3.amazonaws.com";

const getS3ImageUrl = profileId => `${S3_BASE_URL}/${profileId}.jpg`;

/**
 * ProfileImage component with S3 caching and fallback chain
 * @param {Object} props
 * @param {Object} props.profile - Profile object with profile_id and profile_picture_url
 * @param {string} props.size - Tailwind size classes (e.g., "w-10 h-10")
 * @param {string} props.className - Additional classes (optional)
 * @param {boolean} props.linkToProfile - Whether to wrap in link to LinkedIn (optional)
 */
const ProfileImage = ({
  profile,
  size = "w-10 h-10",
  className = "",
  linkToProfile = false,
}) => {
  // Fallback chain: S3 -> LinkedIn -> no_image
  const getInitialSrc = () => {
    if (profile?.profile_id) {
      return getS3ImageUrl(profile.profile_id);
    }
    if (profile?.profile_picture_url) {
      return profile.profile_picture_url;
    }
    return no_image;
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc());
  const [imgError, setImgError] = useState(false);

  const s3Url = profile?.profile_id
    ? getS3ImageUrl(profile.profile_id)
    : null;

  // Reset image source when profile changes
  useEffect(() => {
    setImgSrc(getInitialSrc());
    setImgError(false);
  }, [profile?.profile_id, profile?.profile_picture_url]);

  const handleError = () => {
    // Don't handle errors for the no_image - just show it even if it fails
    if (imgSrc === no_image) {
      return;
    }

    // If S3 URL fails, try LinkedIn URL
    if (imgSrc === s3Url && profile?.profile_picture_url) {
      setImgSrc(profile.profile_picture_url);
      return;
    }

    // If LinkedIn URL fails (or no LinkedIn URL), use no_image
    if (
      imgSrc === profile?.profile_picture_url ||
      (imgSrc === s3Url && !profile?.profile_picture_url)
    ) {
      setImgSrc(no_image);
      return;
    }

    // All fallbacks failed, show placeholder
    setImgError(true);
  };

  if (imgError) {
    return (
      <div className={`${size} flex-shrink-0 bg-[#D9D9D9] rounded-full ${className}`}></div>
    );
  }

  const imageElement = (
    <div className={`${size} flex-shrink-0 rounded-full overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={profile?.first_name || "Profile"}
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );

  // If linkToProfile is true and profile URL exists, make it clickable
  if (linkToProfile) {
    const profileUrl =
      profile?.classic_profile_url || profile?.sales_profile_url;
    if (profileUrl) {
      return (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer block"
        >
          {imageElement}
        </a>
      );
    }
  }

  return imageElement;
};

export default ProfileImage;
