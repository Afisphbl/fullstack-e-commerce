import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import {
  createReview,
  updateReview,
  fetchReviewsByProduct,
  Review,
} from "@/lib/api";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({
  productId,
  existingReview,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.review);
    } else {
      setRating(5);
      setComment("");
    }
  }, [existingReview, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      if (existingReview) {
        await updateReview(productId, existingReview._id, {
          rating,
          review: comment,
        });
        toast.success("Review updated successfully!");
      } else {
        await createReview(productId, {
          rating,
          review: comment,
        });
        toast.success("Review submitted successfully!");
      }

      onReviewSubmitted();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24'>
      <h3 className='text-xl font-display font-bold text-foreground mb-6'>
        {existingReview ? "Update Your Review" : "Write a Review"}
      </h3>

      {!isAuthenticated ? (
        <div className='text-center py-4 space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Please log in to share your experience with this product.
          </p>
          <Button asChild variant='outline' className='w-full'>
            <Link to='/login'>Log In</Link>
          </Button>
        </div>
      ) : user?.role !== "user" ? (
        <div className='text-center py-4'>
          <p className='text-sm text-muted-foreground'>
            Only customers can leave reviews.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-muted-foreground'>
              Your Rating
            </label>
            <StarRating
              key={existingReview?._id || "new"}
              defaultRating={rating}
              onSetRating={setRating}
              size={28}
            />
          </div>

          <div className='space-y-2'>
            <label
              htmlFor='review'
              className='text-sm font-medium text-muted-foreground'
            >
              Your Review{" "}
              <span className='text-xs text-muted-foreground'>
                (min. 10 chars)
              </span>
            </label>
            <textarea
              id='review'
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Share your experience with this product...'
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              required
              minLength={10}
            />
          </div>

          <Button
            type='submit'
            className='w-full gap-2'
            disabled={isSubmitting || comment.trim().length < 10}
          >
            {isSubmitting ? (
              <LoadingSpinner size='sm' className='py-0' />
            ) : null}
            {isSubmitting
              ? "Saving..."
              : existingReview
                ? "Update Review"
                : "Submit Review"}
          </Button>
        </form>
      )}
    </div>
  );
};
