import { create } from "zustand";
import {
  getAgencySettings,
  updateAgencySettings,
} from "../../services/agency";

export const useAgencySettingsStore = create((set, get) => ({
  background: "#EFEFEF",
  menuBackground: "#FFFFFF",
  menuColor: "#6D6D6D",
  menuTextBackgroundHover: "#FFFFFF",
  menuTextHoverColor: "#6D6D6D",
  textColor: "#6D6D6D",
  logoImage: null,
  logoWidth: "180px",
  remainingSettings: {},
  initialColors: {
    background: "#EFEFEF",
    menuBackground: "#FFFFFF",
    menuColor: "#6D6D6D",
    menuTextBackgroundHover: "#FFFFFF",
    menuTextHoverColor: "#6D6D6D",
    textColor: "#6D6D6D",
  },

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
            menuTextBackground: state.menuTextBackgroundHover,
            textColor: state.textColor,
            menuTextColor: state.menuTextColor,
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
          menuTextBackgroundHover: state.menuTextBackgroundHover,
          textColor: state.textColor,
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
      background: "#EFEFEF",
      menuBackground: "#FFFFFF",
      menuColor: "#6D6D6D",
      menuTextBackgroundHover: "#FFFFFF",
      menuTextHoverColor: "#6D6D6D",
      textColor: "#6D6D6D",
      initialColors: {
        background: "#EFEFEF",
        menuBackground: "#FFFFFF",
        menuColor: "#6D6D6D",
        menuTextBackgroundHover: "#FFFFFF",
        menuTextHoverColor: "#6D6D6D",
        textColor: "#6D6D6D",
      },
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
        const bg = background || "#FFFFFF";
        const menuBg = menuBackground || "#FFFFFF";
        const menuCol = menuColor || "#6D6D6D";
        const txt = textColor || "#FFFFFF";
        const menuTextBg = menuTextBackground || menuBg || "#FFFFFF";
        const menuTxtHoverCol = menuTextHoverColor || "#6D6D6D";
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
