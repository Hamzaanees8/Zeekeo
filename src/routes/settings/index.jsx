import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SideBar from "../../components/SideBar";
import ProfileSettings from "./components/ProfileSettings";
import Integrations from "./components/Integrations";
import GlobalBlocklist from "./components/GlobalBlocklist";
import GlobalSchedule from "./components/GlobalSchedule";
import GlobalLimits from "./components/GlobalLimits";
import "./index.css";
import {
  GetBlackList,
  GetUser,
  updateBlackList,
  updateUsers,
} from "../../services/settings";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const Settings = () => {
  const tabs = [
    "Profile",
    "Integrations",
    "Global Blacklist",
    "Global Schedule",
    "Global Limits",
  ];
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Profile");
  const [selectedCard, setSelectedCard] = useState("Visa");
  const [currentUser, setCurrentUser] = useState(null);
  const [blocklist, setBlocklist] = useState([]);
  const [removedBlocklist, setRemovedBlocklist] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [timezone, setTimezone] = useState(0); // Default to UTC (GMT)
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [profileFormData, setProfileFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    auto_scale: enabled,
    time_zone: timezone,
    auto_adjust: autoAdjust,
    schedule: {
      timezone: 0,
      dst: true,
      days: {
        sunday: { enabled: false, start: 6, end: 12 },
        monday: { enabled: true, start: 9, end: 17 },
        tuesday: { enabled: true, start: 10, end: 18 },
        wednesday: { enabled: true, start: 9, end: 17 },
        thursday: { enabled: true, start: 8, end: 16 },
        friday: { enabled: true, start: 10, end: 15 },
        saturday: { enabled: false, start: 6, end: 9 },
      },
    },
    limits: [],
  });

  const setUser = useAuthStore(state => state.setUser);

  // Pick tab from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get("tab");

    if (tabFromUrl && tabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  console.log("profileFormData", profileFormData);
  console.log("enabled", enabled);
  console.log("autoAdjust", autoAdjust);

  const handleCardSelect = card => {
    setSelectedCard(card);
  };

  useEffect(() => {
    setProfileFormData(prev => ({
      ...prev,
      auto_scale: enabled,
    }));
  }, [enabled]);

  useEffect(() => {
    setProfileFormData(prev => ({
      ...prev,
      auto_adjust: autoAdjust,
    }));
  }, [autoAdjust]);

  useEffect(() => {
    setProfileFormData(prev => ({
      ...prev,
      time_zone: timezone,
    }));
  }, [timezone]);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await GetUser();
      setCurrentUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBlackList = async () => {
      const blackList = await GetBlackList();
      const blacklistArray = blackList?.blacklist
        .split("\n")
        .map(item => item.trim())
        .filter(item => item !== "");

      console.log("blacklistArray", blacklistArray);

      setBlocklist(blacklistArray);
    };

    fetchBlackList();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Transform schema limits to UI format
      const schemaLimits = currentUser?.settings?.limits;
      const uiLimits = schemaLimits
        ? [
            {
              label: "Profile Views",
              value: schemaLimits.linkedin_view || 100,
            },
            { label: "Invites", value: schemaLimits.linkedin_invite || 100 },
            { label: "InMails", value: schemaLimits.linkedin_inmail || 100 },
            {
              label: "Sequence Messages",
              value: schemaLimits.linkedin_message || 100,
            },
            { label: "Follows", value: schemaLimits.linkedin_follow || 100 },
            {
              label: "Post Likes",
              value: schemaLimits.linkedin_like_post || 100,
            },
            {
              label: "Endorsements",
              value: schemaLimits.linkedin_endorse || 100,
            },
            {
              label: "Email Sequence Messages",
              value: schemaLimits.email_message || 100,
            },
          ]
        : [];

      setProfileFormData(prev => ({
        ...prev,
        first_name: currentUser?.first_name || "",
        last_name: currentUser?.last_name || "",
        email: currentUser?.email || "",
        company: currentUser?.company || "",
        phone: currentUser?.phone || "",
        schedule: currentUser?.settings?.schedule || prev.schedule,
        limits: uiLimits,
      }));
      setAutoAdjust(currentUser?.settings?.schedule?.dst ?? true);
      setTimezone(currentUser?.settings?.schedule?.timezone ?? 0);
      setEnabled(currentUser?.settings?.limits?.auto_scale?.enabled ?? true);
    }
  }, [currentUser]);

  const handleProfileDataChange = (key, value) => {
    setProfileFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const { password, confirm_password, ...rest } = profileFormData;

      if (password || confirm_password) {
        if (!password || !confirm_password) {
          toast.error("Both new and confirm password fields must be filled.");
          return;
        }
        if (password !== confirm_password) {
          toast.error("New password and confirm password do not match.");
          return;
        }
      }

      const dataToSend = {
        ...rest,
        ...(password && confirm_password && password === confirm_password
          ? { password, confirm_password }
          : {}),
      };

      const updatedUserInfo = await updateUsers(dataToSend);
      setUser(updatedUserInfo);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    }
  };

  const handleSaveBlackList = async (
    updatedBlocklist = blocklist,
    updatedRemoved = removedBlocklist,
  ) => {
    try {
      const dataToSend = {
        added: updatedBlocklist,
        ...(updatedRemoved.length > 0 && { removed: updatedRemoved }),
      };

      await updateBlackList(dataToSend);
      toast.success("Blacklist saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings.");
    }
  };

  return (
    <div className="flex bg-[#EFEFEF] min-h-screen">
      <SideBar />
      <div className="w-full flex flex-col gap-y-8 py-[50px] px-[30px] font-urbanist">
        {/* Page Title */}
        <h1 className="font-medium text-[#6D6D6D] text-[48px]">Settings</h1>

        {/* 1st Row: Tabs */}
        <div className="flex gap-x-3 justify-center">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-[18px] border border-[#0387FF] cursor-pointer rounded-[4px] ${
                activeTab === tab
                  ? "bg-[#0387FF] text-white"
                  : "bg-white text-[#0387FF]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Profile" && (
          <ProfileSettings
            handleSaveSettings={handleSaveSettings}
            formData={profileFormData}
            onProfileChange={handleProfileDataChange}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        )}
        {activeTab === "Integrations" && (
          <Integrations
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        )}
        {activeTab === "Global Blacklist" && (
          <GlobalBlocklist
            blocklist={blocklist}
            setBlocklist={setBlocklist}
            removedBlocklist={removedBlocklist}
            setRemovedBlocklist={setRemovedBlocklist}
            handleSaveBlackList={handleSaveBlackList}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        )}
        {activeTab === "Global Schedule" && (
          <GlobalSchedule
            timezone={timezone}
            setTimezone={setTimezone}
            autoAdjust={autoAdjust}
            setAutoAdjust={setAutoAdjust}
            handleSaveSettings={handleSaveSettings}
            initialSchedule={profileFormData.schedule}
            onScheduleChange={newSchedule => {
              setProfileFormData(prev => ({
                ...prev,
                schedule: newSchedule,
              }));
              // Update timezone and autoAdjust from schedule
              setTimezone(newSchedule.timezone);
              setAutoAdjust(newSchedule.dst);
            }}
            formData={profileFormData}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        )}
        {activeTab === "Global Limits" && (
          <GlobalLimits
            apiLimits={profileFormData.limits}
            onLimitsChange={newLimits =>
              setProfileFormData(prev => ({
                ...prev,
                limits: newLimits,
              }))
            }
            handleSaveSettings={handleSaveSettings}
            enabled={enabled}
            setEnabled={setEnabled}
            selectedCard={selectedCard}
            onCardSelect={handleCardSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
