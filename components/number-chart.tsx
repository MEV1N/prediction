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

  const minValue = Math.min(...numbers, 1) - 0.5
  const maxValue = Math.max(...numbers, 5) + 0.5

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="index" stroke="var(--color-muted-foreground)" />
        <YAxis domain={[Math.max(0.5, minValue), Math.min(5.5, maxValue)]} stroke="var(--color-muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-background)",
            border: `1px solid var(--color-border)`,
            borderRadius: "0.5rem",
          }}
          labelStyle={{ color: "var(--color-foreground)" }}
        />
        <ReferenceLine y={2.5} stroke="#3b82f6" strokeDasharray="5 5" label="Low/Mid: 2.50" />
        <ReferenceLine y={3.75} stroke="#f59e0b" strokeDasharray="5 5" label="Mid/High: 3.75" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          dot={{ fill: "var(--color-primary)", r: 5 }}
          activeDot={{ r: 7 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
