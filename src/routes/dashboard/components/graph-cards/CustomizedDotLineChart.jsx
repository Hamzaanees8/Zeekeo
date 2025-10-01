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
  <svg x={x - 8} y={y - 8} width={16} height={16} viewBox="0 0 24 24" fill="green">
    <circle cx="12" cy="12" r="10" stroke="green" strokeWidth="2" fill="none" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="green" strokeWidth="2" fill="none" />
    <circle cx="9" cy="10" r="1" fill="green" />
    <circle cx="15" cy="10" r="1" fill="green" />
  </svg>
);

const NeutralIcon = ({ x, y }) => (
  <svg x={x - 8} y={y - 8} width={16} height={16} viewBox="0 0 24 24" fill="orange">
    <circle cx="12" cy="12" r="10" stroke="orange" strokeWidth="2" fill="none" />
    <line x1="9" y1="15" x2="15" y2="15" stroke="orange" strokeWidth="2" />
    <circle cx="9" cy="10" r="1" fill="orange" />
    <circle cx="15" cy="10" r="1" fill="orange" />
  </svg>
);

const NegativeIcon = ({ x, y }) => (
  <svg x={x - 8} y={y - 8} width={16} height={16} viewBox="0 0 24 24" fill="red">
    <circle cx="12" cy="12" r="10" stroke="red" strokeWidth="2" fill="none" />
    <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="red" strokeWidth="2" fill="none" />
    <circle cx="9" cy="10" r="1" fill="red" />
    <circle cx="15" cy="10" r="1" fill="red" />
  </svg>
);

// Custom dot factory
const CustomDot = (type) => (props) => {
  const { cx, cy, value } = props;
  if (value === 0) return null; // do not render if zero
  if (type === "positive") return <PositiveIcon x={cx} y={cy} />;
  if (type === "neutral") return <NeutralIcon x={cx} y={cy} />;
  if (type === "negative") return <NegativeIcon x={cx} y={cy} />;
  return null;
};

export default function CustomizedDotLineChart({ title, data }) {
  
  return (
    <div className="bg-[#FFFFFF] shadow-md p-4 w-full relative rounded-[8px]">
      <div className="flex mb-2 justify-between items-center">
        <div className="text-[16px] text-[#1E1D1D]">{title}</div>
      </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid vertical={false} horizontal={true} stroke="#BDBDBD" />
        <XAxis dataKey="date"  tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666" />
        <YAxis tickLine={false}
            axisLine={false}
            fontSize={10}
            stroke="#666" />
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
    <TooltipInfo
        text="This shows the number of profile views for the selected period."
        className="absolute right-2 bottom-2"
      />
     </div>
  );
}
