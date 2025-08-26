import { useState } from "react";
import { EmailIcon } from "../../../../components/Icons";

const Launch = () => {
  const [enabled, setEnabled] = useState(false);
  const value = 60; // or dynamic
  const percentage = Math.min((value / 100) * 100, 100); // keep it a number

  return (
    <div className="flex items-center justify-center">
      <div className=" flex flex-col gap-y-5 border border-[#000000] w-[650px] h-[420px] bg-[#FFFFFF] px-[90px] py-[50px] ">
        <div className=" flex flex-col gap-y-4 items-center justify-start">
          <EmailIcon />
          <h1 className="font-medium text-[32px] text-[#6D6D6D] text-center">
            Your campaign is ready to be created!
          </h1>
          <div className="text-[#7E7E7E] text-sm font-normal">
            <p>You can enable auto launch - which launches the campaign </p>
            <p>once profiles are fetched. You can create the campaign now.</p>
          </div>
          <div className="flex items-center justify-center gap-x-9">
            <p className="text-[#7E7E7E] text-xs font-normal">Auto Launch</p>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-[34px] h-4 flex items-center cursor-pointer rounded-full p-1 duration-300 ${enabled ? "bg-[#0387FF]" : "bg-gray-300"
                }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ${enabled ? "translate-x-4" : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </div>
        {/* <div className="flex flex-col gap-y-2.5 justify-start items-start">
          <p className="text-[#454545] text-xs font-normal">
            Fetching Profiles
          </p>
          <div className="h-[12px] bg-[#f3f8ff] rounded-full overflow-hidden w-full max-w-md">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundImage: `repeating-linear-gradient(
      125deg,
      #03045E,
      #03045E 8px,
      #04479C 8px,
      #04479C 15px
     )`,
              }}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Launch;