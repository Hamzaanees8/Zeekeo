import React, { useState } from "react";
import { SecurityIcon } from "../../../../components/Icons";
import SideBar from "./Sidebar";

const Dashboard = () => {
  const [background, setBackground] = useState("");
  const [menuBackground, setMenuBackground] = useState("");
  const [menuWidget, setMenuWidget] = useState("");
  const [logoWidth, setLogoWidth] = useState("180 px");
  const [logoImage, setLogoImage] = useState(null);
  const normalizedWidth = logoWidth.replace(/\s/g, "");
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(URL.createObjectURL(file)); // creates a preview link
    }
  };
  const isValidHex = value =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(value);
  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D]">
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-[415px]">
          <div className="flex flex-col">
            <p className="text-base font-normal mb-[2px]">Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={background}
                onChange={e => setBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px]"
                style={{
                  backgroundColor: isValidHex ? background : "transparent",
                }}
              ></div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-base font-normal mb-[2px]">Menu Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={menuBackground}
                onChange={e => setMenuBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px]"
                style={{
                  backgroundColor: isValidHex(menuBackground)
                    ? menuBackground
                    : "transparent",
                }}
              ></div>
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-base font-normal mb-[2px]">Menu Widget</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={menuWidget}
                onChange={e => setMenuWidget(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px]"
                style={{
                  backgroundColor: isValidHex(menuWidget)
                    ? menuWidget
                    : "transparent",
                }}
              ></div>
            </div>
          </div>
          <label>
            <span className="text-base font-normal">Logo Image</span>
            <div className="flex h-[40px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="logo-upload"
              />
              <input
                placeholder="Select your logo"
                value={logoImage ? logoImage : ""}
                readOnly
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
              />
              <label
                htmlFor="logo-upload"
                className="bg-[#6D6D6D] text-white px-4 cursor-pointer flex items-center justify-center"
              >
                Browse
              </label>
            </div>
          </label>
          <label>
            <span className="text-base font-normal">Logo Width</span>
            <div className="flex h-[40px]">
              <input
                value={logoWidth}
                placeholder="150 px"
                onChange={e => setLogoWidth(e.target.value)}
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
              />
            </div>
          </label>
          <div className="flex items-center justify-end mt-[100px]"></div>
        </div>
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins w-[670px] px-[70px] bg-[#EBEBEB]">
          <div className="w-full border border-[#7E7E7E] h-full flex gap-y-8 items-center">
            <div className="overflow-hidden">
              <SideBar
                bg={menuBackground}
                logo={logoImage}
                width={normalizedWidth}
                widget={menuWidget}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
