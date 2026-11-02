import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 18,
}) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

