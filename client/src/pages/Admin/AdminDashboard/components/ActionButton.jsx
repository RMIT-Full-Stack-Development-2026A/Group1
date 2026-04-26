import React from "react";

export default function ActionButton({ onClick, label, path, description, icon }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 bg-[#1a1a2e] border-2 border-[#4cc9f0] p-6 flex items-center justify-between group arcade-button-shadow hover:bg-[#1e1e3e] transition-all"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-headline text-xs text-[#4cc9f0]">
            {label}
          </span>
          <span className="font-mono text-[9px] text-on-surface-variant">
            {path}
          </span>
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant text-left">
          {description}
        </p>
      </div>
      <span
        className="material-symbols-outlined text-2xl text-[#4cc9f0] group-hover:translate-x-1 transition-transform"
        data-icon={icon}
      >
        {icon}
      </span>
    </button>
  );
}
