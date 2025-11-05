"use client"

import type React from "react"
import { Button } from "@/components/ui/button"

interface PredictionResultProps {
  prediction: {
    label: string
    confidence: string | number
  }
  onRangeClick: (range: "Low" | "Mid" | "High") => void
}

export function PredictionResult({ prediction, onRangeClick }: PredictionResultProps) {
  const getRangeDisplay = (range: string) => {
    switch (range) {
      case "Low":
        return "1.00 – 2.50"
      case "Mid":
        return "2.51 – 3.75"
      case "High":
        return "3.76 – 5.00"
      default:
        return ""
    }
  }

  const getRangeColors = (range: string) => {
    switch (range) {
      case "Low":
        return {
          bg: "bg-blue-100 hover:bg-blue-200 active:bg-blue-300",
          text: "text-blue-700",
          border: "border-blue-300"
        }
      case "Mid":
        return {
          bg: "bg-amber-100 hover:bg-amber-200 active:bg-amber-300",
          text: "text-amber-700",
          border: "border-amber-300"
        }
      case "High":
        return {
          bg: "bg-red-100 hover:bg-red-200 active:bg-red-300",
          text: "text-red-700",
          border: "border-red-300"
        }
      default:
        return {
          bg: "bg-muted hover:bg-muted/80",
          text: "text-foreground",
          border: "border-border"
        }
    }
  }

  const handleRangeClick = (range: "Low" | "Mid" | "High") => {
    onRangeClick(range)
  }

  const colors = getRangeColors(prediction.label)

  return (
    <div className="space-y-6">
      {/* Prediction Display */}
      <div className="p-6 border-2 border-border rounded-lg bg-background">
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Predicted Range:</p>
            <p className={`text-4xl font-bold ${colors.text}`}>{prediction.label}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Confidence:</p>
            <p className="text-3xl font-bold text-foreground">{prediction.confidence}%</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Range Buttons */}
      <div className="space-y-3">
        <p className="font-semibold text-foreground text-center">Actual Range:</p>
        <div className="grid grid-cols-3 gap-3">
          {(["Low", "Mid", "High"] as const).map((range) => {
            const rangeColors = getRangeColors(range)
            return (
              <button
                key={range}
                onClick={() => handleRangeClick(range)}
                className={`${rangeColors.bg} ${rangeColors.text} border-2 ${rangeColors.border} rounded-lg p-4 font-semibold text-center transition-all duration-150 transform active:scale-95`}
              >
                <div className="text-sm mb-1">{range}</div>
                <div className="text-xs font-normal">({getRangeDisplay(range)})</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
