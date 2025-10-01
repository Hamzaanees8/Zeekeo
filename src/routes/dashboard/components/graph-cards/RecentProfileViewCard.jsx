import { useState } from "react";
import {
  LeftTriangleIcon,
  RightTriangleIcon,
} from "../../../../components/Icons.jsx";
import TooltipInfo from "../TooltipInfo";

export default function RecentProfileViewCard({ profiles = [] }) {
  const [current, setCurrent] = useState(0);

  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-[#FFFFFF] shadow-md p-4 w-full h-full rounded-[8px] flex items-center justify-center">
        <span className="text-gray-500 text-sm">No profiles available</span>
      </div>
    );
  }

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? profiles.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === profiles.length - 1 ? 0 : prev + 1));
  };

  const profile = profiles[current];

  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full h-full rounded-[8px] flex flex-col">
      <div className="text-[16px] text-[#1E1D1D] mb-2">Recent Profile Views</div>

      {/* Center profile info in available space */}
      <div className="flex flex-col flex-1 items-center justify-center text-center relative">
        <img
          src={profile.profile_picture}
          alt={profile.name}
          className="w-20 h-20 rounded-full mb-2"
        />
        <div className="flex gap-2 items-center">
          <div className="text-[12px] font-medium text-gray-900">
            {profile.name}
          </div>
          <span className="w-1 h-1 bg-white rounded-full border border-gray-400"></span>
          <span className="text-[12px] font-normal">{profile.network_distance}</span>
        </div>
        <div className="text-[10px] text-gray-500 w-[80%] mt-[7px]">
          {profile.headline}
        </div>

        {/* Navigation arrows pinned to bottom */}
        <div className="flex justify-between items-center absolute right-0 left-0 bottom-4 px-6">
          <button onClick={prev}>
            <LeftTriangleIcon className="w-3 h-3 fill-[#7E7E7E] hover:fill-gray-700 cursor-pointer" />
          </button>
          <button onClick={next}>
            <RightTriangleIcon className="w-3 h-3 fill-[#7E7E7E] hover:fill-gray-700 cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Tooltip pinned bottom-right */}
      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
}
