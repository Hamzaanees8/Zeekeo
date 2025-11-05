import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

const VerticalBarChart = ({ data }) => {
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 25 }}
        >
          {/* ✅ Just added this line for dashed grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />

          <XAxis
            dataKey="name"
            interval={0} // ✅ Force show all labels
            tick={{ fontSize: 12 }}
            angle={0} // keep horizontal
            dy={10} // move slightly down
          />
          <YAxis />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              fontSize: "13px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: "10px" }}
          />
          <Bar dataKey="Positive" stackId="a" fill="#038D65" />
          <Bar dataKey="Negative" stackId="a" fill="#DE4B32" />
          <Bar dataKey="Neutral" stackId="a" fill="#FFCB4D" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VerticalBarChart;
