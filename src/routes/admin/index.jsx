import React from "react";
import SideBar from "./components/Sidebar";
import { Outlet } from "react-router";

const Admin = () => {
  return (
    <div className="flex">
      <SideBar />
      <main className="flex-1  bg-[#EFEFEF] ">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
