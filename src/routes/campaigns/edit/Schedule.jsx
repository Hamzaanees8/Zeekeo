import { useEffect, useState } from "react";
import RangeSlider from "./Components/RangeSlider";
import InactiveSchedulerPopup from "./Components/InactiveSchedulerPopup";
import { useEditContext } from "./Context/EditContext";
import { updateCampaign } from "../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GetUser } from "../../../services/settings";

const defaultSchedule = {
  timezone: 0, // UTC (GMT)
  dst: false,
  days: {
    monday: { start: 9, end: 17, enabled: true },
    tuesday: { start: 9, end: 17, enabled: true },
    wednesday: { start: 9, end: 17, enabled: true },
    thursday: { start: 9, end: 17, enabled: true },
    friday: { start: 9, end: 17, enabled: true },
    saturday: { start: 9, end: 17, enabled: false },
    sunday: { start: 9, end: 17, enabled: false },
  },
};

const Schedule = () => {
  const navigate = useNavigate();
  const {
    schedule,
    setSchedule,
    editId,
    useGlobalSchedule,
    setUseGlobalSchedule,
  } = useEditContext();
  const [user, setUser] = useState(null);

  const tz_location_names = [
    { offset: -720, name: "(GMT -12:00) Eniwetok, Kwajalein" },
    { offset: -660, name: "(GMT -11:00) Midway Island, Samoa" },
    { offset: -600, name: "(GMT -10:00) Hawaii" },
    { offset: -540, name: "(GMT -9:00) Alaska" },
    { offset: -480, name: "(GMT -8:00) Pacific Time (US & Canada)" },
    { offset: -420, name: "(GMT -7:00) Mountain Time (US & Canada)" },
    {
      offset: -360,
      name: "(GMT -6:00) Central Time (US & Canada), Mexico City",
    },
    {
      offset: -300,
      name: "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima",
    },
    {
      offset: -240,
      name: "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz",
    },
    { offset: -210, name: "(GMT -3:30) Newfoundland" },
    { offset: -180, name: "(GMT -3:00) Brazil, Buenos Aires, Georgetown" },
    { offset: -120, name: "(GMT -2:00) Mid-Atlantic" },
    { offset: -60, name: "(GMT -1:00) Azores, Cape Verde Islands" },
    {
      offset: 0,
      name: "(GMT) Western Europe Time, London, Lisbon, Casablanca",
    },
    { offset: 60, name: "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris" },
    {
      offset: 120,
      name: "(GMT +2:00) Athena, Bucharest, Kaliningrad, South Africa",
    },
    {
      offset: 180,
      name: "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg",
    },
    { offset: 210, name: "(GMT +3:30) Tehran" },
    { offset: 240, name: "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi" },
    { offset: 270, name: "(GMT +4:30) Kabul" },
    {
      offset: 300,
      name: "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
    },
    { offset: 330, name: "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi" },
    { offset: 345, name: "(GMT +5:45) Kathmandu" },
    { offset: 360, name: "(GMT +6:00) Almaty, Dhaka, Colombo" },
    { offset: 420, name: "(GMT +7:00) Bangkok, Hanoi, Jakarta" },
    { offset: 480, name: "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong" },
    { offset: 540, name: "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk" },
    { offset: 570, name: "(GMT +9:30) Adelaide, Darwin" },
    { offset: 600, name: "(GMT +10:00) Eastern Australia, Guam, Vladivostok" },
    {
      offset: 660,
      name: "(GMT +11:00) Magadan, Solomon Islands, New Caledonia",
    },
    {
      offset: 720,
      name: "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka",
    },
  ];

  // Determine what to display: Global Schedule (from user settings) OR Campaign Custom Schedule
  const displaySchedule =
    useGlobalSchedule && user?.settings?.schedule
      ? user.settings.schedule
      : schedule;

  // Local derived state for controlled inputs (fallback to 0/false if undefined)
  const timezone = displaySchedule?.timezone ?? 0;
  const dst = displaySchedule?.dst ?? false;

  const [showInactivePopup, setShowInactivePopup] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await GetUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  // Initialize schedule if empty
  useEffect(() => {
    if (schedule && Object.keys(schedule).length === 0) {
      setSchedule({ ...defaultSchedule });
    }
  }, [schedule, setSchedule]);

  const toggle = () => {
    setUseGlobalSchedule((prev) => !prev);
  };

  const updateSchedule = (day, newTime) => {
    // Prevent editing if using global schedule
    if (useGlobalSchedule) return;

    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          ...newTime,
        },
      },
    }));
  };

  const toggleDay = (day) => {
    // Prevent toggling if using global schedule
    if (useGlobalSchedule) return;

    setSchedule((prev) => {
      const current = prev.days[day] || {};
      const enabled = !current.enabled;

      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            ...current,
            enabled,
            start: enabled ? current.start ?? 9 : current.start,
            end: enabled ? current.end ?? 17 : current.end,
          },
        },
      };
    });
  };

  const handleTimezoneChange = (newTimezone) => {
    if (useGlobalSchedule) return;
    setSchedule((prev) => ({ ...prev, timezone: newTimezone }));
  };

  const handleDstChange = () => {
    if (useGlobalSchedule) return;
    setSchedule((prev) => ({ ...prev, dst: !prev.dst }));
  };

  const handleSave = async () => {
    // Always save the 'schedule' state (the custom one), NOT the global one.
    // The backend/worker will decide which to use based on 'use_global_schedule'.
    const payload = {
      schedule: {
        ...schedule,
        use_global_schedule: useGlobalSchedule,
      },
    };
    try {
      await updateCampaign(editId, payload);
      toast.success("Schedule updated successfully");
    } catch (err) {
      console.log("error", err);
      if (err?.response?.status !== 401) {
        toast.error("Failed to update schedule:", err);
      }
    }
  };

  return (
    <div>
      <div className="text-sm text-[#2E2E2E] bg-white p-6 rounded-[10px] shadow-md border border-[#7E7E7E] mt-7">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setShowInactivePopup(true)}
            className="px-4 py-1.5 text-sm bg-white border border-[#0387FF] text-[#0387FF] rounded-[6px] hover:bg-[#F0F7FF] transition-colors font-medium cursor-pointer"
          >
            Set inactive days
          </button>
          <div className="flex gap-4 items-center">
            <button
              onClick={toggle}
              className={`w-[35.5px] h-4 flex items-center cursor-pointer rounded-full p-2 border-2 transition-all duration-300 ${useGlobalSchedule
                ? "bg-[#25C396] border-[#25C396]"
                : "bg-transparent border-[#7E7E7E]"
                }`}
            >
              <div
                className={`w-3 h-3 rounded-full shadow-md transition-all duration-300 ${useGlobalSchedule
                  ? "translate-x-[9px] bg-white"
                  : "translate-x-[-4px] bg-[#7E7E7E]"
                  }`}
              />
            </button>
            <div className="text-[#7E7E7E]">Global Scheduler</div>
          </div>
        </div>
        <div className="mb-4 flex gap-10 justify-center">
          <div className="flex flex-col w-1/2">
            <label className="block mb-1 text-xs text-[#7E7E7E]">
              Timezone
            </label>
            <select
              className="border border-[#7E7E7E] text-[#7E7E7E] p-2 w-full bg-white rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed"
              value={timezone}
              onChange={(e) => handleTimezoneChange(parseInt(e.target.value))}
              disabled={useGlobalSchedule}
            >
              {tz_location_names.map(({ offset, name }) => (
                <option key={offset} value={offset}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={dst}
              onChange={handleDstChange}
              disabled={useGlobalSchedule}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label className="text-[#7E7E7E]">
              Automatically adjust for daylight saving time
            </label>
          </div>
        </div>

        <div className="border border-[#7E7E7E] rounded-[8px]">
          {displaySchedule?.days &&
            [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ]
              .filter((day) => displaySchedule.days[day])
              .map((day, i) => {
                const item = displaySchedule.days[day];
                const isItemEnabled = item.enabled; // Helper for display

                return (
                  <div
                    key={day}
                    className="flex flex-col border-b border-[#7E7E7E] last:border-b-0 p-2"
                  >
                    <div className="flex justify-baseline gap-10 items-center">
                      <div className="w-[20%] font-semibold">
                        {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                        <span
                          className={`ml-1 underline ${isItemEnabled ? "text-[#0387FF]" : "text-[#A1A1A1]"
                            }`}
                        >
                          {item.start}:00 – {item.end}:00
                        </span>
                      </div>

                      <div className="w-full">
                        <RangeSlider
                          value={{
                            min: item.start ?? 9,
                            max: item.end ?? 17,
                            dayIndex: i,
                          }}
                          onChange={({ min, max }) =>
                            updateSchedule(day, { start: min, end: max })
                          }
                          disabled={!isItemEnabled || useGlobalSchedule}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleDay(day)}
                          disabled={useGlobalSchedule}
                          className={`w-[35.5px] h-4 flex items-center cursor-pointer rounded-full p-2 duration-300 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${isItemEnabled
                            ? "bg-[#25C396] border-[#25C396]"
                            : "bg-transparent border-[#7E7E7E]"
                            }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full shadow-md transform duration-300 ${isItemEnabled
                              ? "translate-x-[9px] bg-white"
                              : "translate-x-[-4px] bg-[#7E7E7E]"
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
        {showInactivePopup && (
          <InactiveSchedulerPopup
            onClose={() => setShowInactivePopup(false)}
            ranges={schedule?.inactive_days || []}
            onSave={(newRanges) => {
              setSchedule(prev => ({ ...prev, inactive_days: newRanges }));
            }}
          />
        )}
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => navigate("/campaigns")}
          className=" text-white border border-[#7E7E7E] bg-[#7E7E7E] cursor-pointer w-[110px] px-7 py-1 rounded-[6px]"
        >
          Cancel
        </button>
        <button
          className=" text-white bg-[#0387FF] cursor-pointer border border-[#0387FF] w-[110px] px-7 py-1 rounded-[6px]"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Schedule;
