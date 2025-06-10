import React from 'react';
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={cn(
            'transition-colors hover:text-yellow-400',
            sizeClasses[size],
            value >= star ? 'text-yellow-400' : 'text-gray-300'
          )}
        >
          ⭐
        </button>
      ))}
    </div>
  );
} 