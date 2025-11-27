import { create } from "zustand";
import {
  getAgencySettings,
  updateAgencySettings,
} from "../../services/agency";

const DEFAULT_COLORS = {
  background: "#EFEFEF",
  textColor: "#6D6D6D",
  menuBackground: "#FFFFFF",
  menuColor: "#6D6D6D",
  menuTextBackgroundHover: "#fbf9fa",
  menuTextHoverColor: "#6D6D6D",
};

export const useAgencySettingsStore = create((set, get) => ({
  background: DEFAULT_COLORS.background,
  menuBackground: DEFAULT_COLORS.menuBackground,
  menuColor: DEFAULT_COLORS.menuColor,
  menuTextBackgroundHover: DEFAULT_COLORS.menuTextBackgroundHover,
  menuTextHoverColor: DEFAULT_COLORS.menuTextHoverColor,
  textColor: DEFAULT_COLORS.textColor,
  logoImage: null,
  logoWidth: "180px",
  remainingSettings: {},
  initialColors: { ...DEFAULT_COLORS },

  getDefaultColors: () => DEFAULT_COLORS,

  setBackground: color => set({ background: color }),
  setMenuBackground: color => set({ menuBackground: color }),
  setMenuColor: color => set({ menuColor: color }),
  setMenuTextBackgroundHover: color => set({ menuTextBackgroundHover: color }),
  setMenuTextHoverColor: color => set({ menuTextHoverColor: color }),
  setTextColor: color => set({ textColor: color }),
  setLogoImage: img => set({ logoImage: img }),
  setLogoWidth: w => set({ logoWidth: w }),

  setColors: (background, menuBackground, textColor) =>
    set({ background, menuBackground, textColor }),

  // Save current store dashboard settings to API
  saveSettings: async () => {
    const state = get();
    const normalizedWidth = (state.logoWidth || "")
      .toString()
      .replace(/\s/g, "");
    const payload = {
      updates: {
        settings: {
          dashboard: {
            background: state.background,
            menuBackground: state.menuBackground,
            menuColor: state.menuColor, // Add this line
            menuTextBackground: state.menuTextBackgroundHover,
            textColor: state.textColor,
            menuTextHoverColor: state.menuTextHoverColor, // Change from menuTextColor to menuTextHoverColor
            logo: {
              width: normalizedWidth,
            },
          },
          advanced: state.remainingSettings?.advanced,
          login_page: state.remainingSettings?.login_page,
        },
      },
    };

    try {
      const response = await updateAgencySettings(payload);
      // update initial colors after successful save
      set({
        initialColors: {
          background: state.background,
          menuBackground: state.menuBackground,
          menuColor: state.menuColor,
          menuTextBackgroundHover: state.menuTextBackgroundHover,
          textColor: state.textColor,
          menuTextHoverColor: state.menuTextHoverColor,
        },
      });
      return response;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error saving agency settings:", error);
      throw error;
    }
  },

  resetToDefault: () =>
    set({
      background: DEFAULT_COLORS.background,
      menuBackground: DEFAULT_COLORS.menuBackground,
      menuColor: DEFAULT_COLORS.menuColor,
      menuTextBackgroundHover: DEFAULT_COLORS.menuTextBackgroundHover,
      menuTextHoverColor: DEFAULT_COLORS.menuTextHoverColor,
      textColor: DEFAULT_COLORS.textColor,
      initialColors: { ...DEFAULT_COLORS },
    }),

  // Async loader: fetches agency settings from API and updates the store
  loadSettings: async () => {
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
        const bg = background || DEFAULT_COLORS.background;
        const menuBg = menuBackground || DEFAULT_COLORS.menuBackground;
        const menuCol = menuColor || DEFAULT_COLORS.menuColor;
        const txt = textColor || DEFAULT_COLORS.textColor;
        const menuTextBg =
          menuTextBackground || DEFAULT_COLORS.menuTextBackgroundHover;
        const menuTxtHoverCol =
          menuTextHoverColor || DEFAULT_COLORS.menuTextHoverColor;
        set({
          background: bg,
          menuBackground: menuBg,
          menuColor: menuCol,
          menuTextBackgroundHover: menuTextBg,
          textColor: txt,
          menuTextHoverColor: menuTxtHoverCol,
          initialColors: {
            background: bg,
            menuBackground: menuBg,
            menuColor: menuCol,
            menuTextBackgroundHover: menuTextBg,
            textColor: txt,
            menuTextHoverColor: menuTxtHoverCol,
          },
        });

        if (logo) {
          set({ logoImage: logo.image || null });
          const { width } = logo;
          set({ logoWidth: width ? `${width}` : "180px" });
        }
      }

      const Settings = data?.agency?.settings || {};
      if (Settings) {
        set({ remainingSettings: Settings });
      }
    } catch (error) {
      // keep store stable on error but log for debugging
      // eslint-disable-next-line no-console
      console.error("Error fetching agency settings:", error);
    }
  },
}));
