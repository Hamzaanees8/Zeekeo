import { Outlet } from "react-router";
import SideBar from "../../components/SideBar";
import "./index.css";

export default function Dashboard() {
  return (
    <div className="flex bg-[#DEDEDE]">
      <SideBar />
      <Outlet /> {/* This renders DashboardContent or CompainContent */}
    </div>
  );
}
