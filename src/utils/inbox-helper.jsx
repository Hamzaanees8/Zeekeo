import {
  FaceIcon,
  FaceIcon1,
  FaceIcon2,
  FaceIcon3,
  FilterProfile,
} from "../components/Icons";

export const formatDate = timestamp => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sentimentOptions = [
  { label: "Sentiment", value: null },
  {
    label: "Positive",
    value: "positive",
    icon: FaceIcon,
    fill: "fill-[#1FB33F]",
  },
  {
    label: "Netural",
    value: "neutral",
    icon: FaceIcon1,
    fill: "fill-[#FFCB4D]",
  },
  {
    label: "Negative",
    value: "negative",
    icon: FaceIcon2,
    fill: "fill-[#DE4B32]",
  },
  {
    label: "Meeting Booked",
    value: "meeting_booked",
    icon: FilterProfile,
    fill: "fill-[#28F0E6]",
  },
  {
    label: "Closed Deals",
    value: "deal_closed",
    icon: FaceIcon3,
    fill: "fill-[#00AAD9]",
  },
];

export const sentimentInfo = sentiment => {
  const sentimentMap = {
    positive: {
      icon: <FaceIcon className="h-[18px] w-[18px] fill-[#1FB33F]" />,
      title: "Positive",
    },
    neutral: {
      icon: <FaceIcon1 className="h-[18px] w-[18px] fill-[#FFCB4D]" />,
      title: "Neutral",
    },
    negative: {
      icon: <FaceIcon2 className="h-[18px] w-[18px] fill-[#DE4B32]" />,
      title: "Negative",
    },
    meeting_booked: {
      icon: <FilterProfile className="h-[18px] w-[18px] fill-[#28F0E6]" />,
      title: "Meeting Booked",
    },
    deal_closed: {
      icon: <FaceIcon3 className="h-[18px] w-[18px] fill-[#00AAD9]" />,
      title: "Deal Closed",
    },
  };

  if (!sentimentMap[sentiment]) return null;

  return (
    <span className="flex gap-2" title={sentimentMap[sentiment].title}>
      {sentimentMap[sentiment].icon}
    </span>
  );
};
