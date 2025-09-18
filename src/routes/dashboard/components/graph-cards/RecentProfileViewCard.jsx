import { useState } from "react";
import profile1 from "../../../../assets/profile1.png"; // Update path if needed
import {
  LeftTriangleIcon,
  RightTriangleIcon,
} from "../../../../components/Icons.jsx";
import TooltipInfo from "../TooltipInfo";

const profiles = [
  {
    image: profile1,
    name: "Julien Mauff",
    connection: "2nd",
    role: "Software Developer in the Financial Services industry",
  },
  // You can add more profiles here for testing the slider
  {
    image: profile1,
    name: "Alex Renner",
    connection: "3rd",
    role: "DevOps Engineer at Fintech Corp",
  },
];

export default function RecentProfileViewCard() {
  const [current, setCurrent] = useState(0);

  const prev = () => {
    setCurrent(prev => (prev === 0 ? profiles.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent(prev => (prev === profiles.length - 1 ? 0 : prev + 1));
  };

  const profile = profiles[current];

  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full relative h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] mb-0">
        Recent Profile Views
      </div>

      <div className="flex flex-col items-center text-center relative">
        <img
          src={profile.image}
          alt={profile.name}
          className="w-20 h-20 rounded-full mb-2"
        />
        <div className="flex gap-2 items-center">
          <div className="text-[12px] font-medium text-gray-900">
            {profile.name}
          </div>
          <span className="w-1 h-1 bg-white rounded-full border border-1-grey"></span>
          <span className="text-[12px] font-normal">{profile.connection}</span>
        </div>
        <div className="text-[10px] text-grey w-[80%] mt-[7px]">
          {profile.role}
        </div>

        <div className=" flex justify-between items-center absolute right-0 left-0 bottom-5 w-full">
          <button onClick={prev}>
            <LeftTriangleIcon className="w-2.5 h-2.5 fill-[#7E7E7E] hover:text-gray-700 cursor-pointer" />
          </button>
          <button onClick={next}>
            <RightTriangleIcon className="w-3 h-3 fill-[#7E7E7E] hover:text-gray-700 cursor-pointer" />
          </button>
        </div>
      </div>

      <TooltipInfo
        text="This shows the percentage of responses received via different outreach types."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
}
