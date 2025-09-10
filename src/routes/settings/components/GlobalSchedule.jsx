import React, { useState, useEffect } from "react";
import RangeSlider from "./RangeSlider";

const defaultSchedule = {
  timezone: 0,
  dst: true,
  days: {
    monday: { enabled: true, start: 9, end: 17 },
    tuesday: { enabled: true, start: 9, end: 17 },
    wednesday: { enabled: true, start: 9, end: 17 },
    thursday: { enabled: true, start: 9, end: 17 },
    friday: { enabled: true, start: 9, end: 17 },
    saturday: { enabled: false, start: 9, end: 17 },
    sunday: { enabled: false, start: 9, end: 17 },
  },
};

const GlobalSchedule = ({
  initialSchedule,
  onScheduleChange,
  handleSaveSettings,
  timezone,
  setTimezone,
  autoAdjust,
  setAutoAdjust,
}) => {
  const [schedule, setSchedule] = useState(
    initialSchedule?.days ? initialSchedule : defaultSchedule,
  );

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

  //  console.log("schedule", schedule);

  const updateSchedule = (day, newTime) => {
    const updated = {
      ...schedule,
      days: {
        ...schedule.days,
        [day]: { ...schedule.days[day], ...newTime },
      },
    };
    setSchedule(updated);
    onScheduleChange(updated);
  };

  const toggleDay = day => {
    const updated = {
      ...schedule,
      days: {
        ...schedule.days,
        [day]: { ...schedule.days[day], enabled: !schedule.days[day].enabled },
      },
    };
    setSchedule(updated);
    onScheduleChange(updated);
  };

  return (
    <div className="bg-[#EFEFEF] text-sm text-[#2E2E2E] w-[80%]">
      <div className="mb-4 flex gap-10">
        <label className="block mb-1 text-xs text-[#7E7E7E]">Timezone</label>
        <div>
          <select
            className="border border-[#7E7E7E] p-2 w-full bg-white rounded-[6px]"
            value={timezone}
            onChange={e => {
              const newTimezone = parseInt(e.target.value);
              setTimezone(newTimezone);
              const updated = { ...schedule, timezone: newTimezone };
              setSchedule(updated);
              onScheduleChange(updated);
            }}
          >
            {tz_location_names.map(({ offset, name }) => (
              <option key={offset} value={offset}>
                {name}
              </option>
            ))}
          </select>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoAdjust}
              onChange={() => {
                const newAutoAdjust = !autoAdjust;
                setAutoAdjust(newAutoAdjust);
                const updated = { ...schedule, dst: newAutoAdjust };
                setSchedule(updated);
                onScheduleChange(updated);
              }}
            />
            <label className="text-[#7E7E7E]">
              Automatically adjust for daylight saving time
            </label>
          </div>
        </div>
      </div>

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
          .map(day => {
            const item = schedule.days[day];
            return (
              <div key={day} className="flex flex-col">
                <div className="w-full font-semibold">
                  {day.charAt(0).toUpperCase() + day.slice(1)}:{" "}
                  <span
                    className={`ml-1 underline ${
                      item.enabled ? "text-[#0387FF]" : "text-[#A1A1A1]"
                    }`}
                  >
                    {item.start}:00 – {item.end}:00
                  </span>
                </div>
                <div className="flex justify-baseline gap-2 items-center">
                  <div className="w-full">
                    <RangeSlider
                      value={{ min: item.start, max: item.end, dayIndex: day }}
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

      <div className="mt-8 flex justify-between gap-4">
        <button className="bg-[#7E7E7E] text-white px-4 py-1 rounded-[4px]">
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          className="bg-[#0387FF] text-white px-6 py-1 cursor-pointer rounded-[4px]"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default GlobalSchedule;
