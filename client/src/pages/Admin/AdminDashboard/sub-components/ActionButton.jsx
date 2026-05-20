import React from "react";

export default function ActionButton({ onClick, label, path, description, icon }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-surface-card border-2 border-primary-cyan p-8 min-h-24 flex items-center justify-between group arcade-button-shadow hover:bg-[#1e1e3e] transition-all rounded-md"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-headline text-sm text-primary-cyan">
            {label}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant">
            {path}
          </span>
        </div>
        <p className="font-mono text-[12px] text-on-surface-variant text-left">
          {description}
        </p>
      </div>
      <span
        className="material-symbols-outlined text-4xl text-primary-cyan group-hover:translate-x-1 transition-transform"
        data-icon={icon}
      >
        {icon}
      </span>
    </button>
  );
}
