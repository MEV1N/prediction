"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface NumberChartProps {
  numbers: number[]
}

export function NumberChart({ numbers }: NumberChartProps) {
  const data = numbers.map((num, idx) => ({
    index: idx + 1,
    value: num,
  }))

  // Dynamic Y-axis to accommodate any values
  const minValue = Math.min(...numbers)
  const maxValue = Math.max(...numbers)
  const padding = (maxValue - minValue) * 0.1 || 1
  
  const yAxisMin = Math.floor(minValue - padding)
  const yAxisMax = Math.ceil(maxValue + padding)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="index" 
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis 
          domain={[yAxisMin, yAxisMax]} 
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "#374151" }}
        />
        {/* Threshold line at y = 7 */}
        <ReferenceLine 
          y={7} 
          stroke="#ef4444" 
          strokeDasharray="3 3" 
          label={{ value: ">7 Threshold", fill: "#ef4444", fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
