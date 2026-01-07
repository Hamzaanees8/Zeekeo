import { Outlet } from "react-router";
import "./index.css";
import SideBar from "../../components/SideBar";
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";
import { useIsEmbed } from "../../hooks/useIsEmbed";

export default function Compaigns() {
  const pageStyles = useAgencyPageStyles("#DEDEDE");
  const isEmbed = useIsEmbed(); // Check if we are in embed mode
  return (
    <div className={isEmbed ? "embed-container" : "flex"} style={pageStyles}>
      {!isEmbed && <SideBar />}
      <div className="flex-1 min-w-0"><Outlet /></div>
    </div>
  );
}
