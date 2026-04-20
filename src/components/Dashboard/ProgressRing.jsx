"use client";
import React from "react";

const ProgressRing = ({ percentage = 0 }) => {
  const radius = 60;             // bigger circle
  const stroke = 10;
  const normalizedRadius = radius - stroke;
  const circumference = 2 * Math.PI * normalizedRadius;

  // Clamp percentage between 0-100
  const pct = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-blue-50/70 to-white/60 backdrop-blur-lg ring-1 ring-blue-100 shadow-xl rounded-3xl p-6 flex flex-col items-center justify-center transition hover:scale-105 hover:shadow-2xl duration-500 min-h-[280px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
        Completion Rate
      </h3>
      <svg height={radius * 2} width={radius * 2}>
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground circle */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-1000 ease-out transform rotate-[-90deg] origin-center"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        {/* Percentage text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          fontSize="1.5rem"
          fontWeight="700"
          fill="#1e3a8a"
        >
          {pct}%
        </text>
      </svg>
    </div>
  );
};

export default ProgressRing;
