import React, { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  updateAgencySettings,
  getAgencySettings,
  getAssetUploadUrl,
  uploadFileToSignedUrl,
  getAssetUrl,
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

// Default colors matching actual login page
const DEFAULT_COLORS = {
  background: "#000000",
  card: "#FFFFFF",
  text: "#454545",
  button_background: "#0387FF",
  button_text: "#FFFFFF",
};

const LoginPage = () => {
  const [background, setBackground] = useState(DEFAULT_COLORS.background);
  const [card, setCard] = useState(DEFAULT_COLORS.card);
  const [text, setText] = useState(DEFAULT_COLORS.text);
  const [buttonBackground, setButtonBackground] = useState(DEFAULT_COLORS.button_background);
  const [buttonText, setButtonText] = useState(DEFAULT_COLORS.button_text);
  const [remainingTabsdata, setRemainingTabsdata] = useState({});
  const [showResetModal, setShowResetModal] = useState(false);

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showCardPicker, setShowCardPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);
  const [showButtonBackgroundPicker, setShowButtonBackgroundPicker] = useState(false);
  const [showButtonTextPicker, setShowButtonTextPicker] = useState(false);

  const backgroundPickerRef = useRef(null);
  const cardPickerRef = useRef(null);
  const textPickerRef = useRef(null);
  const buttonBackgroundPickerRef = useRef(null);
  const buttonTextPickerRef = useRef(null);

  useClickOutside(backgroundPickerRef, () => setShowBackgroundPicker(false));
  useClickOutside(cardPickerRef, () => setShowCardPicker(false));
  useClickOutside(textPickerRef, () => setShowTextPicker(false));
  useClickOutside(buttonBackgroundPickerRef, () =>
    setShowButtonBackgroundPicker(false)
  );
  useClickOutside(buttonTextPickerRef, () => setShowButtonTextPicker(false));

  const [logoWidth, setLogoWidth] = useState(180);
  const [logoImage, setLogoImage] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [agencyUsername, setAgencyUsername] = useState("");
  const normalizedWidth = `${logoWidth}px`;

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(URL.createObjectURL(file));
      setLogoName(file.name);
      setLogoFile(file);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAgencySettings();
      const username = data?.agency?.username || "";
      setAgencyUsername(username);
      // Changed from login_page to login
      const loginSettings = data?.agency?.settings?.ui?.login || {};
      if (loginSettings) {
        const { background, card, text, logo, button_background, button_text } =
          loginSettings;
        setBackground(background || DEFAULT_COLORS.background);
        setCard(card || DEFAULT_COLORS.card);
        setText(text || DEFAULT_COLORS.text);
        setButtonBackground(button_background || DEFAULT_COLORS.button_background);
        setButtonText(button_text || DEFAULT_COLORS.button_text);
        if (logo?.enabled) {
          setLogoImage(getAssetUrl(username, "login_logo"));
          setLogoName("login_logo");
          setLogoWidth(logo.width ? parseInt(String(logo.width).replace(/[^0-9]/g, ""), 10) || 180 : 180);
        }
      }
      const Settings = data?.agency?.settings || {};
      if (Settings) {
        setRemainingTabsdata(Settings);
      }
    };
    fetchData();
  }, []);

  const isValidHex = value =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(value);

  const handleSubmit = async e => {
    e.preventDefault();

    let logoKey = logoName;

    // If there's a new file to upload, upload it first
    if (logoFile) {
      try {
        const { upload_url } = await getAssetUploadUrl(
          "login_logo",
          logoFile.type,
        );

        await uploadFileToSignedUrl(logoFile, upload_url);

        logoKey = true;
        const logoUrl = `${getAssetUrl(agencyUsername, "login_logo")}?t=${Date.now()}`;
        setLogoImage(logoUrl);
        setLogoName("login_logo");
        setLogoFile(null);
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast.error("Failed to upload logo");
        return;
      }
    }

    // Build login settings with snake_case keys
    const loginSettings = {
      background,
      card,
      text,
      button_background: buttonBackground,
      button_text: buttonText,
    };

    // Only include logo if there's a logo set
    if (logoKey) {
      loginSettings.logo = {
        width: normalizedWidth,
        enabled: true,
      };
    }

    const payload = {
      updates: {
        settings: {
          ...remainingTabsdata,
          ui: {
            ...remainingTabsdata?.ui,
            login: loginSettings, // Changed from login_page to login
          },
        },
      },
    };

    try {
      const response = await updateAgencySettings(payload);
      console.log("Settings updated successfully:", response);
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings.");
    }
  };

  const handleResetToDefault = async () => {
    try {
      // Reset local state to defaults
      setBackground(DEFAULT_COLORS.background);
      setCard(DEFAULT_COLORS.card);
      setText(DEFAULT_COLORS.text);
      setButtonBackground(DEFAULT_COLORS.button_background);
      setButtonText(DEFAULT_COLORS.button_text);

      // Build reset payload
      const loginSettings = {
        background: DEFAULT_COLORS.background,
        card: DEFAULT_COLORS.card,
        text: DEFAULT_COLORS.text,
        button_background: DEFAULT_COLORS.button_background,
        button_text: DEFAULT_COLORS.button_text,
      };

      // Keep logo if it exists
      if (logoName) {
        loginSettings.logo = {
          width: normalizedWidth,
          enabled: true,
        };
      }

      const payload = {
        updates: {
          settings: {
            ...remainingTabsdata,
            ui: {
              ...remainingTabsdata?.ui,
              login: loginSettings,
            },
          },
        },
      };

      await updateAgencySettings(payload);
      toast.success("Login page settings reset to default!");
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast.error("Error resetting settings.");
    }
  };

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
      <div className="flex justify-between gap-x-3 text-[#6D6D6D] w-full">
        <div className="flex flex-col gap-y-6 border border-[#7E7E7E] p-6 font-poppins bg-[#FFFFFF] w-full rounded-[8px] shadow-md">
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#000000"
                value={background}
                onFocus={() => setShowBackgroundPicker(true)}
                onChange={e => setBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(background) ? background : "transparent",
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
            <p className="text-base font-normal mb-[2px]">Card</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#FFFFFF"
                value={card}
                onFocus={() => setShowCardPicker(true)}
                onChange={e => setCard(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(card) ? card : "transparent",
                }}
              ></div>
            </div>
            {showCardPicker && (
              <div
                ref={cardPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={card} onChange={setCard} />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Text</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#454545"
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
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Button Background</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#0387FF"
                value={buttonBackground}
                onFocus={() => setShowButtonBackgroundPicker(true)}
                onChange={e => setButtonBackground(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(buttonBackground)
                    ? buttonBackground
                    : "transparent",
                }}
              ></div>
            </div>
            {showButtonBackgroundPicker && (
              <div
                ref={buttonBackgroundPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker
                  color={buttonBackground}
                  onChange={setButtonBackground}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col relative">
            <p className="text-base font-normal mb-[2px]">Button Text</p>
            <div className="flex items-center gap-x-[18px]">
              <input
                type="text"
                placeholder="#FFFFFF"
                value={buttonText}
                onFocus={() => setShowButtonTextPicker(true)}
                onChange={e => setButtonText(e.target.value)}
                className="border border-[#6D6D6D] p-2 text-[14px] font-normal focus:outline-none w-[170px] h-[40px] rounded-[6px]"
              />
              <div
                className="border border-[#6D6D6D] h-[40px] w-[40px] rounded-[6px]"
                style={{
                  backgroundColor: isValidHex(buttonText)
                    ? buttonText
                    : "transparent",
                }}
              ></div>
            </div>
            {showButtonTextPicker && (
              <div
                ref={buttonTextPickerRef}
                className="absolute top-[70px] left-0 z-50 shadow-lg"
              >
                <HexColorPicker color={buttonText} onChange={setButtonText} />
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
                id="login-logo-upload"
              />
              <input
                placeholder="Select your logo"
                value={logoName}
                readOnly
                className="flex-1 rounded-l-[6px] border p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal"
              />
              <label
                htmlFor="login-logo-upload"
                className="bg-[#6D6D6D] text-white px-4 cursor-pointer flex items-center justify-center rounded-r-[6px]"
              >
                Browse
              </label>
            </div>
          </label>
          <label>
            <span className="text-base font-normal">Logo Width</span>
            <div className="flex h-[40px] w-fit">
              <input
                type="number"
                min="1"
                value={logoWidth}
                onChange={e => setLogoWidth(parseInt(e.target.value, 10) || 1)}
                className="w-[80px] border border-r-0 p-2 border-[#6D6D6D] bg-white text-[#7E7E7E] focus:outline-none text-[14px] font-normal rounded-l-[6px]"
              />
              <span className="flex items-center px-3 border border-l-0 border-[#6D6D6D] bg-gray-100 text-[#7E7E7E] text-[14px] font-normal rounded-r-[6px]">
                px
              </span>
            </div>
          </label>
          <div className="flex items-center justify-end mt-[100px]">
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
        {/* Preview Section - matches actual login page */}
        <div
          className="flex flex-col border border-[#7E7E7E] p-6 font-poppins w-full rounded-[8px] shadow-md items-center justify-center"
          style={{
            background: background || DEFAULT_COLORS.background,
          }}
        >
          <style>
            {`
              .login-preview-input::placeholder {
                color: ${text || DEFAULT_COLORS.text};
                opacity: 0.7;
              }
            `}
          </style>
          <div
            className="w-full max-w-[320px] border border-[#7E7E7E] p-4 sm:p-6 flex flex-col gap-y-4 items-center rounded-md shadow-md"
            style={{
              background: card || DEFAULT_COLORS.card,
            }}
          >
            <div className="flex flex-col gap-y-3 items-center">
              {logoImage ? (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ width: `${Math.min(parseInt(normalizedWidth), 180)}px`, height: "auto" }}
                />
              ) : (
                <p className="text-xs" style={{ color: text || DEFAULT_COLORS.text }}>Logo will appear here</p>
              )}
              <p
                className="text-lg font-medium"
                style={{
                  color: text || DEFAULT_COLORS.text,
                }}
              >
                Log In
              </p>
            </div>

            <div className="flex flex-col gap-y-3 w-full font-normal text-sm">
              <div className="flex flex-col w-full">
                <input
                  disabled
                  type="text"
                  placeholder="Username or Email"
                  className="login-preview-input border-gray-300 p-2 border rounded-[4px] h-[32px] bg-transparent focus:outline-none text-[12px] font-normal"
                  style={{
                    color: text || DEFAULT_COLORS.text,
                  }}
                />
              </div>
              <div className="relative w-full flex flex-col">
                <input
                  type="password"
                  placeholder="Password"
                  disabled
                  className="login-preview-input border-gray-300 p-2 border rounded-[4px] h-[32px] bg-transparent focus:outline-none text-[12px] font-normal"
                  style={{
                    color: text || DEFAULT_COLORS.text,
                  }}
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className="text-[10px] hover:underline"
                    style={{ color: text || DEFAULT_COLORS.text }}
                  >
                    Forgot your password?
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-y-2 w-full">
                <button
                  type="button"
                  className="w-full cursor-pointer py-2 font-medium text-xs rounded-[4px]"
                  style={{
                    background: buttonBackground || DEFAULT_COLORS.button_background,
                    color: buttonText || DEFAULT_COLORS.button_text,
                  }}
                >
                  Log In
                </button>
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

export default LoginPage;
