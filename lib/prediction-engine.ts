/**
 * Prediction Engine - Categorization and Prediction (1.00 - 5.00 Range)
 *
 * Implements categorical ML algorithm with weighted mean prediction.
 * Uses 1.00 - 5.00 input range with categories:
 * - Low (≤2.5), Mid (2.5-3.75), High (>3.75)
 *
 * Weighted mean uses exponential decay (0.8 factor) for recent values.
 */

interface Prediction {
  label: "Low" | "Mid" | "High"
  confidence: number | string
}

/**
 * Updated categorization to 1-5 range only
 * Low: ≤ 2.5, Mid: 2.5-3.75, High: > 3.75
 */
export function categorize(x: number): number {
  if (x < 1 || x > 5) throw new Error("Value out of range (1–5)")
  if (x <= 2.5) return 0 // Low
  if (x <= 3.75) return 1 // Mid
  return 2 // High
}

/**
 * Validates input is ONLY within 1.00 - 5.00 range (NOT 1-15)
 */
export function validateInput(x: number): { valid: boolean; error?: string } {
  if (isNaN(x)) return { valid: false, error: "Please enter a valid number" }
  if (x < 1) return { valid: false, error: "Value must be between 1.00 and 5.00" }
  if (x > 5) return { valid: false, error: "Value must be between 1.00 and 5.00" }
  return { valid: true }
}

/**
 * Gets the category label from numeric category
 */
function getCategoryLabel(category: number): "Low" | "Mid" | "High" {
  const labels = ["Low", "Mid", "High"] as const
  return labels[Math.max(0, Math.min(2, category))]
}

/**
 * Updated category midpoints for 1-5 range:
 * Low: 1.75, Mid: 3.10, High: 4.40
 */
function getCategoryMidpoint(category: number): number {
  const midpoints = [1.75, 3.1, 4.4]
  return midpoints[Math.max(0, Math.min(2, category))]
}

/**
 * Weighted mean prediction using exponential decay (0.8^(n-i) formula)
 * Recent values get higher weights
 */
function weightedMean(sequence: number[], mode: number): number {
  const sameCat = sequence.slice(-10).filter((x) => categorize(x) === mode)

  if (sameCat.length === 0) {
    return getCategoryMidpoint(mode)
  }

  const weights = sameCat.map((_, i) => Math.pow(0.8, sameCat.length - i))
  const mean = sameCat.reduce((sum, x, i) => sum + x * weights[i], 0) / weights.reduce((a, b) => a + b, 0)

  return Number.parseFloat(mean.toFixed(2))
}

/**
 * Confidence calculation based on unique lag states
 * Formula: ((6 - unique) / 5) * 100
 */
function calculateConfidence(lags: number[]): string {
  const unique = new Set(lags).size
  const confidence = (((6 - unique) / 5) * 100).toFixed(0)
  return confidence
}

/**
 * Build transition matrix from sequence
 */
export function buildTransitionMatrix(sequence: number[]): Record<string, number> {
  const matrix: Record<string, number> = {}

  for (let i = 0; i < sequence.length - 1; i++) {
    const from = categorize(sequence[i])
    const to = categorize(sequence[i + 1])
    const key = `${from}->${to}`
    matrix[key] = (matrix[key] || 0) + 1
  }

  return matrix
}

/**
 * Main prediction function using lag features
 * Gets mode from last 5 states to predict category
 */
export function predictNext(sequence: number[]): Prediction {
  const states = sequence.map(categorize)
  const lags = states.slice(-5)

  const mode = lags.sort((a, b) => lags.filter((v) => v === a).length - lags.filter((v) => v === b).length).pop() ?? 0

  const label = getCategoryLabel(mode)
  const confidence = calculateConfidence(lags)

  return { label, confidence }
}

export const PredictionEngine = {
  categorize,
  validateInput,
  buildTransitionMatrix,
  predictNext,
}
