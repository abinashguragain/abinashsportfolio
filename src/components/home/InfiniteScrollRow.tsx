import { useRef, useEffect, useState, ReactNode } from "react";

interface InfiniteScrollRowProps {
  children: ReactNode[];
  speed?: number; // pixels per second
  className?: string;
}

export const InfiniteScrollRow = ({ children, speed = 30, className = "" }: InfiniteScrollRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId: number;
    let lastTime: number | null = null;

    const animate = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!isPaused) {
        container.scrollLeft += (speed * delta) / 1000;

        // When we've scrolled past the first set, reset to create infinite loop
        const halfScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft -= halfScroll;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, speed]);

  // Duplicate children for seamless loop
  return (
    <div
      ref={scrollRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="flex gap-6 w-max">
        {children}
        {children}
      </div>
    </div>
  );
};
