// Stats Card Sub-component - Reusable card for displaying individual statistics
import React from "react";

export default function StatsCard({ label, value, icon, barWidth, color }) {
  // Determine color based on label for consistent theming
  const getColorScheme = () => {
    switch (label) {
      case "WINS":
        return {
          borderColor: "#4cc9f0", // primary-container
          textColor: "#4cc9f0",
        };
      case "LOSSES":
        return {
          borderColor: "#93000a", // error-container
          textColor: "#93000a",
        };
      case "DRAWS":
        return {
          borderColor: "#879398", // outline
          textColor: "#879398",
        };
      case "WIN RATE":
        return {
          borderColor: "#fba866", // tertiary-container
          textColor: "#fba866",
        };
      default:
        return {
          borderColor: "#4cc9f0",
          textColor: "#4cc9f0",
        };
    }
  };

  const colorScheme = getColorScheme();

  const getProgressBar = () => {
    if (label === "WIN RATE" && typeof barWidth === "object") {
      // Special case for win rate with segmented bar
      return (
        <div className="mt-2 h-1 bg-surface-container-highest w-full flex gap-1">
          <div 
            className="h-full flex-grow"
            style={{ backgroundColor: colorScheme.borderColor }}
          ></div>
          <div 
            className="h-full flex-grow"
            style={{ backgroundColor: colorScheme.borderColor }}
          ></div>
          <div 
            className="h-full flex-grow"
            style={{ backgroundColor: colorScheme.borderColor }}
          ></div>
          <div className="h-full bg-surface-container-highest flex-grow"></div>
        </div>
      );
    }

    return (
      <div className="mt-2 h-1 bg-surface-container-highest w-full">
        <div 
          className="h-full"
          style={{ 
            width: `${barWidth}%`,
            backgroundColor: colorScheme.borderColor
          }}
        ></div>
      </div>
    );
  };

  return (
    <div 
      className="border border-outline-variant p-4 relative overflow-hidden group"
      style={{ backgroundColor: "#1b1c2c" }}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[4px]"
        style={{ backgroundColor: colorScheme.borderColor }}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
          {label}
        </p>
        <span 
          className="material-symbols-outlined opacity-50"
          style={{ color: colorScheme.textColor }}
        >
          {icon}
        </span>
      </div>

      <p 
        className="font-arcade text-3xl"
        style={{ color: colorScheme.textColor }}
      >
        {value}
      </p>

      {getProgressBar()}
    </div>
  );
}
