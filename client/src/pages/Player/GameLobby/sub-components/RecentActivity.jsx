import React from "react";

export default function RecentActivity({ activities }) {
    return (
        <section className="bg-[#1a1a2e] border-2 border-[#2a2a4e] p-6">
            <h4 className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#879398] mb-4">
                📜 RECENT ACTIVITY
            </h4>
            <div className="space-y-3">
                {activities.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                        <span
                            className={`font-mono min-w-fit ${
                                activity.type === "win"
                                    ? "text-[#4cc9f0]"
                                    : activity.type === "loss"
                                    ? "text-[#ffb4ab]"
                                    : activity.type === "level"
                                    ? "text-[#fad100]"
                                    : "text-[#879398]"
                            }`}
                        >
                            [{activity.time}]
                        </span>
                        <span className="text-[#e3e0f4] text-opacity-70">
                            {activity.action}
                            {activity.opponent && ` vs ${activity.opponent}`}
                            {activity.level && ` → ${activity.level}`}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
