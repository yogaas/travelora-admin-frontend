import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Confirmed", value: 350, color: "#10B981" },
  { name: "Pending", value: 120, color: "#F59E0B" },
  { name: "Cancelled", value: 30, color: "#EF4444" },
  { name: "Completed", value: 400, color: "#2563EB" },
];

export function BookingStatusChart() {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-premium h-full flex flex-col">
      <h3 className="text-lg font-semibold text-text-primary font-poppins">Booking Status</h3>
      <p className="text-sm text-text-secondary mt-1">Current period overview</p>

      <div className="flex-1 relative min-h-[220px] mt-4 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
          <span className="text-2xl font-bold font-poppins text-text-primary">900</span>
          <span className="text-xs text-text-secondary">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {data.map((item) => (
          <div key={item.name} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex space-x-2 items-center">
              <span className="text-sm text-text-secondary">{item.name}</span>
              <span className="text-sm font-semibold text-text-primary">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
