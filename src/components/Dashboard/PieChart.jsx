"use client";
import React from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563eb", "#f43f5e", "#fbbf24"]; // Male, Female, Other

const PieChart = ({ data }) => {
  if (!data || !data.length)
    return <p className="text-gray-500">No data to display.</p>;

  return (
    <div className="bg-gradient-to-br from-white/80 to-gray-50/70 backdrop-blur-lg ring-1 ring-gray-200 shadow-lg rounded-3xl p-6 flex flex-col items-center justify-center transition hover:scale-105 hover:shadow-2xl duration-500 min-h-[280px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
        Patient Gender Distribution
      </h3>
      <div className="w-full h-56">
        <ResponsiveContainer>
          <RePieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: 12,
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: "0.85rem" }}
            />
          </RePieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;
