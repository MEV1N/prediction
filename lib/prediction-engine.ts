/**
 * Spike Probability Predictor - Continuous ML Model
 *
 * Predicts probability of next value exceeding 7.0 using:
 * - Rolling statistical features (mean, std, slope)
 * - Logistic regression with online weight updates
 * - Adaptive learning from user feedback
 *
 * No range restrictions - accepts any real numbers.
 */

interface SpikePrediction {
  predictedSpike: boolean
  probability: number
  confidence: number
  certaintyLabel: "High Certainty" | "Medium Certainty" | "Low Certainty"
  reason: string
  features: {
    mean: number
    std: number
    slope: number
  }
}

interface ModelWeights {
  intercept: number
  meanWeight: number
  stdWeight: number
  slopeWeight: number
}

// Global model weights (initialized, can be updated online)
let weights: ModelWeights = {
  intercept: -3.5,
  meanWeight: 0.4,
  stdWeight: 1.1,
  slopeWeight: 0.8,
}

/**
 * Validates input is a valid number (no restrictions on range)
 */
export function validateInput(x: number): { valid: boolean; error?: string } {
  if (isNaN(x)) return { valid: false, error: "Please enter a valid number" }
  if (!isFinite(x)) return { valid: false, error: "Value must be finite" }
  return { valid: true }
}

/**
 * Calculate rolling mean from last N values
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

/**
 * Calculate rolling standard deviation from last N values
 */
function calculateStd(values: number[]): number {
  if (values.length === 0) return 0
  const mean = calculateMean(values)
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * Calculate slope (trend) from first to last value
 */
function calculateSlope(values: number[]): number {
  if (values.length < 2) return 0
  return values[values.length - 1] - values[0]
}

/**
 * Extract statistical features from sequence
 * Uses last 10 values for rolling window
 */
function extractFeatures(sequence: number[]): { mean: number; std: number; slope: number } {
  const window = sequence.slice(-10)
  
  if (window.length === 0) {
    return { mean: 0, std: 0, slope: 0 }
  }

  return {
    mean: calculateMean(window),
    std: calculateStd(window),
    slope: calculateSlope(window),
  }
}

/**
 * Sigmoid function for probability calculation
 */
function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

/**
 * Generate reason/explanation for prediction
 */
function generateReason(features: { mean: number; std: number; slope: number }, probability: number): string {
  const { mean, std, slope } = features
  const reasons: string[] = []

  // Mean-based reasoning
  if (mean > 6) {
    reasons.push("rolling mean approaching spike threshold")
  } else if (mean > 4) {
    reasons.push("elevated rolling mean")
  } else if (mean < 2) {
    reasons.push("low rolling mean suggests stability")
  }

  // Volatility-based reasoning
  if (std > 2) {
    reasons.push("high volatility detected")
  } else if (std > 1) {
    reasons.push("moderate volatility")
  } else if (std < 0.5) {
    reasons.push("stable pattern with low variance")
  }

  // Trend-based reasoning
  if (slope > 3) {
    reasons.push("strong upward trend")
  } else if (slope > 1) {
    reasons.push("gradual upward trend")
  } else if (slope < -3) {
    reasons.push("strong downward trend")
  } else if (slope < -1) {
    reasons.push("gradual downward trend")
  } else {
    reasons.push("stable trend")
  }

  // Combine reasoning
  if (reasons.length === 0) {
    return probability > 0.5 ? "pattern indicators suggest spike likely" : "no strong spike indicators detected"
  }

  return reasons.join(", ")
}

/**
 * Get certainty label based on confidence score
 */
function getCertaintyLabel(confidence: number): "High Certainty" | "Medium Certainty" | "Low Certainty" {
  if (confidence >= 80) return "High Certainty"
  if (confidence >= 60) return "Medium Certainty"
  return "Low Certainty"
}

/**
 * Main prediction function using logistic regression
 * Predicts probability that next value will exceed 7.0
 */
export function predictNext(sequence: number[]): SpikePrediction {
  // Need at least 2 values for meaningful prediction
  if (sequence.length < 2) {
    return {
      predictedSpike: false,
      probability: 0.5,
      confidence: 0,
      certaintyLabel: "Low Certainty",
      reason: "insufficient data for prediction",
      features: { mean: 0, std: 0, slope: 0 },
    }
  }

  // Extract features
  const features = extractFeatures(sequence)

  // Calculate logistic regression score
  const z =
    weights.intercept +
    weights.meanWeight * features.mean +
    weights.stdWeight * features.std +
    weights.slopeWeight * features.slope

  // Convert to probability using sigmoid
  const probability = sigmoid(z)

  // Determine if spike predicted (threshold = 0.5)
  const predictedSpike = probability > 0.5

  // Calculate confidence (distance from 0.5, scaled to 0-100)
  const confidence = Math.min(100, Math.abs(probability - 0.5) * 200)

  // Get certainty label
  const certaintyLabel = getCertaintyLabel(confidence)

  // Generate human-readable reason
  const reason = generateReason(features, probability)

  return {
    predictedSpike,
    probability: Number(probability.toFixed(4)),
    confidence: Number(confidence.toFixed(0)),
    certaintyLabel,
    reason,
    features,
  }
}

/**
 * Update model weights using online learning
 * Uses gradient descent with learning rate = 0.01
 *
 * @param actualSpike - Whether actual value exceeded 7.0
 * @param predicted - Predicted probability
 * @param features - Feature values used for prediction
 */
export function updateModel(
  actualSpike: boolean,
  predicted: number,
  features: { mean: number; std: number; slope: number }
): void {
  const actual = actualSpike ? 1 : 0
  const error = actual - predicted
  const learningRate = 0.01

  // Update weights using gradient descent
  weights.intercept += learningRate * error
  weights.meanWeight += learningRate * error * features.mean
  weights.stdWeight += learningRate * error * features.std
  weights.slopeWeight += learningRate * error * features.slope

  // Save updated weights to localStorage
  saveWeights()
}

/**
 * Save model weights to localStorage
 */
function saveWeights(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("modelWeights", JSON.stringify(weights))
  }
}

/**
 * Load model weights from localStorage
 */
export function loadWeights(): void {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("modelWeights")
    if (stored) {
      try {
        weights = JSON.parse(stored)
      } catch (e) {
        // Keep default weights if parsing fails
        console.warn("Failed to load model weights, using defaults")
      }
    }
  }
}

/**
 * Reset model weights to default values
 */
export function resetWeights(): void {
  weights = {
    intercept: -3.5,
    meanWeight: 0.4,
    stdWeight: 1.1,
    slopeWeight: 0.8,
  }
  saveWeights()
}

/**
 * Get current model weights (for debugging/inspection)
 */
export function getWeights(): ModelWeights {
  return { ...weights }
}

export const PredictionEngine = {
  validateInput,
  predictNext,
  updateModel,
  loadWeights,
  resetWeights,
  getWeights,
}
