import { ReactNode } from "react";
import { MoveUp, MoveDown } from "lucide-react";
import { cn } from "../lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: number;
  iconBgColor: string;
  iconColor: string;
}

export function StatCard({ title, value, icon, trend, iconBgColor, iconColor }: StatCardProps) {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-premium transition-transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] duration-300 group cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-text-primary font-poppins group-hover:text-primary-blue transition-colors duration-300">{value}</h3>
        </div>
        <div className={cn("h-12 w-12 rounded-[16px] flex items-center justify-center shadow-sm", iconBgColor, iconColor)}>
          {icon}
        </div>
      </div>
      <div className="mt-5 flex items-center text-sm">
        <div className={cn("flex items-center font-medium px-2 py-0.5 rounded-full", isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
          {isPositive ? <MoveUp className="h-3 w-3 mr-1" /> : <MoveDown className="h-3 w-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
        <span className="text-text-secondary ml-2 text-xs">vs last week</span>
      </div>
    </div>
  );
}
