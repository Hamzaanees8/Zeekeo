import React, { useEffect, useRef, useState } from "react";
import { SecurityIcon } from "../../../../components/Icons";
import SideBar from "./Sidebar";
import SplitedDashboard from "./SplitedDashboard";
import { set } from "date-fns";
import { HexColorPicker } from "react-colorful";
import {
  updateAgencySettings,
  getAgencySettings,
} from "../../../../services/agency";
import { useAgencySettingsStore } from "../../../stores/useAgencySettingsStore";
import toast from "react-hot-toast";
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
  const [textColor, setTextColor] = useState("");
  const [menuBackground, setMenuBackground] = useState("");
  const [menuColor, setMenuColor] = useState("");
  const [menuTextBackgroundHover, setMenuTextBackgroundHover] = useState("");
  const [menuTextHoverColor, setMenuTextHoverColor] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  // default app theme colors (Reset to Default should use these)
  const storeApi = useAgencySettingsStore();
  const defaultColorsRef = useRef(storeApi.getDefaultColors());

  // savedColorsRef stores the values that come from the server or the last successful save
  // use this to reflect saved settings if you need to track them separately from defaults
  const savedColorsRef = useRef({
    ...storeApi.getDefaultColors(),
  });

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showMenuBackgroundPicker, setShowMenuBackgroundPicker] =
    useState(false);
  const [showMenuColorPicker, setShowMenuColorPicker] = useState(false);
  const [showMenuTextBackgroundPicker, setShowMenuTextBackgroundPicker] =
    useState(false);
  const [showMenuTextHoverColorPicker, setShowMenuTextHoverColorPicker] =
    useState(false);

  const backgroundPickerRef = useRef(null);
  const textColorPickerRef = useRef(null);
  const menuPickerRef = useRef(null);
  const menuColorPickerRef = useRef(null);
  const menuTextBackgroundPickerRef = useRef(null);
  const menuTextHoverColorPickerRef = useRef(null);

  useClickOutside(backgroundPickerRef, () => setShowBackgroundPicker(false));
  useClickOutside(textColorPickerRef, () => setShowTextColorPicker(false));
  useClickOutside(menuPickerRef, () => setShowMenuBackgroundPicker(false));
  useClickOutside(menuColorPickerRef, () => setShowMenuColorPicker(false));
  useClickOutside(menuTextBackgroundPickerRef, () =>
    setShowMenuTextBackgroundPicker(false),
  );
  useClickOutside(menuTextHoverColorPickerRef, () =>
    setShowMenuTextHoverColorPicker(false),
  );

  const [logoWidth, setLogoWidth] = useState("180 px");
  const [logoImage, setLogoImage] = useState(null);
  const normalizedWidth = logoWidth.replace(/\s/g, "");
  const [remainingTabsdata, setRemainingTabsdata] = useState({});
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(URL.createObjectURL(file)); // creates a preview link
    }
  };
  const isValidHex = value =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(value);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAgencySettings();
        const dashboardSettings = data?.agency?.settings?.dashboard || {};
        if (dashboardSettings) {
          const {
            logo,
            menuBackground,
            menuColor,
            textColor,
            background,
            menuTextBackground,
            menuTextHoverColor,
          } = dashboardSettings;
          // prefer fetched values, fall back to the app defaults
          const defaultColors = storeApi.getDefaultColors();
          const bg = background || defaultColors.background;
          const menuBg = menuBackground || defaultColors.menuBackground;
          const menuCol = menuColor || defaultColors.menuColor;
          const txt = textColor || defaultColors.textColor;
          const menuTextBg =
            menuTextBackground ||
            menuBg ||
            defaultColors.menuTextBackgroundHover;
          const menuTxtHoverCol =
            menuTextHoverColor || defaultColors.menuTextHoverColor;
          setBackground(bg);
          setMenuBackground(menuBg);
          setMenuColor(menuCol);
          setMenuTextBackgroundHover(menuTextBg);
          setTextColor(txt);
          setMenuTextHoverColor(menuTxtHoverCol);
          // store fetched/saved values so we can reference saved colors separately
          savedColorsRef.current = {
            background: bg,
            menuBackground: menuBg,
            menuColor: menuCol,
            menuTextBackgroundHover: menuTextBg,
            textColor: txt,
            menuTextHoverColor: menuTxtHoverCol,
          };

          // also update the global agency settings store so other pages reflect changes immediately
          try {
            // use the store setter functions for a reactive update
            const storeApi = useAgencySettingsStore.getState();
            storeApi.setBackground(bg);
            storeApi.setMenuBackground(menuBg);
            storeApi.setMenuColor(menuCol);
            storeApi.setMenuTextBackgroundHover(menuTextBg);
            storeApi.setTextColor(txt);
            storeApi.setMenuTextHoverColor(menuTxtHoverCol);
            if (logo) {
              storeApi.setLogoImage(logo.image || null);
              const { width } = logo;
              storeApi.setLogoWidth(width ? `${width}` : "180px");
            }
            // keep remaining settings in the store as well
            useAgencySettingsStore.setState({
              remainingSettings: data?.agency?.settings || {},
            });
          } catch (e) {
            // non-fatal: if store doesn't exist or setters fail, just ignore
            // eslint-disable-next-line no-console
            console.warn("Could not update agency settings store:", e);
          }
          if (logo) {
            setLogoImage(logo.image || null);
            const { width } = logo;
            setLogoWidth(width ? `${width}` : "180 px");
          }
        }
        const Settings = data?.agency?.settings || {};
        if (Settings) {
          setRemainingTabsdata(Settings);
        }
      } catch (error) {
        console.error("Error fetching agency settings:", error);
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      updates: {
        settings: {
          dashboard: {
            background,
            menuBackground,
            menuColor,
            menuTextBackground: menuTextBackgroundHover,
            textColor,
            menuTextHoverColor,
            logo: {
              width: normalizedWidth,
            },
          },
          advanced: remainingTabsdata?.advanced,
          login_page: remainingTabsdata?.login_page,
        },
      },
    };
    try {
      const response = await updateAgencySettings(payload);
      console.log("Dashboard settings updated successfully:", response);
      // update the stored saved colors so we remember them separately from defaults
      savedColorsRef.current = {
        background,
        menuBackground,
        menuColor,
        menuTextBackgroundHover,
        textColor,
        menuTextHoverColor,
      };
      // update the global store so other pages will reflect the new values immediately
      try {
        const storeApi = useAgencySettingsStore.getState();
        storeApi.setBackground(background);
        storeApi.setMenuBackground(menuBackground);
        storeApi.setMenuColor(menuColor);
        storeApi.setMenuTextBackgroundHover(menuTextBackgroundHover);
        storeApi.setTextColor(textColor);
        storeApi.setMenuTextHoverColor(menuTextHoverColor);
        // update the saved initial colors in the global store
        useAgencySettingsStore.setState({
          initialColors: {
            background,
            menuBackground,
            menuColor,
            menuTextBackgroundHover,
            textColor,
            menuTextHoverColor,
          },
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to update global agency settings store:", e);
      }
      // ensure the visible fields match the saved values
      setBackground(
        savedColorsRef.current.background ||
          defaultColorsRef.current.background,
      );
      setMenuBackground(
        savedColorsRef.current.menuBackground ||
          defaultColorsRef.current.menuBackground,
      );
      setMenuColor(
        savedColorsRef.current.menuColor || defaultColorsRef.current.menuColor,
      );
      setMenuTextBackgroundHover(
        savedColorsRef.current.menuTextBackgroundHover ||
          defaultColorsRef.current.menuTextBackgroundHover,
      );
      setTextColor(
        savedColorsRef.current.textColor || defaultColorsRef.current.textColor,
      );
      setMenuTextHoverColor(
        savedColorsRef.current.menuTextHoverColor ||
          defaultColorsRef.current.menuTextHoverColor,
      );

      toast.success("Dashboard settings updated successfully!");
    } catch (error) {
      console.error("Error updating dashboard settings:", error);
      toast.error("Error updating dashboard settings.");
    }
  };
  // ✅ REPLACE THIS ENTIRE FUNCTION
  const handleResetToDefault = async () => {
    try {
      // Use the store's resetToDefault action
      const storeApi = useAgencySettingsStore.getState();
      storeApi.resetToDefault();

      // Get the current store state after reset
      const currentState = useAgencySettingsStore.getState();

      // Update local state to match store
      setBackground(currentState.background);
      setMenuBackground(currentState.menuBackground);
      setMenuColor(currentState.menuColor);
      setMenuTextBackgroundHover(currentState.menuTextBackgroundHover);
      setTextColor(currentState.textColor);
      setMenuTextHoverColor(currentState.menuTextHoverColor);

      // Update savedColorsRef
      savedColorsRef.current = {
        background: currentState.background,
        menuBackground: currentState.menuBackground,
        menuColor: currentState.menuColor,
        menuTextBackgroundHover: currentState.menuTextBackgroundHover,
        textColor: currentState.textColor,
        menuTextHoverColor: currentState.menuTextHoverColor,
      };

      // Use the store's saveSettings method to persist to API
      await storeApi.saveSettings();

      toast.success("Dashboard settings reset to default successfully!");
    } catch (error) {
      console.error("Error resetting dashboard settings:", error);
      toast.error("Error resetting dashboard settings.");
    }
  };

  // ✅ ADD THIS NEW FUNCTION
  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    setShowResetModal(false);
    await handleResetToDefault();
  };

  const cancelReset = () => {
    setShowResetModal(false);
  };
  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D]">
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-full rounded-[8px] shadow-md">
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Page Background</p>
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
                  backgroundColor: isValidHex(background)
                    ? background
                    : "transparent",
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
            <p className="text-base font-normal mb-[2px]">Page Text Color</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#6D6D6D"
                value={textColor}
                onFocus={() => setShowTextColorPicker(true)}
                onChange={e => setTextColor(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(textColor)
                    ? textColor
                    : "transparent",
                }}
              ></div>
            </div>
            {showTextColorPicker && (
              <div
                ref={textColorPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={textColor} onChange={setTextColor} />
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
            <p className="text-base font-normal mb-[2px]">Menu Text Color</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#6D6D6D"
                value={menuColor}
                onFocus={() => setShowMenuColorPicker(true)}
                onChange={e => setMenuColor(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(menuColor)
                    ? menuColor
                    : "transparent",
                }}
              ></div>
            </div>
            {showMenuColorPicker && (
              <div
                ref={menuColorPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={menuColor} onChange={setMenuColor} />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">
              Menu Hover Background
            </p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={menuTextBackgroundHover}
                onFocus={() => setShowMenuTextBackgroundPicker(true)}
                onChange={e => setMenuTextBackgroundHover(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(menuTextBackgroundHover)
                    ? menuTextBackgroundHover
                    : "transparent",
                }}
              ></div>
            </div>
            {showMenuTextBackgroundPicker && (
              <div
                ref={menuTextBackgroundPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker
                  color={menuTextBackgroundHover}
                  onChange={setMenuTextBackgroundHover}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">
              Menu Hover Text Color
            </p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#6D6D6D"
                value={menuTextHoverColor}
                onFocus={() => setShowMenuTextHoverColorPicker(true)}
                onChange={e => setMenuTextHoverColor(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(menuTextHoverColor)
                    ? menuTextHoverColor
                    : "transparent",
                }}
              ></div>
            </div>
            {showMenuTextHoverColorPicker && (
              <div
                ref={menuTextHoverColorPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker
                  color={menuTextHoverColor}
                  onChange={setMenuTextHoverColor}
                />
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
                  setTextColor("#1E1E1E");
                  setMenuBackground("#ECECEC");
                  setMenuColor("#1E1E1E");
                  setMenuTextBackgroundHover("#E0E0E0");
                  setMenuTextHoverColor("#000000");
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
                  setTextColor("#FFFFFF");
                  setMenuBackground("#2D2D2D");
                  setMenuColor("#FFFFFF");
                  setMenuTextBackgroundHover("#3D3D3D");
                  setMenuTextHoverColor("#E0E0E0");
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
          <div className="flex items-center justify-end mt-[20px]">
            <div className="flex items-center gap-x-3">
              <button
                className="px-4 py-1 w-[170px] text-[#6D6D6D] bg-white border border-[#7E7E7E] cursor-pointer rounded-[4px]"
                onClick={handleResetClick}
              >
                Reset to Default
              </button>
              <button
                className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer rounded-[4px]"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins w-full px-[70px] bg-[#EBEBEB] rounded-[8px] shadow-md">
          <div className="w-full h-[530px] border border-[#7E7E7E] flex rounded-[8px] overflow-hidden">
            <div className="h-full overflow-hidden min-w-[270px]">
              <SideBar
                bg={menuBackground}
                logo={logoImage}
                width={normalizedWidth}
                menuColor={menuColor}
                menuTextBackgroundHover={menuTextBackgroundHover}
                menuTextHoverColor={menuTextHoverColor}
              />
            </div>
            <div
              className="w-[300px] h-full overflow-hidden"
              style={{ backgroundColor: background || "#EBEBEB" }}
            >
              <div className="scale-[0.8] origin-top-left w-[400px] h-full">
                <div className="h-full overflow-hidden">
                  <SplitedDashboard
                    background={background}
                    textColor={textColor}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
        >
          <div className="bg-white w-[570px] px-7 pt-[15px] pb-[28px] rounded-[8px]">
            <div className="flex justify-between items-start mb-[21px]">
              <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
                Confirmation
              </h2>
              <button onClick={cancelReset} className="cursor-pointer">
                ✕
              </button>
            </div>
            <p className="text-[#7E7E7E] mb-[21px] font-[500] font-urbanist text-[16px]">
              Are you sure you want to reset to default colors?
            </p>
            <div className="flex justify-between gap-4 font-medium text-base font-urbanist">
              <button
                onClick={cancelReset}
                className="px-4 py-1 text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer rounded-[4px]"
              >
                Cancel
              </button>
              <div className="flex items-center gap-x-5">
                <button
                  onClick={confirmReset}
                  className="px-4 py-1 bg-white cursor-pointer border rounded-[4px]"
                  style={{
                    borderColor: "rgb(214, 40, 40)",
                    color: "rgb(214, 40, 40)",
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
