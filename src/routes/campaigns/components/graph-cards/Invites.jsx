import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

const Invites = ({ value = "0,0,0,0,0,0,0", max = 100 }) => {
  const values = value.split(",").map(Number);
  const todayIndex = new Date().getDay();
  const todayValue = values[todayIndex] || 0;

  const shortDays = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Frid", "Sat"];
  const fullDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Calculate start of the week (Sunday)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - todayIndex); // Move to Sunday

  // Create data with actual dates
  const data = shortDays.map((day, i) => {
    const dateObj = new Date(startOfWeek);
    dateObj.setDate(startOfWeek.getDate() + i);
    return {
      index: i,
      day,
      messages: values[i] || 0,
      fullDay: fullDays[i],
      date: dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  });

  const getBarFill = index => {
    if (index === todayIndex) return "#28F0E6";
    if (index === 5) return `url(#friday-stripes)`;
    if (index === 6) return "#DBDBDB";
    return "#04479C";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { messages, fullDay, date, index } = payload[0].payload;
      const color = index === todayIndex ? "#28F0E6" : "#04479C";
      return (
        <div className="bg-white px-4 rounded-[6px] py-3 shadow min-w-[130px]">
          <div className="text-[#333] text-[10px] font-medium">Invites</div>
          <div className="flex justify-between items-center text-[10px] mt-1">
            <div
              className="text-[18px] font-semibold"
              style={{ color: color }}
            >
              {messages}
            </div>
            <div className="text-right">
              <div className="text-[#636D79] text-[10px]">{fullDay}</div>
              <div className="text-[#636D79] text-[10px]">{date}</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] shadow-sm p-4 w-full relative h-full">
      <div className="text-[16px] text-[#1E1D1D] font-normal mb-2">
        Invites
      </div>

      <div className="flex justify-between">
        <div className="text-center mb-3 self-end w-[20%]">
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
            Today
          </div>
          <div className="text-[36px] font-urbanist font-medium text-[#1E1D1D] leading-[130%]">
            {todayValue}
          </div>
          <div className="text-[12px] text-[#7E7E7E] leading-[150%]">
            Max: {max}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} barSize={28}>
            <defs>
              <pattern
                id="friday-stripes"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform="rotate(45)"
              >
                <rect width="4" height="8" fill="#03045E" />
                <rect x="4" width="4" height="8" fill="#04479C" />
              </pattern>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#333", fontSize: 12 }}
            />
            <YAxis hide domain={[0, max]} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="messages" radius={[3, 3, 3, 3]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarFill(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <TooltipInfo
        text="Shows number of messages sent each day."
        className="absolute right-2 bottom-2 justify-end"
      />
    </div>
  );
};

export default Invites;
