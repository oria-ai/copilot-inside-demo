import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

// --- react-circular-progressbar integration ---
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// CircularProgress: SVG-based circular progress bar
interface CircularProgressProps {
  value: number; // 0-100
  size?: number; // px, default 40
  strokeWidth?: number; // px, default 4
  className?: string;
}

export const CircularProgress = ({ value, size = 40, strokeWidth = 4, className = '' }: CircularProgressProps) => {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <CircularProgressbar
        value={value}
        strokeWidth={strokeWidth}
        text={''}
        styles={buildStyles({
          pathColor: '#06b6d4', // Tailwind cyan-500
          trailColor: '#e5e7eb', // Tailwind gray-200
          strokeLinecap: 'round',
          textColor: 'transparent',
          pathTransitionDuration: 0.5,
        })}
      />
    </div>
  );
};

export { Progress }
