// Line chart component for monthly registration trends
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";

export default function RegistrationLineChart({
  data,
  title,
  xAxisTitle = "Day",
  xAxisKey = "day",
  xAxisLabels = [],
  tooltipLabelPrefix = "Day",
}) {
  const totalRegistrations = data.reduce((sum, value) => sum + value, 0);
  const chartData = data.map((value, index) => ({
    [xAxisKey]: xAxisLabels[index] ?? index + 1,
    registrations: value,
  }));

  const labelInterval = data.length > 15 ? Math.ceil(data.length / 8) : 2;

  return (
    <div className="bg-surface-card border border-cyan-500/30 rounded-lg p-6 glow-container">
      <div className="mb-6 min-h-12 flex items-start">
        <h3 className="font-headline text-cyan-400 text-xs uppercase tracking-[0.2em] leading-tight glow-text-cyan">
          {title}: {totalRegistrations}
        </h3>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 24, bottom: 38 }}>
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
              dataKey={xAxisKey}
              stroke="rgba(0, 255, 255, 0.6)"
              interval={labelInterval}
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
              labelFormatter={(label) => `${tooltipLabelPrefix} ${label}`}
            />
            <Line
              type="monotone"
              dataKey="registrations"
              stroke="#00d4ff"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
