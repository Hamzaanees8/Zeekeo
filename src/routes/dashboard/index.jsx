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
  const setUser = useAuthStore(state => state.setUser);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users");
        let user = response.user;

        if (user.agency_username && !user.agency_permissions) {
          let newPermissions = {};
          if (user.agency_admin) {
            newPermissions = Object.fromEntries(
              permissionsList.map(p => [permissionKeyMap[p], true]),
            );
          } else {
            newPermissions = Object.fromEntries(
              permissionsList.map(p => [
                permissionKeyMap[p],
                defaultSelected.includes(p),
              ]),
            );
          }

          try {
            const updatedUser = await updateUser({
              agency_permissions: newPermissions,
            });
            setUser(updatedUser);
          } catch (err) {
            console.error(
              "[Dashboard] Failed to sync permissions with backend, updating locally:",
              err,
            );
            setUser({ ...user, agency_permissions: newPermissions });
          }
        } else {
          setUser(user);
        }
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
