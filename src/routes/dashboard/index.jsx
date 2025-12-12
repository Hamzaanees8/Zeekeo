import { Outlet } from "react-router";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import SideBar from "../../components/SideBar";
import { api } from "../../services/api";
import { useAuthStore } from "../stores/useAuthStore";
import "./index.css";

import {
  permissionsList,
  permissionKeyMap,
  defaultSelected,
} from "../../utils/permissions";

import { updateUser } from "../../services/users";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Zeekeo Launchpad</title>
      </Helmet>
      <div className="flex bg-[#DEDEDE]">
        <SideBar />
        <Outlet />
      </div>
    </>
  );
}
