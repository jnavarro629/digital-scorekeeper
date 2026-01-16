import React, { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { toast } from "sonner";

export const GameTimer = () => {
  const { t } = useTranslation();
  const {
    timeElapsed,
    isTimerRunning,
    currentQuarter,
    quarterDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTime,
    nextQuarter,
  } = useGameStore();

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        updateTime(timeElapsed + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning, timeElapsed, updateTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleNextQuarter = () => {
    pauseTimer();
    nextQuarter();
    toast.success(
      t("toasts.quarter_started", { quarter: currentQuarter + 1 }),
      { duration: 1500 }
    );
  };

  const getQuarterLabel = () => {
    if (currentQuarter <= 4) {
      return `${currentQuarter}${t("game_timer.quarter")}`;
    } else {
      return `${t("game_timer.overtime")} ${currentQuarter - 4}`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Quarter Display */}
      <div className="text-center">
        <div className="text-sm font-medium text-muted-foreground">
          {getQuarterLabel()}
        </div>
      </div>

      {/* Timer Display */}
      <div className="bg-card border-2 border-border rounded-lg px-4 md:px-6 py-2 md:py-3 shadow-lg">
        <div className="font-digital text-3xl md:text-5xl lg:text-6xl tracking-wider text-foreground">
          {formatTime(timeElapsed)}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isTimerRunning ? pauseTimer : startTimer}
          className="h-10 w-10"
        >
          {isTimerRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={resetTimer}
          className="h-10 w-10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextQuarter}
          className="h-10 w-10"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
