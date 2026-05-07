import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  maxRating?: number;
  color?: string;
  size?: number;
  messages?: string[];
  defaultRating?: number;
  onSetRating?: (rating: number) => void;
}

export default function StarRating({
  maxRating = 5,
  color = "#fcc419",
  size = 24,
  messages = [],
  defaultRating = 0,
  onSetRating,
}: StarRatingProps) {
  const [rating, setRating] = useState(defaultRating);
  const [tempRating, setTempRating] = useState(0);

  function handleRating(value: number) {
    setRating(value);
    if (onSetRating) onSetRating(value);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        {Array.from({ length: maxRating }, (_, i) => (
          <StarIcon
            key={i}
            color={color}
            size={size}
            onRate={() => handleRating(i + 1)}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
            onMouseEnter={() => setTempRating(i + 1)}
            onMouseLeave={() => setTempRating(0)}
          />
        ))}
      </div>
      {(messages.length === maxRating || rating > 0 || tempRating > 0) && (
        <p className="text-sm font-medium" style={{ color }}>
          {messages.length === maxRating
            ? messages[tempRating ? tempRating - 1 : rating - 1]
            : tempRating || rating || ""}
        </p>
      )}
    </div>
  );
}

interface StarIconProps {
  full: boolean;
  onRate: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  color: string;
  size: number;
}

function StarIcon({
  full,
  onRate,
  onMouseEnter,
  onMouseLeave,
  color,
  size,
}: StarIconProps) {
  return (
    <span
      role="button"
      onClick={onRate}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
    >
      <Star
        size={size}
        fill={full ? color : "transparent"}
        stroke={color}
        strokeWidth={full ? 0 : 1.5}
      />
    </span>
  );
}
