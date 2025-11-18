import React, { use, useEffect, useRef, useState } from "react";
import { SecurityIcon } from "../../../../components/Icons";
import { HexColorPicker } from "react-colorful";
import {
  updateAgencySettings,
  getAgencySettings,
} from "../../../../services/agency";
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

const LoginPage = () => {
  const [background, setBackground] = useState("");
  const [box, setBox] = useState("");
  const [text, setText] = useState("");
  const [remainingTabsdata, setRemainingTabsdata] = useState({});

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showBoxPicker, setShowBoxPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);

  const backgroundPickerRef = useRef(null);
  const boxPickerRef = useRef(null);
  const textPickerRef = useRef(null);

  useClickOutside(backgroundPickerRef, () => setShowBackgroundPicker(false));
  useClickOutside(boxPickerRef, () => setShowBoxPicker(false));
  useClickOutside(textPickerRef, () => setShowTextPicker(false));

  const [logoWidth, setLogoWidth] = useState("180 px");
  const [logoImage, setLogoImage] = useState(null);
  const normalizedWidth = logoWidth.replace(/\s/g, "");
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(URL.createObjectURL(file)); // creates a preview link
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAgencySettings();
      const loginPageSettings = data?.agency.settings?.login_page || {};
      if (loginPageSettings) {
        const { background, box, text, logo } = loginPageSettings;
        setBackground(background || "");
        setBox(box || "");
        setText(text || "");
        if (logo) {
          setLogoImage(logo.image || null);
          setLogoWidth(logo.width ? `${logo.width} px` : "180 px");
        }
      }
      const Settings = data?.agency?.settings || {};
      if (Settings) {
        setRemainingTabsdata(loginSettings);
      }
    };
    fetchData();
  }, []);

  const isValidHex = value =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(value);

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      updates: {
        settings: {
          login_page: {
            background,
            box,
            text,
            logo: {
              width: normalizedWidth,
            },
          },
          dashboard: remainingTabsdata?.dashboard,
          advanced: remainingTabsdata?.advanced,
        },
      },
    };
    // Handle form submission
    try {
      const response = await updateAgencySettings(payload);
      console.log("Settings updated successfully:", response);
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings.");
    }
  };

  return (
    <div>
      <div className="flex justify-between gap-x-3 text-[#6D6D6D] w-full">
        <div className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-full rounded-[8px] shadow-md">
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
            {/* React Colorful Picker */}
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
            <p className="text-base font-normal mb-[2px]">Box</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={box}
                onFocus={() => setShowBoxPicker(true)}
                onChange={e => setBox(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(box) ? box : "transparent",
                }}
              ></div>
            </div>
            {/* React Colorful Picker */}
            {showBoxPicker && (
              <div
                ref={boxPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={box} onChange={setBox} />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Text</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#ffffff"
                value={text}
                onFocus={() => setShowTextPicker(true)}
                onChange={e => setText(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(text) ? text : "transparent",
                }}
              ></div>
            </div>
            {showTextPicker && (
              <div
                ref={textPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={text} onChange={setText} />
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
                className="flex-1 rounded-l-[6px] border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
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
                className="flex-1 border p-2 border-[#6D6D6D] rounded-[6px] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
              />
            </div>
          </label>
          <div className="flex items-center justify-end mt-[100px]">
            <button
              className="px-4 py-1 w-[130px] text-white bg-[#0387FF] border border-[#0387FF] cursor-pointer rounded-[4px]"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
        <div
          className=" flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins w-full px-[100px] rounded-[8px] shadow-md"
          style={{
            background: `${background ? background : "#EBEBEB"}`,
          }}
        >
          <div
            className="w-full border border-[#7E7E7E] h-full p-[60px] flex flex-col gap-y-8 items-center rounded-[8px] shadow-md"
            style={{
              background: `${box ? box : "#FFFFFF"}`,
            }}
          >
            <div className="flex flex-col gap-y-6 items-center">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ width: normalizedWidth, height: "auto" }}
                />
              ) : (
                <p>Logo will appear here</p>
              )}
              <p className="text-2xl sm:text-[32px] font-medium text-[#454545]">
                Log In
              </p>
            </div>

            <div className="flex flex-col gap-y-6 w-full font-normal text-base">
              <div className="flex flex-col w-full">
                <p>Email</p>
                <input
                  disabled
                  type="email"
                  className="border-[#6D6D6D] p-2 border rounded-[6px] h-10 bg-transparent text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
                />
              </div>
              <div className="relative w-full flex flex-col">
                <p>Password</p>
                <input
                  type="password"
                  placeholder="*************"
                  disabled
                  className="border-[#6D6D6D] p-2 border rounded-[6px] h-10 bg-transparent text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
                />
              </div>
              <div className="flex items-center gap-x-2.5">
                <input
                  type="checkbox"
                  className="appearance-none w-4 h-4"
                  style={{
                    border: `2px solid ${text ? text : "#038D65"}`,
                    borderRadius: "2px",
                  }}
                />
                <p>Remember me</p>
              </div>
              <div className="flex flex-col gap-y-4 w-full h-9">
                <button
                  type="button"
                  className="w-full cursor-pointer text-white py-2 font-medium text-sm rounded-[6px]"
                  style={{
                    background: `${text ? text : "#038D65"}`,
                  }}
                >
                  Log In
                </button>
              </div>
              <div className="mt-2 flex justify-start">
                <div className="text-sm underline gap-x-2.5 flex items-center">
                  <SecurityIcon
                    className={`w-6 h-6 ${
                      text ? `text-[${text}]` : "text-[#038D65]"
                    }`}
                  />
                  <p style={{ color: text ? text : "#038D65" }}>
                    Forgot your password?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
