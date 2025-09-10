import React, { useState } from "react";

const Blacklist = () => {
  const [blacklist, setBlacklist] = useState([]);

  const handleChange = e => {
    const values = e.target.value.split("\n").filter(v => v.trim() !== "");
    setBlacklist(values);
  };
  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D]">
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-[710px] rounded-[8px] shadow-md">
          <p className="text-[20px] font-medium">Blacklist</p>
          <ul className="list-disc list-inside space-y-1 text-[#6D6D6D] font-normal text-sm">
            <li>Add one item per row.</li>
            <li>
              Company name (exact match only) or domain, without 'https://' or
              'www'.
            </li>
            <li>
              You can also blacklist profiles by their LinkedIn Profile URL.
            </li>
            <li>
              All the items that were entered will be applied for the selected
              users only.
            </li>
          </ul>
          <textarea
            placeholder="www.apple.com"
            className="w-full border border-[#7E7E7E] min-h-[400px] p-3 text-[14px] font-normal focus:outline-none rounded-[6px]"
            value={blacklist.join("\n")}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-[370px] shadow-md rounded-[8px]">
          <p className="text-[20px] font-medium">Applies to Users</p>
          <hr className="border-[#6D6D6D]" />
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-x-[18px]">
              <input
                type="checkbox"
                className="w-[14px] h-[14px] accent-blue-600 cursor-pointer"
              />
              <span className="text-sm font-normal text-[#6D6D6D]">
                Select All
              </span>
            </div>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="checkbox"
                className="w-[14px] h-[14px] accent-blue-600 cursor-pointer"
              />
              <span className="text-sm font-normal text-[#6D6D6D]">
                edgar1@zopto.com
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-end">
        <div className="flex items-center gap-x-3 mt-4 ">
          <button className="px-4 py-1 w-[130px] text-white bg-[#7E7E7E] border border-[#7E7E7E] cursor-pointer rounded-[4px]">
            View Logs
          </button>
          <button className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer rounded-[4px]">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blacklist;
