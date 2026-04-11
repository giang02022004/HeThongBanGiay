import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ durationMinutes, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLow = timeLeft < 60; // Less than 1 minute

  return (
    <div className={`
      flex items-center gap-3 px-6 py-3 rounded-2xl
      ${isLow ? 'bg-danger text-white' : 'bg-primary/5 text-primary'} 
      font-bold text-xl transition-all duration-300
    `}>
      <Clock size={24} strokeWidth={2.5} />
      <span className="font-mono tracking-wider">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;
