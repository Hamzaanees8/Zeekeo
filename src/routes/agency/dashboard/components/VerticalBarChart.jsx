import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

const VerticalBarChart = ({ data }) => {
  const colors = {
    Positive: "#038D65",
    Negative: "#DE4B32",
    Neutral: "#FFCB4D",
  };

  const barKeys = ["Positive", "Negative", "Neutral"];

  const isTopVisibleSegment = (dataPoint, currentKey) => {
    const keys = barKeys;
    let currentIndex = keys.indexOf(currentKey);

    // Check all subsequent keys to see if they have values
    for (let i = currentIndex + 1; i < keys.length; i++) {
      if (dataPoint[keys[i]] && dataPoint[keys[i]] > 0) {
        return false; // There's a bar above with value
      }
    }
    return true; // This is the top bar with value
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fontSize: 12 }}
            angle={-25}
            textAnchor="end"
            height={60}
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
            wrapperStyle={{ paddingTop: "40px" }}
          />

          {barKeys.map(key => (
            <Bar key={key} dataKey={key} stackId="a" fill={colors[key]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[key]}
                  radius={isTopVisibleSegment(entry, key) ? [4, 4, 0, 0] : 0}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VerticalBarChart;
