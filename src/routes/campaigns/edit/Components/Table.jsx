import { useEffect, useRef, useState, memo } from "react";
import {
  Cancel,
  Cross,
  Delete,
  Dots,
  DropDownCheckIcon,
  Eye,
  Info,
  Invite,
  LinkedIn,
  MailIcon,
  Message,
  PersonIcon,
  Play,
  ReplyIcon,
  SecurityIcon,
} from "../../../../components/Icons";
import {
  updateProfile,
  blacklistProfile,
  unblacklistProfile,
} from "../../../../services/profiles";
import toast from "react-hot-toast";
import {
  deleteCampaignProfile,
  updateCampaignProfile,
} from "../../../../services/campaigns";
import { useEditContext } from "../Context/EditContext";
import ActionPopup from "../../templates/components/ActionPopup";
import EditableCell from "./EditableCell";
import InfoModal from "./InfoModal";
import ProfilePicture from "./ProfilePicture";
const Table = ({
  profiles,
  setProfiles,
  currentPage = 1,
  pageSize = 0,
  onSort,
  resetSort,
  setSelectedProfiles,
  selectedProfiles,
  showCustomFields,
  showABGroup = false,
}) => {
  const [openEyeDropdownId, setOpenEyeDropdownId] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedActions, setSelectedActions] = useState(null);
  const { editId } = useEditContext();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const dropdownRef = useRef(null);
  const dropdownRef1 = useRef(null);
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
      if (
        dropdownRef1.current &&
        !dropdownRef1.current.contains(event.target)
      ) {
        setOpenEyeDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const getRelationshipLabel = num => {
    const suffixes = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th" };
    return suffixes[num] || "";
  };

  const hasActionType = (actions, type) => {
    if (!actions) return false;
    return Object.values(actions).some(a => a.type === type && a.success);
  };

  const getActionStatus = (actions, type) => {
    if (!actions) return "none";
    const action = Object.values(actions).find(a => a.type === type);
    if (!action) return "none";
    return action.success ? "success" : "failed";
  };

  const handleConfirmDeleteProfile = async () => {
    try {
      console.log("deleting profile...", deleteTarget);
      if (!deleteTarget?.data?.profile_id) return;
      const profileId = deleteTarget.data.profile_id;
      await deleteCampaignProfile(editId, profileId);
      setProfiles(prev => prev.filter(p => p.profile_id !== profileId));
      toast.success("Profile removed successfully!");
    } catch (err) {
      console.error("Failed to remove profile:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to remove profile");
      }
    } finally {
      setDeleteTarget(null);
      setOpenDropdownId(null);
    }
  };

  const handleUpdateProfile = async (profileId, updates, action) => {
    try {
      if (action === "skip" || action === "reinclude") {
        await updateCampaignProfile(editId, profileId, updates);
      } else if (action === "blacklist") {
        await blacklistProfile(profileId);
      } else if (action === "remove_blacklist") {
        await unblacklistProfile(profileId);
      } else {
        await updateProfile(profileId, updates);
      }

      switch (action) {
        case "skip":
          toast.success("Profile skipped successfully!");
          break;
        case "blacklist":
          toast.success("Profile blacklisted successfully!");
          break;
        case "reinclude":
          toast.success("Profile reincluded successfully!");
          break;
        case "remove_blacklist":
          toast.success("Profile removed from blacklist successfully!");
          break;
      }
      setProfiles(prev =>
        prev.map(p => (p.profile_id === profileId ? { ...p, ...updates } : p)),
      );
    } catch (err) {
      console.error("Failed to update profile:", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update profile");
      }
    } finally {
      setOpenDropdownId(null);
    }
  };
  const handleSelectAll = e => {
    if (e.target.checked) {
      setSelectedProfiles(profiles.map(p => p.profile_id));
    } else {
      setSelectedProfiles([]);
    }
  };
  const handleSelectRow = profileId => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId],
    );
  };

  const normalizeUrl = url => {
    if (!url) return url;
    let normalized = url.toLowerCase().trim();
    normalized = normalized.replace(/^https?:\/\//, "");
    normalized = normalized.replace(/^www\./, "");
    normalized = normalized.replace(/\/+$/, "");
    return normalized;
  };

  return (
    <>
      <table className="w-full">
        <thead className="text-left font-poppins border-b border-[#7E7E7E]">
          <tr className="!text-[14px] text-[#7E7E7E]">
            <th className="py-[16px] !font-[400]">#</th>
            <th className="px-3 py-[16px] !font-[600]">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-[16px] h-[16px] accent-[#0387FF]"
                  onChange={handleSelectAll}
                  checked={
                    profiles.length > 0 &&
                    selectedProfiles.length === profiles.length
                  }
                />
              </div>
            </th>
            <th className="px-3 py-[16px] !font-[600]"></th>
            <th className="px-3 py-[16px] !font-[600]">Profile</th>
            <th
              onClick={() => onSort("first_name")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              First Name{" "}
            </th>

            <th
              onClick={() => onSort("last_name")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Last Name{" "}
            </th>

            <th
              onClick={() => onSort("email_address")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Email{" "}
            </th>

            <th
              onClick={() => onSort("website")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Website{" "}
            </th>

            <th
              onClick={() => onSort("title")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Title{" "}
            </th>

            <th
              onClick={() => onSort("company")}
              onDoubleClick={resetSort}
              className="px-1 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Company{" "}
            </th>

            <th
              onClick={() => onSort("network_distance")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] text-center cursor-pointer select-none"
            >
              Relationship{" "}
            </th>

            <th
              onClick={() => onSort("shared_connections_count")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] text-center cursor-pointer select-none"
            >
              Mutuals{" "}
            </th>

            {showABGroup && (
              <th className="px-3 py-[16px] !font-[600] text-center">A/B</th>
            )}

            {showCustomFields && (
              <>
                <th className="px-3 py-[16px] !font-[600] text-center cursor-pointer select-none">
                  Custom Field 1
                </th>
                <th className="px-3 py-[16px] !font-[600] text-center cursor-pointer select-none">
                  Custom Field 2
                </th>
                <th className="px-3 py-[16px] !font-[600] text-center cursor-pointer select-none">
                  Custom Field 3
                </th>
              </>
            )}

            <th className="px-3 py-[16px] !font-[600]">Action Badges</th>

            <th className="px-3 py-[16px] !font-[600]">Actions</th>
          </tr>
        </thead>
        <tbody className="border-b border-[#7E7E7E]">
          {profiles.map((item, index) => {
            const isSkipped = item?.skip;
            const isBlacklisted = item?.blacklisted;
            const rowClass = isSkipped
              ? "bg-[#038D65] text-white skipped"
              : isBlacklisted
              ? "bg-[#6d6d6d] text-white blacklisted"
              : "text-[#6D6D6D]";

            const rowTitle = isSkipped
              ? "This profile is skipped"
              : isBlacklisted
              ? "This profile is blacklisted"
              : "";

            return (
              <tr
                key={item.profile_id}
                title={rowTitle}
                className={`${rowClass} !text-sm border-b border-[#7E7E7E]`}
              >
                <td className="py-[18px] !font-[400] !text-[13px] pl-1.5 !rounded-l-[8px]">
                  {(currentPage - 1) * pageSize + (index + 1)}
                </td>
                <td className="!font-[400] !text-[13px] px-2.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-[16px] h-[16px] accent-[#0387FF]"
                      onChange={() => handleSelectRow(item.profile_id)}
                      checked={selectedProfiles.includes(item.profile_id)}
                    />
                  </div>
                </td>
                <td className="!font-[400] !text-[13px] px-2.5">
                  <div className="flex items-center justify-center gap-x-1">
                    {/* <SecurityIcon className="w-4 h-4 text-[#038D65]" /> */}
                    {item.replied_at ? (
                      <ReplyIcon className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4"></div>
                    )}
                  </div>
                </td>

                <td className="px-4 py-[18px] !font-[400] !text-[13px]">
                  <ProfilePicture profile={item} />
                </td>
                <EditableCell
                  value={item.first_name}
                  profileId={item.profile_id}
                  field="first_name"
                  isNameField={true}
                  otherValue={item.last_name}
                />
                <EditableCell
                  value={item.last_name}
                  profileId={item.profile_id}
                  field="last_name"
                  isNameField={true}
                  otherValue={item.first_name}
                />
                <EditableCell
                  value={item.email_address}
                  profileId={item.profile_id}
                  field="email_address"
                  cellClassName="max-w-[150px] break-words"
                />
                <td className="px-3 py-[18px] !font-[400] !text-[13px] max-w-[150px] break-words">
                  {item.websites
                    ?.map(website => normalizeUrl(website))
                    .join(", ")}
                </td>
                <EditableCell
                  value={
                    item.work_experience?.[0]?.position ??
                    item.current_positions?.[0]?.role ??
                    item.headline ??
                    ""
                  }
                  profileId={item.profile_id}
                  field={
                    item.work_experience?.length
                      ? "work_experience"
                      : item.headline
                      ? "headline"
                      : item.current_positions?.length
                      ? "current_positions"
                      : ""
                  }
                  subField={
                    item.work_experience?.length
                      ? "position"
                      : item.current_positions?.length
                      ? "role"
                      : ""
                  }
                  otherValue={
                    item.work_experience?.[0] ??
                    item.current_positions?.[0] ??
                    {}
                  }
                />
                <EditableCell
                  value={
                    item.work_experience?.[0]?.company ??
                    item.current_positions?.[0]?.company ??
                    ""
                  }
                  profileId={item.profile_id}
                  field={
                    item.work_experience?.length
                      ? "work_experience"
                      : item.current_positions?.length
                      ? "current_positions"
                      : ""
                  }
                  subField={
                    item.work_experience?.length
                      ? "company"
                      : item.current_positions?.length
                      ? "company"
                      : ""
                  }
                  otherValue={
                    item.work_experience?.[0] ??
                    item.current_positions?.[0] ??
                    {}
                  }
                />
                <td className="py-[18px] !font-[400] !text-[13px]">
                  <div className="flex flex-col items-center">
                    <p className="!font-[700] !text-[13px]">
                      {getRelationshipLabel(item.network_distance)}
                    </p>
                    <p className="!font-[700] !text-[13px] text-[#16A37B]">
                      {item.is_open ? "OPEN" : ""}
                    </p>
                  </div>
                </td>
                <td className="py-[18px] !font-[400] !text-[13px]">
                  <div className="flex items-center justify-center gap-x-1">
                    <p className="!font-[700] !text-[13px]">
                      {item.shared_connections_count
                        ? item.shared_connections_count
                        : 0}
                    </p>
                    <PersonIcon />
                  </div>
                </td>
                {showABGroup && (
                  <td className="py-[18px] !font-[400] !text-[13px]">
                    <div className="flex items-center justify-center">
                      {item.ab_group && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            item.ab_group === "a"
                              ? "bg-[#16A34A] text-white"
                              : "bg-[#EF4444] text-white"
                          }`}
                        >
                          {item.ab_group.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                )}
                {showCustomFields && (
                  <>
                    <EditableCell
                      value={item.custom_fields?.["0"] || ""}
                      profileId={item.profile_id}
                      field="custom_fields"
                      subField="0"
                      otherValue={item.custom_fields}
                      onUpdate={(profileId, updates) => {
                        // Update local state when cell is edited
                        setProfiles(prev =>
                          prev.map(p => {
                            if (p.profile_id === profileId) {
                              if (updates.custom_fields) {
                                return {
                                  ...p,
                                  custom_fields: {
                                    ...p.custom_fields,
                                    ...updates.custom_fields,
                                  },
                                };
                              }
                              return { ...p, ...updates };
                            }
                            return p;
                          }),
                        );
                      }}
                    />

                    <EditableCell
                      value={item.custom_fields?.["1"] || ""}
                      profileId={item.profile_id}
                      field="custom_fields"
                      subField="1"
                      otherValue={item.custom_fields}
                      onUpdate={(profileId, updates) => {
                        // Update local state when cell is edited
                        setProfiles(prev =>
                          prev.map(p => {
                            if (p.profile_id === profileId) {
                              if (updates.custom_fields) {
                                return {
                                  ...p,
                                  custom_fields: {
                                    ...p.custom_fields,
                                    ...updates.custom_fields,
                                  },
                                };
                              }
                              return { ...p, ...updates };
                            }
                            return p;
                          }),
                        );
                      }}
                    />

                    <EditableCell
                      value={item.custom_fields?.["2"] || ""}
                      profileId={item.profile_id}
                      field="custom_fields"
                      subField="2"
                      otherValue={item.custom_fields}
                      onUpdate={(profileId, updates) => {
                        // Update local state when cell is edited
                        setProfiles(prev =>
                          prev.map(p => {
                            if (p.profile_id === profileId) {
                              if (updates.custom_fields) {
                                return {
                                  ...p,
                                  custom_fields: {
                                    ...p.custom_fields,
                                    ...updates.custom_fields,
                                  },
                                };
                              }
                              return { ...p, ...updates };
                            }
                            return p;
                          }),
                        );
                      }}
                    />
                  </>
                )}
                <td className="px-3 py-[18px] !font-[400] !text-[13px]">
                  <div className="flex items-center justify-center gap-x-2">
                    {/* View Badge */}
                    <div className="relative group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                          getActionStatus(item.actions, "linkedin_view") ===
                          "success"
                            ? "bg-green-500"
                            : getActionStatus(
                                item.actions,
                                "linkedin_view",
                              ) === "failed"
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Eye
                          className={`w-5 h-5 ${
                            getActionStatus(item.actions, "linkedin_view") ===
                            "success"
                              ? "[&_path]:fill-white"
                              : getActionStatus(
                                  item.actions,
                                  "linkedin_view",
                                ) === "failed"
                              ? "[&_path]:fill-white"
                              : "[&_path]:fill-gray-500"
                          }`}
                        />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        View
                      </span>
                    </div>

                    {/* Invite Badge */}
                    <div className="relative group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                          getActionStatus(item.actions, "linkedin_invite") ===
                          "success"
                            ? "bg-green-500"
                            : getActionStatus(
                                item.actions,
                                "linkedin_invite",
                              ) === "failed"
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Invite
                          className={`w-4 h-4 ${
                            getActionStatus(
                              item.actions,
                              "linkedin_invite",
                            ) === "success"
                              ? "[&_path]:stroke-white [&_circle]:fill-green-500 [&_circle]:stroke-white"
                              : getActionStatus(
                                  item.actions,
                                  "linkedin_invite",
                                ) === "failed"
                              ? "[&_path]:stroke-white [&_circle]:fill-red-500 [&_circle]:stroke-white"
                              : "[&_path]:stroke-gray-500 [&_circle]:fill-gray-300"
                          }`}
                        />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Invite
                      </span>
                    </div>

                    {/* InMail Badge */}
                    <div className="relative group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                          getActionStatus(item.actions, "linkedin_inmail") ===
                          "success"
                            ? "bg-green-500"
                            : getActionStatus(
                                item.actions,
                                "linkedin_inmail",
                              ) === "failed"
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <MailIcon
                          className={`w-4 h-4 ${
                            getActionStatus(
                              item.actions,
                              "linkedin_inmail",
                            ) === "success"
                              ? "[&_path]:fill-white"
                              : getActionStatus(
                                  item.actions,
                                  "linkedin_inmail",
                                ) === "failed"
                              ? "[&_path]:fill-white"
                              : "[&_path]:fill-gray-500"
                          }`}
                        />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        InMail
                      </span>
                    </div>

                    {/* Message Badge */}
                    <div className="relative group">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${
                          getActionStatus(item.actions, "linkedin_message") ===
                          "success"
                            ? "bg-green-500"
                            : getActionStatus(
                                item.actions,
                                "linkedin_message",
                              ) === "failed"
                            ? "bg-red-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <Message
                          className={`w-4 h-4 ${
                            getActionStatus(
                              item.actions,
                              "linkedin_message",
                            ) === "success"
                              ? "[&_path]:fill-white"
                              : getActionStatus(
                                  item.actions,
                                  "linkedin_message",
                                ) === "failed"
                              ? "[&_path]:fill-white"
                              : "[&_path]:fill-gray-500"
                          }`}
                        />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Message
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-[18px] !font-[400] !text-[13px] !rounded-r-[8px]">
                  <div className="flex items-center gap-x-3">
                    <div className="relative inline-block">
                      <div
                        className="cursor-pointer"
                        onClick={() =>
                          setOpenEyeDropdownId(
                            openEyeDropdownId === item.profile_id
                              ? null
                              : item.profile_id,
                          )
                        }
                      >
                        <Eye className="rounded-full border border-[#0077B6]" />
                      </div>
                      {openEyeDropdownId === item.profile_id && (
                        <div
                          ref={dropdownRef1}
                          className={`absolute right-0 w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50
                                  ${
                                    index > profiles.length - 3
                                      ? "bottom-full mb-2"
                                      : "mt-2"
                                  }`}
                        >
                          <ul className="py-1 text-sm text-gray-700">
                            {item.actions &&
                            Object.values(item.actions).length > 0 ? (
                              Object.values(item.actions).map(
                                (action, idx) => (
                                  <li
                                    key={idx}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5"
                                  >
                                    {action.success ? (
                                      <DropDownCheckIcon className="w-4 text-green-600" />
                                    ) : (
                                      <Cross className="w-4.5 h-4.5 text-[#ef0505]" />
                                    )}
                                    {(() => {
                                      switch (action.type) {
                                        case "linkedin_view":
                                          return "Viewed";
                                        case "linkedin_invite":
                                          return "Invite Sent";
                                        case "linkedin_message":
                                          return "Message Sent";
                                        case "linkedin_inmail":
                                          return "InMail Sent";
                                        case "linkedin_endorse":
                                          return "Endorsement Sent";
                                        case "linkedin_follow":
                                          return "Follow Sent";
                                        case "linkedin_like_post":
                                          return "Liked Post";
                                        case "linkedin_invite_accepted":
                                          return "Profile Connected";
                                        default:
                                          return action.type;
                                      }
                                    })()}
                                  </li>
                                ),
                              )
                            ) : (
                              <li className="px-4 py-2 text-black">
                                No data available
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => {
                        setShow(true);
                        setSelectedActions(item.actions);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="rounded-full border border-[#25C396]">
                        <Info />
                      </div>
                    </div>
                    <div className="cursor-pointer rounded-full">
                      <a
                        href={
                          item?.classic_profile_url || item?.sales_profile_url
                        }
                        target="_new"
                      >
                        <LinkedIn className="w-[34px] h-[34px] fill-[#007EBB]" />
                      </a>
                    </div>
                    <div
                      onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === item.profile_id
                            ? null
                            : item.profile_id,
                        )
                      }
                      className="cursor-pointer relative"
                    >
                      <div className="border border-[#00B4D8] rounded-full">
                        <Dots />
                      </div>

                      {openDropdownId === item.profile_id && (
                        <div
                          ref={dropdownRef}
                          className={`absolute right-0 w-[230px] bg-white shadow-md border border-[#7E7E7E] z-50 py-6 px-3 rounded-[8px]
                            ${
                              index >= profiles.length - 3
                                ? "bottom-full mb-2"
                                : "top-full mt-2"
                            }`}
                        >
                          <div
                            className="flex items-center px-1 h-6 gap-x-3.5 mb-3 hover:bg-gray-100"
                            onClick={() => {
                              setDeleteTarget({
                                type: "profile",
                                data: item,
                              });
                            }}
                          >
                            <Delete />
                            <p className="font-normal text-[15px] text-[#7E7E7E] text-center">
                              Remove Profile
                            </p>
                          </div>
                          {!isSkipped ? (
                            <div
                              className="flex items-center px-1 h-6 gap-x-3.5 mb-3 hover:bg-gray-100"
                              onClick={() =>
                                handleUpdateProfile(
                                  item.profile_id,
                                  { skip: true },
                                  "skip",
                                )
                              }
                            >
                              <Play />
                              <p className="font-normal text-[15px] text-[#7E7E7E] text-center">
                                Skip Profile
                              </p>
                            </div>
                          ) : (
                            <div
                              className="flex items-center px-1 h-6 gap-x-3.5 mb-3 hover:bg-gray-100"
                              onClick={() =>
                                handleUpdateProfile(
                                  item.profile_id,
                                  { skip: false },
                                  "reinclude",
                                )
                              }
                            >
                              <Play />
                              <p className="font-normal text-[15px] text-[#7E7E7E] text-center">
                                Reinclude Profile
                              </p>
                            </div>
                          )}
                          {!isBlacklisted ? (
                            <div
                              className="flex items-center px-1 h-6 gap-x-3.5 hover:bg-gray-100"
                              onClick={() =>
                                handleUpdateProfile(
                                  item.profile_id,
                                  { blacklisted: true },
                                  "blacklist",
                                )
                              }
                            >
                              <Cancel />
                              <p className="font-normal text-[15px] text-[#7E7E7E] text-center">
                                Blacklist Profile
                              </p>
                            </div>
                          ) : (
                            <div
                              className="flex items-center px-1 h-6 gap-x-3.5 hover:bg-gray-100"
                              onClick={() =>
                                handleUpdateProfile(
                                  item.profile_id,
                                  { blacklisted: false },
                                  "remove_blacklist",
                                )
                              }
                            >
                              <Cancel />
                              <p className="font-normal text-[15px] text-[#7E7E7E] text-center">
                                Remove from Blacklist
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {deleteTarget?.type === "profile" && (
        <ActionPopup
          title="Remove Profile"
          confirmMessage="Are you sure you would like to remove this profile? It cannot be undone"
          onClose={() => setDeleteTarget(null)}
          onSave={handleConfirmDeleteProfile}
          isDelete={true}
        />
      )}
      {show && (
        <InfoModal onClose={() => setShow(false)} actions={selectedActions} />
      )}
    </>
  );
};

export default memo(Table);
