import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getAgencySettings,
  updateAgencySettings,
  getAssetUrl,
  getUserAgency,
} from "../../services/agency";
import { useAuthStore } from "./useAuthStore";

const DEFAULT_COLORS = {
  background: "#EFEFEF",
  textColor: "#6D6D6D",
  menuBackground: "#FFFFFF",
  menuColor: "#6D6D6D",
  menuTextBackgroundHover: "#fbf9fa",
  menuTextHoverColor: "#6D6D6D",
};

export const useAgencySettingsStore = create(
  persist(
    (set, get) => ({
      background: DEFAULT_COLORS.background,
      menuBackground: DEFAULT_COLORS.menuBackground,
      menuColor: DEFAULT_COLORS.menuColor,
      menuTextBackgroundHover: DEFAULT_COLORS.menuTextBackgroundHover,
      menuTextHoverColor: DEFAULT_COLORS.menuTextHoverColor,
      textColor: DEFAULT_COLORS.textColor,
      logoImage: null,
      logoWidth: "180px",
      favicon: false,
      agencyUsername: null,
      isLoaded: false,
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
      setFavicon: enabled => set({ favicon: enabled }),
      setAgencyUsername: username => set({ agencyUsername: username }),

      setColors: (background, menuBackground, textColor) =>
        set({ background, menuBackground, textColor }),

      // Save current store dashboard settings to API
      saveSettings: async () => {
    const state = get();
    const normalizedWidth = (state.logoWidth || "")
      .toString()
      .replace(/\s/g, "");

    // Build dashboard settings with snake_case keys
    const dashboardSettings = {
      page_background_color: state.background,
      page_text_color: state.textColor,
      menu_background_color: state.menuBackground,
      menu_text_color: state.menuColor,
      menu_hover_background_color: state.menuTextBackgroundHover,
      menu_hover_text_color: state.menuTextHoverColor,
    };

    // Only include logo if there's an image set
    if (state.logoImage) {
      dashboardSettings.logo = {
        width: normalizedWidth,
      };
    }

    const payload = {
      updates: {
        settings: {
          ui: {
            dashboard: dashboardSettings,
            login: state.remainingSettings?.ui?.login,
          },
          advanced: state.remainingSettings?.advanced,
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
      const dashboardSettings = data?.agency?.settings?.ui?.dashboard || {};
      if (dashboardSettings) {
        // Read from snake_case API fields
        const {
          logo,
          page_background_color,
          page_text_color,
          menu_background_color,
          menu_text_color,
          menu_hover_background_color,
          menu_hover_text_color,
        } = dashboardSettings;
        const bg = page_background_color || DEFAULT_COLORS.background;
        const menuBg = menu_background_color || DEFAULT_COLORS.menuBackground;
        const menuCol = menu_text_color || DEFAULT_COLORS.menuColor;
        const txt = page_text_color || DEFAULT_COLORS.textColor;
        const menuTextBg =
          menu_hover_background_color || DEFAULT_COLORS.menuTextBackgroundHover;
        const menuTxtHoverCol =
          menu_hover_text_color || DEFAULT_COLORS.menuTextHoverColor;

        // Check for favicon setting
        const faviconEnabled = data?.agency?.settings?.ui?.favicon || false;
        const username = data?.agency?.username;

        // Build update object with all settings at once
        const updates = {
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
          favicon: faviconEnabled,
          agencyUsername: username,
          remainingSettings: data?.agency?.settings || {},
          isLoaded: true,
        };

        if (logo?.enabled && username) {
          // Construct full URL using fixed filename
          updates.logoImage = getAssetUrl(username, "dashboard_logo");
          const { width } = logo;
          // Parse numeric value and store as "Npx" format for CSS
          const parsedWidth = width ? parseInt(String(width).replace(/[^0-9]/g, ""), 10) || 180 : 180;
          updates.logoWidth = `${parsedWidth}px`;
        }

        set(updates);
      } else {
        set({ isLoaded: true, remainingSettings: data?.agency?.settings || {} });
      }
    } catch (error) {
      // keep store stable on error but log for debugging
      // eslint-disable-next-line no-console
      console.error("Error fetching agency settings:", error);
      set({ isLoaded: true });
    }
  },

  // Load agency UI settings for users who belong to an agency
  loadSettingsForUser: async () => {
    try {
      const data = await getUserAgency();

      if (!data?.agency) {
        // User doesn't belong to an agency or agency not found
        set({ isLoaded: true });
        return;
      }

      const agency = data.agency;
      const agencyUsername = agency.username;
      const dashboardSettings = agency.settings?.ui?.dashboard || {};

      // Read from snake_case API fields
      const {
        logo,
        page_background_color,
        page_text_color,
        menu_background_color,
        menu_text_color,
        menu_hover_background_color,
        menu_hover_text_color,
      } = dashboardSettings;

      const bg = page_background_color || DEFAULT_COLORS.background;
      const menuBg = menu_background_color || DEFAULT_COLORS.menuBackground;
      const menuCol = menu_text_color || DEFAULT_COLORS.menuColor;
      const txt = page_text_color || DEFAULT_COLORS.textColor;
      const menuTextBg =
        menu_hover_background_color || DEFAULT_COLORS.menuTextBackgroundHover;
      const menuTxtHoverCol =
        menu_hover_text_color || DEFAULT_COLORS.menuTextHoverColor;

      // Check for favicon setting
      const faviconEnabled = agency.settings?.ui?.favicon || false;

      // Build update object with all settings at once
      const updates = {
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
        favicon: faviconEnabled,
        agencyUsername: agencyUsername,
        isLoaded: true,
      };

      if (logo?.enabled && agencyUsername) {
        updates.logoImage = getAssetUrl(agencyUsername, "dashboard_logo");
        const { width } = logo;
        const parsedWidth = width
          ? parseInt(String(width).replace(/[^0-9]/g, ""), 10) || 180
          : 180;
        updates.logoWidth = `${parsedWidth}px`;
      }

      set(updates);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching agency for user:", error);
      set({ isLoaded: true });
    }
  },
    }),
    {
      name: "agency-settings-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist theme-related properties, not functions or transient state
      partialize: state => ({
        background: state.background,
        menuBackground: state.menuBackground,
        menuColor: state.menuColor,
        menuTextBackgroundHover: state.menuTextBackgroundHover,
        menuTextHoverColor: state.menuTextHoverColor,
        textColor: state.textColor,
        logoImage: state.logoImage,
        logoWidth: state.logoWidth,
        favicon: state.favicon,
        agencyUsername: state.agencyUsername,
      }),
    },
  ),
);

// Custom hook to get page styles (background and text color) for agency branding
// Uses CSS custom properties so child components can reference them
export const useAgencyPageStyles = (defaultBgColor = "#EFEFEF", defaultTextColor = "#6D6D6D") => {
  const user = useAuthStore(state => state.currentUser);
  const { background, textColor, isLoaded } = useAgencySettingsStore();
  const hasAgencyBranding = user?.agency_username && isLoaded;
  const bgColor = hasAgencyBranding ? (background || defaultBgColor) : defaultBgColor;
  const txtColor = hasAgencyBranding ? (textColor || defaultTextColor) : defaultTextColor;
  return {
    backgroundColor: bgColor,
    color: txtColor,
    // CSS custom properties for child components to use
    "--page-text-color": txtColor,
    "--page-bg-color": bgColor,
  };
};

// Backwards compatible hook - returns just the background color
export const useAgencyPageBackground = (defaultColor = "#EFEFEF") => {
  const { backgroundColor } = useAgencyPageStyles(defaultColor);
  return backgroundColor;
};
