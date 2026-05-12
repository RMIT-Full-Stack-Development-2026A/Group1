import React from "react";

export default function MetricCard({ 
  title, 
  value, 
  icon, 
  footer, 
  colorScheme = "blue", // blue, skin, yellow
  loading = false,
  isPremium = false
}) {
  const getSchemeStyles = () => {
    switch (colorScheme) {
      case "blue":
        return {
          border: "border-l-4 border-l-[#4cc9f0]",
          glow: "hover:shadow-[0_0_20px_rgba(76,201,240,0.4)] hover:border-[#4cc9f0]",
          text: "text-[#4cc9f0]"
        };
      case "skin":
        return {
          border: "border-l-4 border-l-[#ffb38a]",
          glow: "hover:shadow-[0_0_20px_rgba(255,179,138,0.4)] hover:border-[#ffb38a]",
          text: "text-[#ffb38a]"
        };
      case "yellow":
        return {
          border: "border-l-4 border-l-[#ffd60a]",
          glow: "hover:shadow-[0_0_20px_rgba(255,214,10,0.4)] hover:border-[#ffd60a]",
          text: "text-[#ffd60a]"
        };
      default:
        return {
          border: "border-l-4 border-l-[#4cc9f0]",
          glow: "hover:shadow-[0_0_20px_rgba(76,201,240,0.4)] hover:border-[#4cc9f0]",
          text: "text-[#4cc9f0]"
        };
    }
  };

  const scheme = getSchemeStyles();

  return (
    <div className={`bg-[#1a1a2e] border-circuit p-6 relative transition-all duration-300 ${scheme.border} ${scheme.glow}`}>
      <div className="flex justify-between items-start mb-4">
        <p className={`text-[10px] font-bold uppercase tracking-widest font-mono ${scheme.text}`}>
          {title}
        </p>
        <span
          className={`material-symbols-outlined text-lg ${scheme.text}`}
          data-icon={icon}
          style={isPremium ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          {icon}
        </span>
      </div>
      <p className={`text-3xl font-headline ${scheme.text}`}>
        {loading ? "..." : value}
      </p>
      {footer && (
        <p className={`text-[9px] mt-2 uppercase font-mono ${scheme.text}`}>
          {footer}
        </p>
      )}
    </div>
  );
}
