import React, { useEffect } from "react";
import { useAgencySettingsStore } from "../stores/useAgencySettingsStore";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router";

const Agency = () => {
  const {
    background,
    menuBackground,
    menuColor,
    textColor,
    menuTextBackgroundHover,
    menuTextHoverColor,
    loadSettings,
    clearSettings,
  } = useAgencySettingsStore();

  useEffect(() => {
    // load settings once when agency routes mount so store reflects API values
    if (typeof loadSettings === "function") {
      // Clear any existing settings first to ensure clean state
      clearSettings();
      loadSettings();
    }

    // Clear settings when leaving agency section to prevent style bleeding
    return () => {
      clearSettings();
    };
  }, [loadSettings, clearSettings]);

  return (
    <div className="flex">
      <SideBar />
      <main
        className="flex-1"
        style={{ backgroundColor: background || "#EFEFEF" }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Agency;
