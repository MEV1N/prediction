/**
 * Advanced Predictor: Next Value > 7
 * 
 * A self-contained TypeScript module using a 1-hidden-layer neural network
 * with temporal weighting and nonlinear feature extraction to predict whether
 * the next number will exceed 7.
 */

// ============================================================================
// Model Parameters (Mutable for Online Learning)
// ============================================================================

let W1 = [0.2, 0.5, 0.8, -0.4, 0.6, 0.3, -0.2, 0.5]; // Hidden layer weights
let b1 = 0.1;                                          // Hidden layer bias
let W2 = 2.4;                                          // Output weight
let b2 = -3.0;                                         // Output bias

const LEARNING_RATE = 0.01;
const DECAY_FACTOR = 0.85;
const DECISION_THRESHOLD = 0.55;

// ============================================================================
// Core Prediction Function
// ============================================================================

export interface PredictionResult {
  willExceed7: boolean;
  probability: number;
  confidence: number;
  reasoning: string;
  features?: number[];      // For online learning
  hiddenActivation?: number; // For online learning
}

/**
 * Predicts whether the next value will be greater than 7.
 * Uses the last 10 values with temporal weighting and nonlinear features.
 */
export function predictNextAbove7(sequence: number[]): PredictionResult {
  if (sequence.length === 0) {
    return {
      willExceed7: false,
      probability: 0.5,
      confidence: 0,
      reasoning: "No data available for prediction."
    };
  }

  // Step 1: Extract last N=10 values (or all if fewer)
  const N = Math.min(sequence.length, 10);
  const recent = sequence.slice(-N);

  // Step 2: Temporal weighting - recent samples more important
  const weights = recent.map((_, i) => Math.pow(DECAY_FACTOR, N - i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Step 3: Weighted mean
  const weightedSum = recent.reduce((acc, val, i) => acc + val * weights[i], 0);
  const mean = weightedSum / totalWeight;

  // Step 4: Weighted standard deviation
  const variance = recent.reduce((acc, val, i) => 
    acc + weights[i] * Math.pow(val - mean, 2), 0) / totalWeight;
  const std = Math.sqrt(variance) || 0;

  // Step 5: Linear trend (slope)
  const trend = recent[N - 1] - recent[0];

  // Step 6: Last value and log transform
  const last = recent[N - 1];
  const logLast = Math.log(Math.abs(last) + 1) * Math.sign(last || 1);

  // Step 7: Nonlinear features
  const meanStd = mean * std;
  const trendSq = trend * trend;

  // Feature vector: [bias, μ, σ, slope, last, log(last), μ×σ, slope²]
  const F = [1, mean, std, trend, last, logLast, meanStd, trendSq];

  // Step 8: Forward pass through neural network
  // Hidden layer: h = tanh(W1 · F + b1)
  const hiddenInput = F.reduce((sum, feature, i) => sum + feature * W1[i], b1);
  const hidden = tanh(hiddenInput);

  // Output layer: z = W2 · h + b2
  const z = W2 * hidden + b2;
  
  // Probability: P = sigmoid(z)
  const probability = sigmoid(z);

  // Step 9: Decision with 0.55 threshold
  const willExceed7 = probability > DECISION_THRESHOLD;
  
  // Confidence: |P - 0.5| × 200
  const confidence = Math.abs(probability - 0.5) * 200;

  // Generate reasoning
  const reasoning = generateReasoning(mean, std, trend, last, probability);

  return { 
    willExceed7, 
    probability, 
    confidence, 
    reasoning,
    features: F,
    hiddenActivation: hidden
  };
}

// ============================================================================
// Activation Functions
// ============================================================================

/**
 * Hyperbolic tangent activation
 * tanh(x) = (e^x - e^-x) / (e^x + e^-x)
 */
function tanh(x: number): number {
  if (x > 20) return 1;   // Numerical stability
  if (x < -20) return -1;
  const expPos = Math.exp(x);
  const expNeg = Math.exp(-x);
  return (expPos - expNeg) / (expPos + expNeg);
}

/**
 * Sigmoid activation function
 * σ(x) = 1 / (1 + e^-x)
 */
function sigmoid(x: number): number {
  if (x > 20) return 1;   // Numerical stability
  if (x < -20) return 0;
  return 1 / (1 + Math.exp(-x));
}

/**
 * Generate human-readable reasoning for the prediction
 */
function generateReasoning(
  mean: number,
  std: number,
  trend: number,
  last: number,
  probability: number
): string {
  const factors: string[] = [];

  if (last > 7) factors.push(`Last value (${last.toFixed(1)}) already exceeds 7`);
  if (mean > 7) factors.push(`Mean (${mean.toFixed(1)}) is above 7`);
  if (trend > 2) factors.push(`Strong upward trend (+${trend.toFixed(1)})`);
  if (std > 3) factors.push(`High volatility (σ=${std.toFixed(1)})`);

  if (factors.length === 0) {
    return probability > 0.5
      ? "Model suggests next value will exceed 7 based on pattern analysis."
      : "Current pattern suggests next value will remain at or below 7.";
  }

  return factors.join(". ") + ".";
}

// ============================================================================
// Online Learning (Adaptive Update)
// ============================================================================

/**
 * Update model parameters using gradient descent after receiving feedback.
 * 
 * When actual value x_t+1 arrives:
 * - y = 1 if x_t+1 > 7, else 0
 * - error = y - P
 * - W1 ← W1 + η × error × F
 * - b1 ← b1 + η × error
 * - W2 ← W2 + η × error × h
 * - b2 ← b2 + η × error
 */
export function updateModel(
  actualValue: number,
  predictionResult: PredictionResult
): void {
  // Binary target: 1 if actualValue > 7, else 0
  const y = actualValue > 7 ? 1 : 0;
  
  // Prediction error
  const error = y - predictionResult.probability;
  
  if (!predictionResult.features || predictionResult.hiddenActivation === undefined) {
    console.warn("Cannot update model: features or hidden activation missing");
    return;
  }

  const F = predictionResult.features;
  const h = predictionResult.hiddenActivation;

  // Update hidden layer weights and bias
  W1 = W1.map((w, i) => w + LEARNING_RATE * error * F[i]);
  b1 = b1 + LEARNING_RATE * error;

  // Update output layer weights and bias
  W2 = W2 + LEARNING_RATE * error * h;
  b2 = b2 + LEARNING_RATE * error;
}

/**
 * Reset model parameters to initial tuned values
 */
export function resetModel(): void {
  W1 = [0.2, 0.5, 0.8, -0.4, 0.6, 0.3, -0.2, 0.5];
  b1 = 0.1;
  W2 = 2.4;
  b2 = -3.0;
}

/**
 * Export current model parameters (for persistence)
 */
export function getModelParameters(): {
  W1: number[];
  b1: number;
  W2: number;
  b2: number;
} {
  return { W1: [...W1], b1, W2, b2 };
}

/**
 * Import model parameters (from localStorage)
 */
export function setModelParameters(params: {
  W1: number[];
  b1: number;
  W2: number;
  b2: number;
}): void {
  W1 = [...params.W1];
  b1 = params.b1;
  W2 = params.W2;
  b2 = params.b2;
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return "High Certainty";
  if (confidence >= 60) return "Medium Certainty";
  return "Low Certainty";
}
