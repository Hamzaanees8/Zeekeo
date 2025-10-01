import { useEffect, useState } from "react";
import RangeSlider from "./Components/RangeSlider";
import InactiveSchedulerPopup from "./Components/InactiveSchedulerPopup";
import { useEditContext } from "./Context/EditContext";
import { updateCampaign } from "../../../services/campaigns";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  const { schedule, setSchedule, editId } = useEditContext();

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
  const [enabled, setEnabled] = useState(true);
  const timezone = schedule?.timezone || 0;
  const dst = schedule?.dst || false;
  const toggle = () => {
    setEnabled(prev => !prev);
  };
  const [localTimezone, setLocalTimezone] = useState(timezone);
  const [localDst, setLocalDst] = useState(dst);

  const [showInactivePopup, setShowInactivePopup] = useState(false);
  const updateSchedule = (day, newTime) => {
    setSchedule(prev => ({
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
  useEffect(() => {
    setSchedule(prev => ({
      ...defaultSchedule,
      ...prev,
    }));
  }, []);
  useEffect(() => {
    setSchedule(prev => ({
      ...prev,
      timezone: localTimezone,
      dst: localDst,
    }));
  }, [localTimezone, localDst, setSchedule]);
  const toggleDay = day => {
    setSchedule(prev => {
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
  const handleSave = async () => {
    const payload = {
      schedule: schedule,
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
      <div className="flex gap-4  items-center justify-center mb-5 ">
        <button
          onClick={toggle}
          className={`w-[35.5px] h-4 flex items-center cursor-pointer rounded-full p-2 border-2 transition-all duration-300 ${
            enabled
              ? "bg-[#25C396] border-[#25C396]"
              : "bg-transparent border-[#7E7E7E]"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full shadow-md transition-all duration-300 ${
              enabled
                ? "translate-x-[9px] bg-white"
                : "translate-x-[-4px] bg-[#7E7E7E]"
            }`}
          />
        </button>
        <div className="text-[#7E7E7E]">Global Scheduler</div>
      </div>
      <div className="mb-4 flex gap-10 justify-center">
        <div className="flex flex-col w-1/2">
          <label className="block mb-1 text-xs text-[#7E7E7E]">Timezone</label>
          <select
            className="border border-[#7E7E7E] text-[#7E7E7E] p-2 w-full bg-white rounded-[6px]"
            value={localTimezone}
            onChange={e => setLocalTimezone(parseInt(e.target.value))}
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
              checked={localDst}
              onChange={() => setLocalDst(prev => !prev)}
            />
            <label className="text-[#7E7E7E]">
              Automatically adjust for daylight saving time
            </label>
          </div>
        
      </div>
      {/* <div className="mt-4">
        <button
          onClick={() => setShowInactivePopup(true)}
          className="bg-white border border-[#7E7E7E] text-[#7E7E7E] px-4 py-1 mb-4"
        >
          Set Inactive Days
        </button>
      </div> */}
      <div className="border border-[#7E7E7E] rounded-[8px]">
        {schedule?.days &&
          [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ]
            .filter(day => schedule.days[day])
            .map((day, i) => {
              const item = schedule.days[day];
              return (
                <div key={day} className="flex flex-col border-b border-[#7E7E7E] last:border-b-0 p-2">
                  <div className="flex justify-baseline gap-10 items-center">
                  <div className="w-[20%] font-semibold">
                    {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                    <span
                      className={`ml-1 underline ${
                        item.enabled ? "text-[#0387FF]" : "text-[#A1A1A1]"
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
                      disabled={!item.enabled}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleDay(day)}
                      className={`w-[35.5px] h-4 flex items-center cursor-pointer rounded-full p-2 duration-300 border-2 ${
                        item.enabled
                          ? "bg-[#25C396] border-[#25C396]"
                          : "bg-transparent border-[#7E7E7E]"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full shadow-md transform duration-300 ${
                          item.enabled
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
        <InactiveSchedulerPopup onClose={() => setShowInactivePopup(false)} />
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
