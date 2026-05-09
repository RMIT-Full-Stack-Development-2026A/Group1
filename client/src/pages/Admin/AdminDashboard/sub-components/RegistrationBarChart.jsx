// Bar chart component for daily registration stats
import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";

export default function RegistrationBarChart({ data, title, labels, xAxisTitle = "Time" }) {
  const totalRegistrations = data.reduce((sum, value) => sum + value, 0);
  const chartData = data.map((value, index) => ({
    name: labels[index] || index,
    registrations: value,
  }));

  return (
    <div className="bg-surface-card border border-cyan-500/30 rounded-lg p-6 glow-container">
      <div className="mb-6 min-h-12 flex items-start">
        <h3 className="font-headline text-cyan-400 text-xs uppercase tracking-[0.2em] leading-tight glow-text-cyan">
          {title}: {totalRegistrations}
        </h3>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 24, bottom: 38 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
            <YAxis
              stroke="rgba(0, 255, 255, 0.6)"
              tick={{ fontSize: 12, fontFamily: "inherit" }}
              allowDecimals={false}
            >
              <Label
                value="Registrations"
                angle={-90}
                position="insideLeft"
                dx={-2}
                style={{
                  fill: "rgba(0, 255, 255, 0.65)",
                  fontSize: 12,
                  fontFamily: "inherit",
                  textAnchor: "middle",
                }}
              />
            </YAxis>
            <XAxis
              dataKey="name"
              stroke="rgba(0, 255, 255, 0.6)"
              height={42}
              tickMargin={8}
              tick={{ fontSize: 12, fontFamily: "inherit" }}
            >
              <Label
                value={xAxisTitle}
                position="insideBottom"
                offset={-2}
                style={{
                  fill: "rgba(0, 255, 255, 0.65)",
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              />
            </XAxis>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2a3a",
                border: "1px solid rgba(0, 255, 255, 0.5)",
                borderRadius: "6px",
                color: "#00ffff",
                fontFamily: "inherit",
              }}
              formatter={(value) => [value, "Registrations"]}
            />
            <Bar dataKey="registrations" fill="#00d4ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
