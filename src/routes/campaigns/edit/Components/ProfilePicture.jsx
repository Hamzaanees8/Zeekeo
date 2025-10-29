import { useState } from "react";
import no_image from "../../../../assets/no_image.png";

// Component to handle profile picture with fallbacks
const ProfilePicture = ({ profile }) => {
  const getInitialSrc = () => {
    if (profile.profile_picture_url) {
      return profile.profile_picture_url;
    }
    // if (profile.public_identifier) {
    //   return `https://datalink-img.s3.amazonaws.com/profile/${profile.public_identifier}.jpg`;
    // }
    return no_image;
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc());
  const [imgError, setImgError] = useState(false);

  const handleError = () => {
    // Don't handle errors for the no_image.png - just show it even if it fails
    if (imgSrc === no_image) {
      return;
    }

    // If profile_picture_url fails, use no_image
    if (imgSrc === profile.profile_picture_url) {
      setImgSrc(no_image);
    } else {
      // All fallbacks failed, show placeholder
      setImgError(true);
    }

    // Datalink fallback option (commented out for now)
    // if (imgSrc === profile.profile_picture_url && profile.public_identifier) {
    //   // First fallback: try S3 with public_identifier (only if it exists)
    //   setImgSrc(
    //     `https://datalink-img.s3.amazonaws.com/profile/${profile.public_identifier}.jpg`,
    //   );
    // } else if (
    //   profile.public_identifier &&
    //   imgSrc ===
    //     `https://datalink-img.s3.amazonaws.com/profile/${profile.public_identifier}.jpg`
    // ) {
    //   // Second fallback: use no_image
    //   setImgSrc(no_image);
    // } else if (
    //   imgSrc === profile.profile_picture_url &&
    //   !profile.public_identifier
    // ) {
    //   // If no public_identifier, skip directly to no_image
    //   setImgSrc(no_image);
    // } else {
    //   // All fallbacks failed, show placeholder
    //   setImgError(true);
    // }
  };

  const profileUrl = profile.classic_profile_url || profile.sales_profile_url;

  if (imgError) {
    return <div className="w-[30px] h-[30px] bg-[#D9D9D9] rounded-full"></div>;
  }

  const imageElement = (
    <div className="w-[30px] h-[30px] rounded-full overflow-hidden">
      <img
        src={imgSrc}
        alt="Profile"
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );

  // If profile URL exists, make it clickable
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

  return imageElement;
};

export default ProfilePicture;
