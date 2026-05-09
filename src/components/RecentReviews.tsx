import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    author: { name: "Jessica Taylor", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    rating: 5,
    text: "Absolutely stunning trip! The arrangements were perfect and the guides were incredibly knowledgeable.",
    time: "2 hours ago",
  },
  {
    id: 2,
    author: { name: "David Wilson", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    rating: 4,
    text: "Great experience overall. The hotel in Tokyo was fantastic, though flights had a slight delay.",
    time: "5 hours ago",
  },
  {
    id: 3,
    author: { name: "Olivia Martinez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
    rating: 5,
    text: "The Santorini getaway exceeded all expectations. Will definitely use Travelora again!",
    time: "1 day ago",
  },
];

export function RecentReviews() {
  return (
    <div className="bg-white rounded-[24px] shadow-premium p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary font-poppins">Recent Reviews</h3>
      </div>
      <div className="space-y-6">
        {reviews.map((review, i) => (
          <div key={review.id} className={i !== reviews.length - 1 ? "pb-6 border-b border-gray-50" : ""}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-3">
                <img src={review.author.avatar} alt={review.author.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                  <h4 className="text-sm font-semibold text-text-primary">{review.author.name}</h4>
                  <p className="text-xs text-text-secondary">{review.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mt-2 line-clamp-2">
              "{review.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
