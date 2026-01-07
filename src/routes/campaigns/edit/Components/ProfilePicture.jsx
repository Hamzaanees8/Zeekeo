import ProfileImage from "../../../../components/ProfileImage";

// Component to handle profile picture with fallbacks
const ProfilePicture = ({ profile }) => {
  return (
    <ProfileImage
      profile={profile}
      size="w-[30px] h-[30px]"
      linkToProfile={true}
    />
  );
};

export default ProfilePicture;
