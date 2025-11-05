"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PredictionForm } from "@/components/prediction-form"
import { PredictionResult } from "@/components/prediction-result"
import { FeedbackTracker } from "@/components/feedback-tracker"
import { NumberChart } from "@/components/number-chart"
import { PredictionEngine } from "@/lib/prediction-engine"

interface StoredData {
  sequence: number[]
  rollingAccuracy: boolean[]
  transitionMatrix: Record<string, number>
}

export default function Home() {
  const [sequence, setSequence] = useState<number[]>([])
  const [prediction, setPrediction] = useState<any>(null)
  const [rollingAccuracy, setRollingAccuracy] = useState<boolean[]>([])
  const [transitionMatrix, setTransitionMatrix] = useState<Record<string, number>>({})
  const [error, setError] = useState("")

  // Initialize from localStorage
  useEffect(() => {
    const storedSequence = localStorage.getItem("sequence")
    const storedAccuracy = localStorage.getItem("rollingAccuracy")
    const storedMatrix = localStorage.getItem("transitionMatrix")
    
    if (storedSequence) {
      setSequence(JSON.parse(storedSequence))
    }
    if (storedAccuracy) {
      setRollingAccuracy(JSON.parse(storedAccuracy))
    }
    if (storedMatrix) {
      setTransitionMatrix(JSON.parse(storedMatrix))
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (sequence.length > 0) {
      localStorage.setItem("sequence", JSON.stringify(sequence))
    }
    if (rollingAccuracy.length > 0) {
      localStorage.setItem("rollingAccuracy", JSON.stringify(rollingAccuracy))
    }
    if (Object.keys(transitionMatrix).length > 0) {
      localStorage.setItem("transitionMatrix", JSON.stringify(transitionMatrix))
    }
  }, [sequence, rollingAccuracy, transitionMatrix])

  const handlePrediction = (input: string) => {
    setError("")
    const numbers = input
      .split(/[,\s]+/)
      .map((n) => Number.parseFloat(n))
      .filter((n) => !isNaN(n))

    for (const num of numbers) {
      const validation = PredictionEngine.validateInput(num)
      if (!validation.valid) {
        setError(validation.error || "Invalid input")
        return
      }
    }

    if (numbers.length === 0) {
      setError("Please enter at least one number")
      return
    }

    const newSequence = [...sequence, ...numbers].slice(-200)
    setSequence(newSequence)

    // Generate prediction
    const result = PredictionEngine.predictNext(newSequence)
    setPrediction(result)
  }

  const handleRangeClick = (range: "Low" | "Mid" | "High") => {
    // Get representative value for the range
    const representative = range === "Low" ? 1.75 : range === "Mid" ? 3.10 : 4.40
    
    // Check if prediction was correct
    const wasCorrect = prediction?.label === range
    
    // Append representative value to sequence
    const newSequence = [...sequence, representative].slice(-200)
    setSequence(newSequence)

    // Update transition matrix
    const newMatrix = PredictionEngine.buildTransitionMatrix(newSequence)
    setTransitionMatrix(newMatrix)

    // Update accuracy
    const newRollingAccuracy = [...rollingAccuracy, wasCorrect].slice(-20)
    setRollingAccuracy(newRollingAccuracy)

    // Generate new prediction immediately
    setTimeout(() => {
      const newPrediction = PredictionEngine.predictNext(newSequence)
      setPrediction(newPrediction)
    }, 150)
  }

  const handleReset = () => {
    setSequence([])
    setPrediction(null)
    setRollingAccuracy([])
    setTransitionMatrix({})
    setError("")
    localStorage.removeItem("sequence")
    localStorage.removeItem("rollingAccuracy")
    localStorage.removeItem("transitionMatrix")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Number Range Predictor</h1>
          <p className="text-muted-foreground">
            Predict number categories (Low, Mid, High) with weighted-mean forecasting
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Input and Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Enter Number Sequence</h2>
              <PredictionForm onPredict={handlePrediction} />
            </Card>

            {/* Result Card with Range Feedback */}
            {prediction && (
              <Card className="p-6 bg-accent/5 border-accent/20">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Prediction Result</h2>
                <PredictionResult prediction={prediction} onRangeClick={handleRangeClick} />
              </Card>
            )}

            {/* Chart */}
            {sequence.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Sequence Visualization</h2>
                <NumberChart numbers={sequence} />
              </Card>
            )}
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Statistics</h2>
              <FeedbackTracker
                rollingAccuracy={rollingAccuracy}
                sequenceLength={sequence.length}
              />
            </Card>

            {/* Reset Button */}
            <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
              Reset All Data
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
