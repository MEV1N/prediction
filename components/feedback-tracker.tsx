"use client"

interface FeedbackTrackerProps {
  accuracy: number
  totalPredictions: number
  sequenceLength: number
}

export function FeedbackTracker({ accuracy, totalPredictions, sequenceLength }: FeedbackTrackerProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
      
      {/* Prediction Accuracy */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Prediction Accuracy: {accuracy.toFixed(1)}%
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>Predictions tracked: {totalPredictions}</p>
        <p>Sequence length: {sequenceLength}</p>
      </div>
    </div>
  )
}
