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
          placeholder="e.g., 1.5 3.2 2.1 4.8 or 1.5, 3.2, 2.1, 4.8"
          className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter numbers between 1.00 and 5.00 (comma or space-separated)
        </p>
      </div>

      <Button type="submit" className="w-full">
        Predict Next
      </Button>
    </form>
  )
}
