import { Outlet } from "react-router";
import "./index.css";
import SideBar from "../../../components/SideBar";
import { useAgencyPageStyles } from "../../stores/useAgencySettingsStore";

export default function Message() {
  const pageStyles = useAgencyPageStyles("#DEDEDE");

  return (
    <div className="flex" style={pageStyles}>
      <SideBar />
      <Outlet />
    </div>
  );
}
