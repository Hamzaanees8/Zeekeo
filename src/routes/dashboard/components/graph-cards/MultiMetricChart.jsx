import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// const data = [
//   {
//     date: "2025-03-23",
//     Views: 0,
//     Invites: 15,
//     Acceptances: 35,
//     Follows: 8,
//     InMail: 12,
//     Sequences: 20,
//     Replies: 5,
//     Endorsements: 9,
//     PostLikes: 25,
//   },
//   {
//     date: "2025-03-24",
//     Views: 20,
//     Invites: 20,
//     Acceptances: 12,
//     Follows: 70,
//     InMail: 18,
//     Sequences: 30,
//     Replies: 7,
//     Endorsements: 11,
//     PostLikes: 28,
//   },
//   {
//     date: "2025-03-25",
//     Views: 80,
//     Invites: 25,
//     Acceptances: 15,
//     Follows: 10,
//     InMail: 20,
//     Sequences: 35,
//     Replies: 10,
//     Endorsements: 15,
//     PostLikes: 35,
//   },
//   {
//     date: "2025-03-26",
//     Views: 10,
//     Invites: 80,
//     Acceptances: 35,
//     Follows: 35,
//     InMail: 22,
//     Sequences: 40,
//     Replies: 11,
//     Endorsements: 18,
//     PostLikes: 40,
//   },
//   {
//     date: "2025-03-27",
//     Views: 38,
//     Invites: 40,
//     Acceptances: 37,
//     Follows: 55,
//     InMail: 25,
//     Sequences: 45,
//     Replies: 15,
//     Endorsements: 20,
//     PostLikes: 42,
//   },
//   {
//     date: "2025-03-28",
//     Views: 15,
//     Invites: 30,
//     Acceptances: 8,
//     Follows: 30,
//     InMail: 23,
//     Sequences: 38,
//     Replies: 13,
//     Endorsements: 17,
//     PostLikes: 38,
//   },
//   {
//     date: "2025-03-29",
//     Views: 80,
//     Invites: 25,
//     Acceptances: 50,
//     Follows: 15,
//     InMail: 20,
//     Sequences: 32,
//     Replies: 12,
//     Endorsements: 14,
//     PostLikes: 33,
//   },
// ];

const METRICS = {
  linkedin_view: "#1D4E89",
  linkedin_invite: "#0F80AA",
  linkedin_invite_accepted: "#1A5B92",
  fetch_profiles: "#04A6C2",
  inmails_sent: "#20BAC5",
  linkedin_message: "#6D2160",
  replies: "#9C27B0",
  twitter_likes: "#FF9800",
  post_likes: "#604CFF",
  endorsement: "#DED300",
  email_messages: "#FF5722",
};

const MultiMetricChart = ({ type, data }) => {
  const [visibleMetrics, setVisibleMetrics] = useState(Object.keys(METRICS));
  const [highlightedMetric, setHighlightedMetric] = useState(null);

  const toggleMetric = metric => {
    setVisibleMetrics(prev =>
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric],
    );
  };

  const isDimmed = metric => !visibleMetrics.includes(metric);
  const formatMetricName = name => {
    return name
      .replace(/_/g, " ") // replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // capitalize first letter of each word
  };
  return (
    <div
      className={`${
        type === "campaigns" ? "bg-[#FFFFFF]" : "bg-[#F4F4F4]"
      } shadow-sm p-4 w-full h-full relative`}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -30, bottom: 10 }}
          onClick={() => setHighlightedMetric(null)}
        >
          <defs>
            {Object.entries(METRICS).map(([key, color]) => (
              <linearGradient
                key={key}
                id={`gradient-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="90%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid vertical={false} horizontal={true} stroke="#BDBDBD" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <YAxis
            domain={[0, 500]}
            ticks={[0, 100, 200, 300, 400, 500]}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <Tooltip
            wrapperStyle={{ top: -20 }}
            formatter={(value, name) => [
              value,
              name
                .replace(/_/g, " ")
                .replace(/\b\w/g, char => char.toUpperCase()),
            ]}
          />

          {Object.keys(METRICS).map(
            key =>
              (highlightedMetric === null || highlightedMetric === key) &&
              visibleMetrics.includes(key) && (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={METRICS[key]}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                  dot={{
                    r: 2,
                    onClick: () => setHighlightedMetric(key),
                    cursor: "pointer",
                  }}
                  activeDot={{ r: 4 }}
                />
              ),
          )}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-gray-600 justify-center">
        {Object.entries(METRICS).map(([label, color]) => (
          <div
            key={label}
            onClick={() => toggleMetric(label)}
            className={`flex items-center cursor-pointer transition-opacity duration-200 text-[12px] text-[#454545] ${
              isDimmed(label) ? "opacity-40" : "opacity-100"
            }`}
          >
            <span
              className="w-4 h-4 border-[3px] rounded-full mr-2"
              style={{ borderColor: color }}
            ></span>
            {formatMetricName(label)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiMetricChart;
