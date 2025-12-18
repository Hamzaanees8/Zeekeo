import { Outlet } from "react-router";
import { Helmet } from "react-helmet";
import SideBar from "../../components/SideBar";
import { isWhitelabelDomain } from "../../utils/whitelabel-helper";
import { useAgencyPageStyles } from "../stores/useAgencySettingsStore";
import "./index.css";

export default function Dashboard() {
  const pageStyles = useAgencyPageStyles("#DEDEDE");

  return (
    <>
      <Helmet>
        <title>{isWhitelabelDomain() ? "Dashboard" : "Zeekeo Launchpad"}</title>
      </Helmet>
      <div className="flex" style={pageStyles}>
        <SideBar />
        <Outlet />
      </div>
    </>
  );
}
