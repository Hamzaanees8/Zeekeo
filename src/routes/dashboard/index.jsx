import { Outlet } from "react-router";
import { Helmet } from "react-helmet";
import SideBar from "../../components/SideBar";
import { isWhitelabelDomain } from "../../utils/whitelabel-helper";
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";
import "./index.css";
import { useIsEmbed } from "../../hooks/useIsEmbed";

export default function Dashboard() {
  const pageStyles = useAgencyPageStyles("#DEDEDE");
  const isEmbed = useIsEmbed(); // Check if we are in embed mode

  return (
    <>
      <Helmet>
        <title>{isWhitelabelDomain() ? "Dashboard" : "Zeekeo Launchpad"}</title>
      </Helmet>
      <div className={isEmbed ? "embed-container" : "flex"} style={pageStyles}>
        {!isEmbed && <SideBar />}
        <Outlet />
      </div>
    </>
  );
}
