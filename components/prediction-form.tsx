"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface PredictionFormProps {
  onPredict: (input: string) => void
}

export function PredictionForm({ onPredict }: PredictionFormProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onPredict(input)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Sequence Input:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 1.5 3.2 6.1 8.4 or 2.3, 4.5, 7.2, 9.1"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter any real numbers (comma or space-separated). Spike threshold: &gt; 7.0
        </p>
      </div>

      <Button type="submit" className="w-full">
        Predict Next
      </Button>
    </form>
  )
}
