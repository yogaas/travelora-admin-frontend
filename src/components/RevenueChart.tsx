import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 6890 },
  { name: "Jun", revenue: 8390 },
  { name: "Jul", revenue: 9490 },
  { name: "Aug", revenue: 8100 },
  { name: "Sep", revenue: 10200 },
  { name: "Oct", revenue: 11000 },
  { name: "Nov", revenue: 12500 },
  { name: "Dec", revenue: 14000 },
];

export function RevenueChart() {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-premium h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-poppins">Revenue Overview</h3>
          <p className="text-sm text-text-secondary mt-1">Monthly earning performance</p>
        </div>
        <select className="bg-gray-50 border border-gray-100 text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-blue text-text-secondary font-medium">
          <option>This Year</option>
          <option>Last Year</option>
        </select>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%" className={"absolute inset-0"}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6B7280", fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6B7280", fontSize: 12 }} 
              dx={-10}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                padding: "12px",
                fontWeight: 500,
              }}
              itemStyle={{ color: "#2563EB" }}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 2, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 6, fill: "#2563EB", stroke: "#fff", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
