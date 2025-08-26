import { Outlet } from "react-router";
import "./index.css";
import SideBar from "../../components/SideBar";

export default function Workflow() {
  return (
    <div className="flex bg-[#DEDEDE]">
      <SideBar />
      <Outlet />
    </div>
  );
}
