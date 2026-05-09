import { Calendar as CalendarIcon, Briefcase, DollarSign, Users, Map, MapPin } from "lucide-react";
import { Layout } from "./Layout";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { BookingStatusChart } from "./BookingStatusChart";
import { RecentBookingsTable } from "./RecentBookingsTable";
import { RecentReviews } from "./RecentReviews";
import { TopDestinations } from "./TopDestinations";

export function Dashboard() {
  return (
    <Layout>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[28px] font-bold text-text-primary font-poppins tracking-tight">Dashboard</h2>
          <p className="text-sm text-text-secondary mt-1">Welcome back, John! Here's what's happening with your business today.</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-2 pr-4 rounded-xl shadow-premium border border-gray-50 max-w-fit cursor-pointer hover:border-gray-200 transition-colors">
          <div className="p-2 bg-blue-50 text-primary-blue rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-text-secondary font-medium">Date Range</p>
            <p className="text-sm font-semibold text-text-primary">Oct 1 - Oct 31, 2024</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value="1,245"
          trend={12.5}
          iconBgColor="bg-blue-50"
          iconColor="text-blue-600"
          icon={<Briefcase className="w-6 h-6" />}
        />
        <StatCard
          title="Total Revenue"
          value="$84,500"
          trend={8.2}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          icon={<DollarSign className="w-6 h-6" />}
        />
        <StatCard
          title="Total Customers"
          value="3,892"
          trend={4.3}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Total Packages"
          value="156"
          trend={-2.1}
          iconBgColor="bg-orange-50"
          iconColor="text-orange-600"
          icon={<Map className="w-6 h-6" />}
        />
        <StatCard
          title="Destinations"
          value="48"
          trend={1.2}
          iconBgColor="bg-pink-50"
          iconColor="text-pink-600"
          icon={<MapPin className="w-6 h-6" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <BookingStatusChart />
        </div>
      </div>

      {/* Tables and Lists Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentBookingsTable />
        </div>
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <TopDestinations />
          <RecentReviews />
        </div>
      </div>
    </Layout>
  );
}
