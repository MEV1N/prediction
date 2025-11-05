"use client"

interface FeedbackTrackerProps {
  rollingAccuracy: boolean[]
  sequenceLength: number
}

export function FeedbackTracker({ rollingAccuracy, sequenceLength }: FeedbackTrackerProps) {
  const accuracyPercent =
    rollingAccuracy.length > 0
      ? Math.round((rollingAccuracy.filter((v) => v).length / rollingAccuracy.length) * 100)
      : 0

  return (
    <div className="space-y-4">
      {/* Accuracy Meter */}
      {rollingAccuracy.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all duration-300"
                style={{ width: `${accuracyPercent}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-foreground min-w-[60px]">{accuracyPercent}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Based on last {rollingAccuracy.length} predictions</p>
        </div>
      )}

      {/* Current Sequence */}
      {sequenceLength > 0 && (
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">Sequence Length</p>
          <p className="text-lg font-semibold text-foreground">{sequenceLength} numbers (max 200)</p>
        </div>
      )}
    </div>
  )
}
