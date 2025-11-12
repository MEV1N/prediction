"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface PredictionResultProps {
  result: {
    willExceed7: boolean
    probability: number
    confidence: number
    reasoning: string
  } | null
}

export function PredictionResult({ result, onFeedback }: PredictionResultProps & { onFeedback: (actualValue: number) => void }) {
  const [actualInput, setActualInput] = useState("")
  const [error, setError] = useState("")

  if (!result) return null

  const { willExceed7, probability, confidence, reasoning } = result

  // Calculate certainty level
  let certainty = "Low"
  if (confidence >= 80) certainty = "High"
  else if (confidence >= 60) certainty = "Medium"

  const getCertaintyColor = (cert: string) => {
    switch (cert) {
      case "High":
        return "text-emerald-600"
      case "Medium":
        return "text-amber-600"
      case "Low":
        return "text-gray-600"
      default:
        return "text-foreground"
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = Number.parseFloat(actualInput)

    if (isNaN(value) || !isFinite(value)) {
      setError("Please enter a valid number")
      return
    }

    onFeedback(value)
    setActualInput("")
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* Prediction Display */}
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Next Value Prediction</h2>
        
        <div className="space-y-4">
          {/* Main Prediction */}
          <div className="text-center py-4">
            <p className="text-lg mb-2 text-gray-600 dark:text-gray-400">
              {willExceed7 ? "Next value will likely exceed 7" : "Next value expected to stay at or below 7"}
            </p>
          </div>

          {/* Probability */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Probability:</p>
            <p className="text-3xl font-bold">{(probability * 100).toFixed(1)}%</p>
          </div>

          {/* Confidence & Certainty Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confidence:</p>
              <p className="text-2xl font-bold">{confidence.toFixed(0)}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Certainty:</p>
              <p className={`text-2xl font-bold ${getCertaintyColor(certainty)}`}>{certainty}</p>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${confidence}%` }}
            />
          </div>

          {/* Reasoning */}
          {reasoning && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Analysis:</p>
              <p className="text-sm italic">{reasoning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="font-semibold">What was the actual next value?</p>
        <div>
          <input
            type="number"
            step="any"
            value={actualInput}
            onChange={(e) => setActualInput(e.target.value)}
            placeholder="e.g., 8.5 or 3.2"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Enter any real number. The model learns from your feedback.
          </p>
        </div>
        <Button type="submit" className="w-full">
          Submit Feedback
        </Button>
      </form>
    </div>
  )
}
