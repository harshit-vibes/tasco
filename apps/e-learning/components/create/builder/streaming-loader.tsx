"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "@tasco/ui/icons";

interface StreamingLoaderProps {
  messages: string[];
  interval?: number;
  className?: string;
}

export function StreamingLoader({
  messages,
  interval = 2500,
  className = "",
}: StreamingLoaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
      <p className="text-center text-muted-foreground animate-pulse">
        {messages[currentIndex]}
      </p>
    </div>
  );
}
