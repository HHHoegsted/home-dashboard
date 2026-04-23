import * as React from "react";
import { cn } from "../../lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: number;
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-white/10",
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-full bg-white/80 transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };