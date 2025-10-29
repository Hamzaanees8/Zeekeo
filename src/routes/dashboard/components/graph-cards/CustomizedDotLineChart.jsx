import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TooltipInfo from "../TooltipInfo";

// Example SVG icons (you can replace with your own React components or <img />)
const PositiveIcon = ({ x, y }) => (
  <svg
    x={x - 8}
    y={y - 8}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="green"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="green"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 14s1.5 2 4 2 4-2 4-2"
      stroke="green"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="9" cy="10" r="1" fill="green" />
    <circle cx="15" cy="10" r="1" fill="green" />
  </svg>
);

const NeutralIcon = ({ x, y }) => (
  <svg
    x={x - 8}
    y={y - 8}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="orange"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="orange"
      strokeWidth="2"
      fill="none"
    />
    <line x1="9" y1="15" x2="15" y2="15" stroke="orange" strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill="orange" />
    <circle cx="15" cy="10" r="1" fill="orange" />
  </svg>
);

const NegativeIcon = ({ x, y }) => (
  <svg
    x={x - 8}
    y={y - 8}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="red"
  >
    <circle cx="12" cy="12" r="10" stroke="red" strokeWidth="2" fill="none" />
    <path
      d="M8 16s1.5-2 4-2 4 2 4 2"
      stroke="red"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="9" cy="10" r="1" fill="red" />
    <circle cx="15" cy="10" r="1" fill="red" />
  </svg>
);

// Custom dot factory
const CustomDot = type => props => {
  const { cx, cy, value, payload } = props;
  if (value === 0 || value == null) return null;

  // Extract all values for this date (data point)
  const { positive, neutral, negative } = payload;

  // Small vertical offset to visually separate overlapping dots
  const OFFSET = 4;

  let yOffset = 0;

  // --- Overlap handling logic ---
  const allEqual = positive === neutral && neutral === negative;
  if (allEqual) {
    // All 3 same — separate all three vertically
    if (type === "positive") yOffset = -OFFSET;
    if (type === "neutral") yOffset = 0;
    if (type === "negative") yOffset = OFFSET;
  } else {
    // Two overlap cases
    if (positive === neutral && type === "positive") yOffset = -OFFSET / 1.5;
    if (positive === neutral && type === "neutral") yOffset = OFFSET / 1.5;

    if (positive === negative && type === "positive") yOffset = -OFFSET / 1.5;
    if (positive === negative && type === "negative") yOffset = OFFSET / 1.5;

    if (neutral === negative && type === "neutral") yOffset = -OFFSET / 1.5;
    if (neutral === negative && type === "negative") yOffset = OFFSET / 1.5;
  }

  // Render correct icon with adjusted Y
  if (type === "positive") return <PositiveIcon x={cx} y={cy + yOffset} />;
  if (type === "neutral") return <NeutralIcon x={cx} y={cy + yOffset} />;
  if (type === "negative") return <NegativeIcon x={cx} y={cy + yOffset} />;
  return null;
};

export default function CustomizedDotLineChart({ title, data, tooltipText }) {
  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full relative rounded-[8px]">
      <div className="flex mb-2 justify-between items-center">
        <div className="text-[16px] text-[#1E1D1D]">{title}</div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: -30, bottom: 5 }}
        >
          <CartesianGrid vertical={false} horizontal={true} stroke="#BDBDBD" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666"
            allowDecimals={false} // ensures ticks are whole numbers
            tickFormatter={value => (Number.isInteger(value) ? value : "")} // hides any decimals if they slip through
          />
          <Tooltip />
          <Legend />

          <Line
            type="monotone"
            dataKey="positive"
            stroke="green"
            dot={CustomDot("positive")}
          />
          <Line
            type="monotone"
            dataKey="neutral"
            stroke="orange"
            dot={CustomDot("neutral")}
          />
          <Line
            type="monotone"
            dataKey="negative"
            stroke="red"
            dot={CustomDot("negative")}
          />
        </LineChart>
      </ResponsiveContainer>
      <TooltipInfo text={tooltipText} className="absolute right-2 bottom-2" />
    </div>
  );
}
