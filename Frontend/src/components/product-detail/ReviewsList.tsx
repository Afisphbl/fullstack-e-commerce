import { Button } from "@/components/ui/button";
import { Star as StarIcon, MessageSquare } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  reviewLimit: number;
  onPageChange: (page: number) => void;
}

export const ReviewsList = ({
  reviews,
  totalReviews,
  currentPage,
  reviewLimit,
  onPageChange,
}: ReviewsListProps) => {
  // Guard against invalid reviewLimit to prevent division by zero
  const safeLimit = Math.max(1, reviewLimit);
  const totalPages = Math.max(1, Math.ceil(totalReviews / safeLimit));
  
  // Clamp currentPage to valid range
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  return (
    <div>
      <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        Customer Reviews ({totalReviews})
      </h2>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-card rounded-xl border border-border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {review.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {review.review}
              </p>
            </div>
          ))}

          {/* Review Pagination */}
          {totalReviews > safeLimit && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 1}
                onClick={() => onPageChange(safePage - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-4">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === totalPages}
                onClick={() => onPageChange(safePage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};
