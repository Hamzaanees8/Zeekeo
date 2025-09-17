import { useEffect, useRef, useState } from "react";
import {
  Cancel,
  Cross,
  Delete,
  Dots,
  DropDownCheckIcon,
  Eye,
  Info,
  LinkedIn,
  PersonIcon,
  Play,
  ReplyIcon,
  SecurityIcon,
} from "../../../../components/Icons";
import { updateProfile } from "../../../../services/profiles";
import toast from "react-hot-toast";
import {
  deleteCampaignProfile,
  updateCampaignProfile,
} from "../../../../services/campaigns";
import { useEditContext } from "../Context/EditContext";
import ActionPopup from "../../templates/components/ActionPopup";
import EditableCell from "./EditableCell";

const Table = ({
  profiles,
  setProfiles,
  currentPage = 1,
  pageSize = 0,
  onSort,
  resetSort,
}) => {
  const [openEyeDropdownId, setOpenEyeDropdownId] = useState(null);
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

  console.log("profiles", profiles);

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

  return (
    <div className="w-full">
      <table className="w-full">
        <thead className="text-left font-poppins border-b border-[#7E7E7E]">
          <tr className="!text-[14px] text-[#7E7E7E]">
            <th className="py-[16px] !font-[400]">#</th>
            <th className="px-3 py-[16px] !font-[600]"></th>
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
              onClick={() => onSort("current_positions[0].role")}
              onDoubleClick={resetSort}
              className="px-3 py-[16px] !font-[600] cursor-pointer select-none"
            >
              Title{" "}
            </th>

            <th
              onClick={() => onSort("current_positions[0].company")}
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

            <th className="px-3 py-[16px] !font-[600]">Actions</th>
          </tr>
        </thead>
        <tbody className="border-b border-[#7E7E7E]">
          {profiles.map((item, index) => {
            const isSkipped = item?.skip;
            const isBlacklisted = item?.blacklisted;

            // background & title
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
                <td className="py-[18px] !font-[400] !text-[13px]">
                  {(currentPage - 1) * pageSize + (index + 1)}
                </td>
                <td className="!font-[400] !text-[13px] px-2.5">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="w-[16px] h-[16px] accent-[#0387FF]"
                    />
                  </div>
                </td>
                <td className="!font-[400] !text-[13px] px-2.5">
                  <div className="flex items-center justify-center gap-x-1">
                    <SecurityIcon className="w-4 h-4 text-[#038D65]" />
                    <ReplyIcon className="w-4 h-4" />
                  </div>
                </td>

                <td className="px-4 py-[18px] !font-[400] !text-[13px]">
                  {item.profile_picture_url ? (
                    <div className="w-[30px] h-[30px] rounded-full overflow-hidden">
                      <img
                        src={item.profile_picture_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-[30px] h-[30px] bg-[#D9D9D9] rounded-full"></div>
                  )}
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
                <td className="px-3 py-[18px] !font-[400] !text-[13px] max-w-[150px] break-words">
                  {item.email_address}
                </td>
                <EditableCell
                  value={item.current_positions?.[0]?.role}
                  profileId={item.profile_id}
                  field="current_positions"
                  subField="role"
                  otherValue={item.current_positions?.[0]}
                />
                <EditableCell
                  value={item.current_positions?.[0]?.company}
                  profileId={item.profile_id}
                  field="current_positions"
                  subField="company"
                  otherValue={item.current_positions?.[0]}
                />
                <td className="py-[18px] !font-[400] !text-[13px]">
                  <div className="flex flex-col items-center">
                    <p className="!font-[700] !text-[13px]">
                      {getRelationshipLabel(item.network_distance)}
                    </p>
                    <p className="!font-[700] !text-[13px] text-[#16A37B]">
                      {item.open_profile ? "OPEN" : ""}
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
                <td className="px-3 py-[18px] !font-[400] !text-[13px]">
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
                        <Eye className="rounded-[6px] border border-[#0077B6]" />
                      </div>
                      {openEyeDropdownId === item.profile_id && (
                        <div
                          ref={dropdownRef1}
                          className="absolute right-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                        >
                          <ul className="py-1 text-sm text-gray-700">
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <DropDownCheckIcon className="w-4" />
                              If Connected
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <DropDownCheckIcon className="w-4" />
                              View
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <DropDownCheckIcon className="w-4" />
                              Invite
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <Cross className="w-4.5 h-4.5 text-[#ef0505]" />
                              Like Post
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <Cross className="w-4.5 h-4.5 text-[#ef0505]" />
                              Send Message
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-x-2.5">
                              <DropDownCheckIcon className="w-4" />
                              Profile Connected
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="cursor-pointer">
                      <div className="rounded-[6px] border border-[#25C396]">
                        <Info />
                      </div>
                    </div>
                    <div className="cursor-pointer">
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
                      <div className="border border-[#00B4D8] rounded-[6px]">
                        <Dots />
                      </div>

                      {openDropdownId === item.profile_id && (
                        <div
                          ref={dropdownRef}
                          className="absolute top-13 right-0 w-[230px] bg-white shadow-md border border-[#7E7E7E] z-10 py-6 px-3 rounded-[8px]"
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
    </div>
  );
};

export default Table;
