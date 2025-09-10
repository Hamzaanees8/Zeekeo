import React, { useEffect, useRef, useState } from "react";
import { SecurityIcon } from "../../../../components/Icons";
import SideBar from "./Sidebar";
import SplitedDashboard from "./SplitedDashboard";
import { set } from "date-fns";
import { HexColorPicker } from "react-colorful";

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = event => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Dashboard = () => {
  const [background, setBackground] = useState("");
  const [menuBackground, setMenuBackground] = useState("");
  const [menuWidget, setMenuWidget] = useState("");

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showMenuBackgroundPicker, setShowMenuBackgroundPicker] =
    useState(false);
  const [showmenuWidgetPicker, setShowmenuWidgetPicker] = useState(false);

  const backgroundPickerRef = useRef(null);
  const menuPickerRef = useRef(null);
  const widgetPickerRef = useRef(null);

  useClickOutside(backgroundPickerRef, () => setShowBackgroundPicker(false));
  useClickOutside(menuPickerRef, () => setShowMenuBackgroundPicker(false));
  useClickOutside(widgetPickerRef, () => setShowmenuWidgetPicker(false));

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
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-[415px] rounded-[8px] shadow-md">
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={background}
                onFocus={() => setShowBackgroundPicker(true)}
                onChange={e => setBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex ? background : "transparent",
                }}
              ></div>
            </div>
            {showBackgroundPicker && (
              <div
                ref={backgroundPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={background} onChange={setBackground} />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Menu Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={menuBackground}
                onFocus={() => setShowMenuBackgroundPicker(true)}
                onChange={e => setMenuBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(menuBackground)
                    ? menuBackground
                    : "transparent",
                }}
              ></div>
            </div>
            {showMenuBackgroundPicker && (
              <div
                ref={menuPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker
                  color={menuBackground}
                  onChange={setMenuBackground}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Menu Widget</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={menuWidget}
                onFocus={() => setShowmenuWidgetPicker(true)}
                onChange={e => setMenuWidget(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(menuWidget)
                    ? menuWidget
                    : "transparent",
                }}
              ></div>
            </div>
            {showmenuWidgetPicker && (
              <div
                ref={widgetPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={menuWidget} onChange={setMenuWidget} />
              </div>
            )}
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
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal rounded-l-[6px]"
              />
              <label
                htmlFor="logo-upload"
                className="bg-[#6D6D6D] text-white px-4 cursor-pointer flex items-center justify-center rounded-r-[6px]"
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
                className="flex-1 border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal rounded-[6px]"
              />
            </div>
          </label>
          <label>
            <span className="text-base font-normal">Switch Theme Color</span>
            <div className="flex items-center justify-between mt-[20px] gap-x-3">
              <button
                onClick={() => {
                  setBackground("#FFFFFF");
                  setMenuBackground("#FFFFFF");
                }}
                className={`flex items-center cursor-pointer gap-x-2.5 px-4 py-2 rounded-lg w-[170px] ${
                  background === "#FFFFFF"
                    ? "border-2 border-[#3BC0C3] text-[#6D6D6D] bg-white"
                    : "border border-[#6D6D6D] bg-white text-[#6D6D6D] hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-3 h-3 border-2 border-[#3BC0C3] p-1 rounded-full ${
                    background === "#FFFFFF" ? "bg-[#3BC0C3]" : "bg-amber-50"
                  }`}
                ></div>
                Light Theme
              </button>

              <button
                onClick={() => {
                  setBackground("#1E1E1E");
                  setMenuBackground("#1E1E1E");
                }}
                className={`flex items-center gap-x-2.5 cursor-pointer px-4 py-2 rounded-lg w-[170px] ${
                  background === "#1E1E1E"
                    ? "border-2 border-[#546081] text-white bg-black"
                    : "border border-[#6D6D6D] bg-black text-white"
                }`}
              >
                <div
                  className={`w-3 h-3 border-2 border-[#546081] p-1 rounded-full ${
                    background === "#1E1E1E" ? "bg-[#546081]" : "bg-amber-50"
                  }`}
                ></div>
                Dark Theme
              </button>
            </div>
          </label>
        </div>
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins w-[670px] px-[70px] bg-[#EBEBEB] rounded-[8px] shadow-md">
          <div className="w-full h-[530px] border border-[#7E7E7E] flex rounded-[8px] overflow-hidden">
            <div className="h-full overflow-hidden w-[330px]">
              <SideBar
                bg={menuBackground}
                logo={logoImage}
                width={normalizedWidth}
                widget={menuWidget}
              />
            </div>
            <div
              className="w-[300px] h-full overflow-hidden"
              style={{ backgroundColor: background || "#EBEBEB" }}
            >
              <div className="scale-[0.8] origin-top-left w-[400px] h-full">
                <div className="h-full overflow-hidden">
                  <SplitedDashboard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
