import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  MapPin,
  Users,
  Shield,
  FileText,
  FolderHeart,
  CreditCard,
  PieChart,
  Plane,
} from "lucide-react";
import { cn } from "../lib/utils";

const menuGroups = [
  {
    title: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ]
  },
  {
    title: "Transaksi",
    items: [
      { icon: CreditCard, label: "Orders", path: "/orders" },
      { icon: CreditCard, label: "Payments", path: "/payments" },
      { icon: FileText, label: "Blog Posts", path: "/blog" },
    ]
  },
  {
    title: "Master Data",
    items: [
      { icon: Map, label: "Tour & Packages", path: "/packages" },
      { icon: MapPin, label: "Destinations", path: "/destinations" },
      { icon: FolderHeart, label: "Blog Categories", path: "/blog-categories" },
      { icon: Shield, label: "Roles", path: "/roles" },
      { icon: Users, label: "Users", path: "/users" },
    ]
  },
  {
    title: "Report",
    items: [
      { icon: PieChart, label: "Report", path: "/reports" },
    ]
  }
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[260px] bg-gradient-to-b from-dark-navy to-[#0a2347] h-screen flex flex-col fixed left-0 top-0 text-white z-20 shadow-xl">
      {/* Logo */}
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-indigo-400 rounded-[12px] flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Plane className="h-5 w-5 text-white transform -rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-poppins font-bold tracking-tight text-white leading-tight">Travelora</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold opacity-80">Tour & Travel Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-4 pb-4 space-y-6 custom-scrollbar">
        {menuGroups.map((group, index) => (
          <div key={index} className="space-y-1.5">
            {group.title !== "Main" && (
                <h3 className="px-4 text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group",
                    isActive
                      ? "bg-gradient-to-r from-primary-blue to-blue-400 text-white shadow-lg shadow-primary-blue/30 shadow-premium"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 mr-3 transition-colors",
                      isActive ? "text-white" : "group-hover:text-blue-300"
                    )}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Promotional Card */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:bg-white/10 transition-colors duration-300">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-blue-300" />
            </div>
            <h4 className="text-sm font-semibold mb-1 text-white">Visit Website</h4>
            <p className="text-xs text-blue-200/70 mb-4 line-clamp-2">Check how your site looks to customers.</p>
            <button className="w-full bg-white text-dark-navy text-xs font-semibold py-2.5 rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
              View Website
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
