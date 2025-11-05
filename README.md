# Number Range Predictor (1.00 - 5.00)

A client-side ML-powered application that predicts the next number in a sequence using categorical analysis and weighted-mean forecasting. The model learns from user feedback to improve accuracy over time.

## Features

### Valid Input Range: 1.00 - 5.00 Only

**CRITICAL**: Only numbers between 1.00 and 5.00 are accepted. Any value outside this range will be rejected with a clear error message:
- **Below 1.00**: "Value must be between 1.00 and 5.00"
- **Above 5.00**: "Value must be between 1.00 and 5.00"

### Categorization System

Numbers are classified into three categories based on precise boundaries:

- **Low**: ≤ 2.5
- **Mid**: 2.5 - 3.75
- **High**: > 3.75

### Prediction Algorithm

The prediction engine uses several key techniques:

#### 1. Categorize Function
\`\`\`javascript
function categorize(x) {
  if (x < 1 || x > 5) throw new Error("Value out of range (1–5)");
  if (x <= 2.5) return 0; // Low
  if (x <= 3.75) return 1; // Mid
  return 2; // High
}
\`\`\`

#### 2. Weighted Mean Forecasting
- Filters recent numbers (last 10) in the predicted category
- Applies exponential decay weighting: `0.8^(n-i)`
- More recent values receive higher weights
- Falls back to category midpoint if no prior data
- Calculated with formula:
\`\`\`
mean = sum(x[i] * weight[i]) / sum(weight[i])
where weight[i] = 0.8^(n-i)
\`\`\`

#### 3. Category Midpoints
When no prior data exists in a category, uses default midpoints:
- Low: 1.75
- Mid: 3.10
- High: 4.40

#### 4. Confidence Calculation
- Examines last 5 states (lag features)
- Formula: `((6 - unique_states) / 5) * 100`
- Fewer unique states indicate stronger pattern = higher confidence (0-100%)

#### 5. Transition Matrix
- Tracks state-to-state transitions (e.g., Low→Mid)
- Updated after each feedback submission
- Used for pattern recognition

### Prediction Function
\`\`\`javascript
function predictNext(sequence) {
  const states = sequence.map(categorize);
  const lags = states.slice(-5);
  const mode = lags.sort(
    (a, b) => lags.filter(v => v === a).length - lags.filter(v => v === b).length
  ).pop();
  const label = ["Low", "Mid", "High"][mode];
  const roughValue = weightedMean(sequence, mode);
  const unique = new Set(lags).size;
  const confidence = ((6 - unique) / 5 * 100).toFixed(0);
  return { label, roughValue, confidence };
}
\`\`\`

### Two-Step Feedback System

After each prediction, the feedback flow is:

1. **Step 1: Correctness** - User selects "✓ Correct" or "✗ Wrong"
2. **Step 2: Actual Value** - User enters the true number (1.00 - 5.00 range)
   - Validation: Value must be within 1.00 - 5.00
   - Error display: Inline red error if out of range
   - Both paths add the actual value to the dataset

Model automatically retrains and generates the next prediction immediately after submission.

### Rolling Accuracy Tracking

- **Overall Accuracy**: Tracks all predictions ever made
- **Rolling Accuracy**: Tracks accuracy over last 20 predictions separately
- **Real-time Updates**: Metrics refresh immediately after each feedback submission
- **Formula**: (Correct predictions / Total predictions) × 100

### Data Persistence

All data is stored in localStorage with automatic capping at 200 entries:

\`\`\`typescript
interface StoredData {
  sequence: number[]              // Historical values (max 200)
  correctCount: number            // Total correct predictions
  totalCount: number              // Total feedback submissions
  rollingAccuracy: boolean[]      // Last 20 outcomes (true/false)
  transitionMatrix: Record<string, number>  // Category transitions
}
\`\`\`

## Architecture

### Components

#### `app/page.tsx` (Main Page)
- Central orchestrator managing sequence, predictions, and accuracy
- Validates all inputs (1.00-5.00 range only)
- Handles two-step feedback flow
- Responsive grid layout with error display
- localStorage persistence on every state change

#### `components/prediction-form.tsx`
- Input form for numeric sequences
- Supports comma or space-separated values
- Clear placeholder and validation hints
- Instructions: "Enter numbers between 1.00 and 5.00"

#### `components/prediction-result.tsx`
- Two-step feedback UI: first correctness selection, then actual value input
- Shows predicted category with color coding (Blue/Amber/Red)
- Displays rough numerical value and confidence percentage
- Confidence progress bar visualization
- Inline validation for actual value (1.00-5.00)
- Error message display with validation rules

#### `components/feedback-tracker.tsx`
- Displays overall accuracy meter
- Shows rolling accuracy (last 20 predictions)
- Statistics display (predictions made, correct/wrong counts)
- Current sequence length with max 200 cap indicator

#### `components/number-chart.tsx`
- Recharts line chart visualization
- Reference lines at 2.5 and 3.75 showing category boundaries
- Interactive tooltip on hover
- Includes predicted point when available

### Prediction Engine (`lib/prediction-engine.ts`)

#### Key Functions

**`categorize(x: number)`**
- Validates input is 1-5 range
- Converts number to category (0=Low, 1=Mid, 2=High)
- Throws error if out of range

**`validateInput(x: number)`**
- Checks if value is within 1.00-5.00 range
- Returns validation result with specific error message
- Handles NaN values

**`weightedMean(sequence, mode)`**
- Filters numbers in target category (last 10)
- Applies exponential decay: `0.8^(n-i)`
- Returns weighted mean or category midpoint if no data

**`calculateConfidence(lags)`**
- Analyzes lag uniqueness from last 5 states
- Returns confidence 0-100 based on pattern strength

**`buildTransitionMatrix(sequence)`**
- Creates state-to-state transition counts
- Updated with each feedback submission

**`predictNext(sequence)`**
- Main prediction function using weighted mean approach
- Finds mode of recent 5 states
- Applies weighted mean to that category
- Returns prediction object with label, roughValue, and confidence

## Usage Workflow

### Step 1: Enter Sequence
\`\`\`
Input: "1.5 3.2 2.1 4.8"
Validation: ✓ All values in range 1.00-5.00
\`\`\`

### Step 2: View Prediction
\`\`\`
Category: Mid
Rough Value: 3.42
Confidence: 78%
Explanation: Recent Mid values weighted → 3.42
\`\`\`

### Step 3: Provide Feedback (Two Steps)
\`\`\`
Step 1: Select "✓ Correct" or "✗ Wrong"
Step 2: Enter actual value (e.g., 3.50)
Validation: ✓ Value accepted
Error (if out of range): "Value must be between 1.00 and 5.00"
\`\`\`

### Step 4: Monitor Performance
\`\`\`
Overall Accuracy: 68% (15/22 correct)
Rolling Accuracy: 75% (15/20 in last 20)
Sequence Length: 22 numbers (max 200)
\`\`\`

### Step 5: View Visualization
\`\`\`
Line chart shows all numbers with category boundaries at 2.5 and 3.75
Predicted point appears on chart automatically
\`\`\`

## Input Validation Rules

- **Below 1.00**: Rejected - "Value must be between 1.00 and 5.00"
- **Above 5.00**: Rejected - "Value must be between 1.00 and 5.00"
- **Invalid Format**: Parsed from comma or space-separated input
- **NaN Values**: Ignored and filtered out
- **Inline Display**: Error messages appear immediately
- **Prevention**: Invalid data never enters dataset

## Algorithm Example

\`\`\`
Sequence: [1.5, 2.3, 1.8, 3.5, 2.1]
Categorize: [Low, Low, Low, Mid, Low]
Last 5 States: [Low, Low, Low, Mid, Low]
Mode: Low (4 occurrences)

Weighted Mean Calculation:
Same Category (Low): [1.5, 2.3, 1.8, 2.1]
Weights: [0.512, 0.64, 0.8, 1.0]  (exponential decay)
Weighted Sum: 1.5×0.512 + 2.3×0.64 + 1.8×0.8 + 2.1×1.0 = 5.464
Weight Sum: 0.512 + 0.64 + 0.8 + 1.0 = 2.952
Weighted Mean: 5.464 / 2.952 = 1.85

Lag Uniqueness: 2 unique states (Low, Mid)
Confidence: ((6-2)/5) × 100 = 80%

Prediction:
- Category: Low
- Rough Value: 1.85
- Confidence: 80%
\`\`\`

## Performance Characteristics

- Sequence capped at 200 entries for optimal performance
- Rolling accuracy tracked over last 20 predictions
- Overall accuracy never capped (all-time metric)
- Weighted mean provides realistic numeric forecasts
- Confidence typically ranges 40-100% based on pattern strength
- Input validation prevents invalid data from affecting model

## Technology Stack

- **Frontend**: React 19 + Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Storage**: Browser localStorage API
- **Language**: TypeScript for type safety
- **Validation**: Client-side input validation (1-5 range)

## Getting Started

1. Enter a sequence of numbers (1.00-5.00 range only)
2. View the prediction with category and confidence
3. Mark correctness and enter actual value (1.00-5.00)
4. Model automatically learns and generates next prediction
5. Monitor accuracy improving over time

## localStorage Structure

All data saved to key `'predictionData'`:

\`\`\`typescript
{
  sequence: number[],
  correctCount: number,
  totalCount: number,
  rollingAccuracy: boolean[],
  transitionMatrix: Record<string, number>
}
\`\`\`

## Reset

Click "Reset All Data" to clear all stored information and start fresh. This action clears:
- Entire sequence history
- Accuracy counters
- Rolling accuracy data
- Transition matrix
- All predictions and feedback

## Latest Updates

- **Input Range**: Restricted to 1.00 - 5.00 ONLY (was 1-15)
- **Categorization**: Three categories (Low, Mid, High)
- **Boundaries**: 2.5 and 3.75 thresholds
- **Weighted Mean**: Exponential decay formula (0.8^(n-i))
- **Category Midpoints**: 1.75 (Low), 3.10 (Mid), 4.40 (High)
- **Feedback**: Two-step flow with actual value input
- **Validation**: Strict range checking with inline error messages
- **Confidence**: ((6 - unique) / 5) × 100 formula
- **Sequence Cap**: 200 entries maximum for performance
