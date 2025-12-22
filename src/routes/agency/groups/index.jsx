import { useState, useEffect } from "react";
import { useAgencySettingsStore } from "../../stores/useAgencySettingsStore";
import GroupsTable from "./components/GroupsTable";
import CreateGroupDialog from "./components/CreateGroupDialog";
import ManageMembersDialog from "./components/ManageMembersDialog";
import LogsDialog from "./components/LogsDialog";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import {
  getGroups,
  createGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  getAgencyUsers,
} from "../../../services/agency";

const Groups = () => {
  const { background, textColor } = useAgencySettingsStore();
  const [groups, setGroups] = useState([]);
  const [agencyUsers, setAgencyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showManageMembersDialog, setShowManageMembersDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [groupsResponse, usersResponse] = await Promise.all([
        getGroups(),
        getAgencyUsers({ all: "true" }),
      ]);
      setGroups(groupsResponse.groups || []);
      setAgencyUsers(usersResponse.users || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async name => {
    try {
      setActionLoading(true);
      const newGroup = await createGroup(name);
      setGroups([...groups, newGroup]);
      setShowCreateDialog(false);
    } catch (err) {
      console.error("Failed to create group:", err);
      alert("Failed to create group. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageMembers = group => {
    setSelectedGroup(group);
    setShowManageMembersDialog(true);
  };

  const handleViewLogs = group => {
    setSelectedGroup(group);
    setShowLogsDialog(true);
  };

  const handleDeleteClick = group => {
    setSelectedGroup(group);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setActionLoading(true);
      await deleteGroup(selectedGroup.group_id);
      setGroups(groups.filter(g => g.group_id !== selectedGroup.group_id));
      setShowDeleteConfirm(false);
      setSelectedGroup(null);
    } catch (err) {
      console.error("Failed to delete group:", err);
      alert("Failed to delete group. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async email => {
    try {
      setActionLoading(true);
      const updatedGroup = await addGroupMember(selectedGroup.group_id, email);
      setGroups(
        groups.map(g =>
          g.group_id === selectedGroup.group_id ? updatedGroup : g,
        ),
      );
      setSelectedGroup(updatedGroup);
    } catch (err) {
      console.error("Failed to add member:", err);
      const errorMessage =
        err.response?.data?.error === "user_already_member"
          ? "User is already a member of this group."
          : err.response?.data?.error === "user_not_in_agency"
            ? "User does not belong to this agency."
            : err.response?.data?.error === "user_not_found"
              ? "User not found."
              : "Failed to add member. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async email => {
    try {
      setActionLoading(true);
      const updatedGroup = await removeGroupMember(
        selectedGroup.group_id,
        email,
      );
      setGroups(
        groups.map(g =>
          g.group_id === selectedGroup.group_id ? updatedGroup : g,
        ),
      );
      setSelectedGroup(updatedGroup);
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const availableUsers = agencyUsers.filter(
    user =>
      user.enabled !== false && !selectedGroup?.members?.includes(user.email),
  );

  if (loading) {
    return (
      <div
        style={{ backgroundColor: background || "#EFEFEF" }}
        className="flex flex-col items-center justify-center min-h-[400px] px-[26px] pt-[45px]"
      >
        <div className="text-gray-500">Loading groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ backgroundColor: background || "#EFEFEF" }}
        className="flex flex-col items-center justify-center min-h-[400px] px-[26px] pt-[45px]"
      >
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="text-[13px] font-normal px-3 py-1 h-[40px] rounded-[6px] text-white bg-[#0387FF] cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: background || "#EFEFEF" }}
      className="flex flex-col gap-y-[18px] px-[26px] pt-[45px] pb-[200px]"
    >
      <div className="flex items-center justify-between">
        <h1
          style={{ color: textColor || "#6D6D6D" }}
          className="text-[44px] font-[300]"
        >
          Groups
        </h1>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="text-[13px] font-normal px-3 py-1 h-[40px] rounded-[6px] w-[140px] text-white bg-[#0387FF] cursor-pointer border border-[#0387FF]"
        >
          Create Group
        </button>
      </div>

      <GroupsTable
        data={groups}
        onManageMembers={handleManageMembers}
        onViewLogs={handleViewLogs}
        onDelete={handleDeleteClick}
      />

      {showCreateDialog && (
        <CreateGroupDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateGroup}
          loading={actionLoading}
        />
      )}

      {showManageMembersDialog && selectedGroup && (
        <ManageMembersDialog
          group={selectedGroup}
          availableUsers={availableUsers}
          onClose={() => {
            setShowManageMembersDialog(false);
            setSelectedGroup(null);
          }}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          loading={actionLoading}
        />
      )}

      {showLogsDialog && selectedGroup && (
        <LogsDialog
          group={selectedGroup}
          onClose={() => {
            setShowLogsDialog(false);
            setSelectedGroup(null);
          }}
        />
      )}

      {showDeleteConfirm && selectedGroup && (
        <DeleteConfirmDialog
          group={selectedGroup}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedGroup(null);
          }}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default Groups;
