import { Outlet } from "react-router";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import SideBar from "../../components/SideBar";
import { api } from "../../services/api";
import { useAuthStore } from "../stores/useAuthStore";
import "./index.css";

export default function Dashboard() {
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users");
        setUser(response.user);
        console.log("[Dashboard] User data refreshed on page load");
      } catch (error) {
        console.error("[Dashboard] Failed to refresh user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Zeekeo Launchpad</title>
      </Helmet>
      <div className="flex bg-[#DEDEDE]">
        <SideBar />
        <Outlet /> {/* This renders DashboardContent or CompainContent */}
      </div>
    </>
  );
}
