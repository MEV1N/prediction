"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PredictionForm } from "@/components/prediction-form"
import { PredictionResult } from "@/components/prediction-result"
import { FeedbackTracker } from "@/components/feedback-tracker"
import { NumberChart } from "@/components/number-chart"
import { 
  predictNextAbove7, 
  updateModel, 
  getModelParameters,
  setModelParameters,
  resetModel
} from "@/lib/predictor-above7"

export default function Home() {
  const [sequence, setSequence] = useState<number[]>([])
  const [prediction, setPrediction] = useState<any>(null)
  const [correctPredictions, setCorrectPredictions] = useState<number>(0)
  const [totalPredictions, setTotalPredictions] = useState<number>(0)
  const [error, setError] = useState("")

  // Initialize from localStorage
  useEffect(() => {
    const storedSequence = localStorage.getItem("sequence")
    const storedModelParams = localStorage.getItem("modelParameters")
    const storedCorrect = localStorage.getItem("correctPredictions")
    const storedTotal = localStorage.getItem("totalPredictions")
    
    if (storedSequence) {
      setSequence(JSON.parse(storedSequence))
    }
    if (storedModelParams) {
      setModelParameters(JSON.parse(storedModelParams))
    }
    if (storedCorrect) {
      setCorrectPredictions(JSON.parse(storedCorrect))
    }
    if (storedTotal) {
      setTotalPredictions(JSON.parse(storedTotal))
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (sequence.length > 0) {
      localStorage.setItem("sequence", JSON.stringify(sequence))
    }
  }, [sequence])

  useEffect(() => {
    localStorage.setItem("correctPredictions", JSON.stringify(correctPredictions))
  }, [correctPredictions])

  useEffect(() => {
    localStorage.setItem("totalPredictions", JSON.stringify(totalPredictions))
  }, [totalPredictions])

  const handlePrediction = (input: string) => {
    setError("")
    const numbers = input
      .split(/[,\s]+/)
      .map((n) => Number.parseFloat(n))
      .filter((n) => !isNaN(n) && isFinite(n))

    if (numbers.length === 0) {
      setError("Please enter at least one valid number")
      return
    }

    const newSequence = [...sequence, ...numbers].slice(-200)
    setSequence(newSequence)

    // Generate prediction
    const result = predictNextAbove7(newSequence)
    setPrediction(result)
  }

  const handleFeedback = (actualValue: number) => {
    if (!prediction) return

    // Determine if actual value exceeds 7
    const actualExceeds7 = actualValue > 7

    // Check if prediction was correct
    const wasCorrect = prediction.willExceed7 === actualExceeds7

    // Update accuracy tracking
    setCorrectPredictions(prev => prev + (wasCorrect ? 1 : 0))
    setTotalPredictions(prev => prev + 1)

    // Update model with online learning
    updateModel(actualValue, prediction)
    
    // Save updated model parameters to localStorage
    const params = getModelParameters()
    localStorage.setItem("modelParameters", JSON.stringify(params))

    // Append actual value to sequence
    const newSequence = [...sequence, actualValue].slice(-200)
    setSequence(newSequence)

    // Generate new prediction immediately
    setTimeout(() => {
      const newPrediction = predictNextAbove7(newSequence)
      setPrediction(newPrediction)
    }, 150)
  }

  const handleReset = () => {
    setSequence([])
    setPrediction(null)
    resetModel()
    setCorrectPredictions(0)
    setTotalPredictions(0)
    setError("")
    localStorage.removeItem("sequence")
    localStorage.removeItem("modelParameters")
    localStorage.removeItem("correctPredictions")
    localStorage.removeItem("totalPredictions")
  }

  const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions) * 100 : 0

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Above 7 Predictor</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Will the next number exceed 7? ML-powered predictions with continuous learning.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Input and Result */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Enter Number Sequence</h2>
              <PredictionForm onPredict={handlePrediction} />
            </Card>

            {/* Result Card with Feedback */}
            {prediction && (
              <Card className="p-6">
                <PredictionResult result={prediction} onFeedback={handleFeedback} />
              </Card>
            )}

            {/* Chart */}
            {sequence.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sequence Visualization</h2>
                <NumberChart numbers={sequence} />
              </Card>
            )}
          </div>

          {/* Right Column: Stats */}
          <div className="space-y-6">
            <FeedbackTracker
              accuracy={accuracy}
              totalPredictions={totalPredictions}
              sequenceLength={sequence.length}
            />

            {/* Reset Button */}
            <Button onClick={handleReset} variant="outline" className="w-full">
              Reset All Data
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
