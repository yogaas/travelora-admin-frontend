const destinations = [
  {
    id: "bali",
    name: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80",
    bookings: 1245,
    percentage: 85,
    color: "bg-blue-500",
  },
  {
    id: "maldives",
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=300&q=80",
    bookings: 982,
    percentage: 65,
    color: "bg-indigo-500",
  },
  {
    id: "tokyo",
    name: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=300&q=80",
    bookings: 854,
    percentage: 55,
    color: "bg-emerald-500",
  },
  {
    id: "santorini",
    name: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=300&q=80",
    bookings: 642,
    percentage: 45,
    color: "bg-amber-500",
  },
];

export function TopDestinations() {
  return (
    <div className="bg-white rounded-[24px] shadow-premium p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary font-poppins">Top Destinations</h3>
      </div>
      <div className="space-y-5">
        {destinations.map((dest) => (
          <div key={dest.id} className="group cursor-pointer">
            <div className="flex items-center mb-2">
              <img src={dest.image} alt={dest.name} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow mr-4" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary-blue transition-colors">{dest.name}</h4>
                  <span className="text-xs font-semibold text-text-secondary">{dest.bookings} bookings</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${dest.color} opacity-90 transition-all duration-1000 ease-out`} style={{ width: `${dest.percentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
