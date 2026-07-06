import React, { useEffect, useState } from "react";

type ExpirationTimerProps = {
  startTime: number;
  expiresIn?: number | null;
};

export const ExpirationTimer: React.FC<ExpirationTimerProps> = ({ startTime, expiresIn }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresIn) return;
    const target = startTime + expiresIn;

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    };

    update(); // Initial check
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, expiresIn]);

  if (!expiresIn) return null;
  if (timeLeft <= 0) return <span className="text-red-500 font-bold">Expired</span>;

  const seconds = Math.floor(timeLeft / 1000);
  return <span className="text-yellow-500 font-mono">{seconds}s left</span>;
};
