import { MoreVertical } from "lucide-react";
import { cn } from "../lib/utils";

const bookings = [
  {
    id: "#BK-1982",
    customer: { name: "Alice Johnson", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    package: "Bali Paradise Island",
    date: "Oct 24, 2024",
    amount: "$1,250",
    status: "Confirmed",
  },
  {
    id: "#BK-1983",
    customer: { name: "Michael Smith", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    package: "Maldives Honeymoon",
    date: "Oct 23, 2024",
    amount: "$3,400",
    status: "Pending",
  },
  {
    id: "#BK-1984",
    customer: { name: "Sarah Williams", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    package: "Tokyo Discovery",
    date: "Oct 22, 2024",
    amount: "$2,850",
    status: "Confirmed",
  },
  {
    id: "#BK-1985",
    customer: { name: "James Brown", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    package: "Santorini Getaway",
    date: "Oct 20, 2024",
    amount: "$1,950",
    status: "Cancelled",
  },
  {
    id: "#BK-1986",
    customer: { name: "Emma Davis", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    package: "Swiss Alps Adventure",
    date: "Oct 19, 2024",
    amount: "$2,100",
    status: "Confirmed",
  },
];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20",
  Pending: "bg-amber-50 text-amber-600 ring-1 ring-amber-500/20",
  Cancelled: "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20",
};

export function RecentBookingsTable() {
  return (
    <div className="bg-white rounded-[24px] shadow-premium overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary font-poppins">Recent Bookings</h3>
        <a href="#" className="flex items-center text-sm font-medium text-primary-blue hover:underline">
          View All Bookings
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Booking ID</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Customer</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Package</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="py-4 px-6 text-text-secondary font-medium">{booking.id}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    <img src={booking.customer.avatar} alt={booking.customer.name} className="w-8 h-8 rounded-full border border-gray-100 shadow-sm mr-3" />
                    <span className="font-semibold text-text-primary group-hover:text-primary-blue transition-colors">{booking.customer.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 font-medium text-text-primary">{booking.package}</td>
                <td className="py-4 px-6 text-text-secondary">{booking.date}</td>
                <td className="py-4 px-6 font-semibold text-text-primary">{booking.amount}</td>
                <td className="py-4 px-6">
                  <span className={cn("px-3 py-1 text-xs font-semibold rounded-full", statusStyles[booking.status])}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="text-gray-400 hover:text-primary-blue transition-colors p-1 rounded-lg hover:bg-blue-50 focus:outline-none">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
