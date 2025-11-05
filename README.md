# Number Range Predictor (1.00 - 5.00)

A client-side ML-powered application that predicts the next number category in a sequence using categorical analysis and transition probabilities. The model learns from range-based user feedback to improve accuracy over time.

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
  const unique = new Set(lags).size;
  const confidence = ((6 - unique) / 5 * 100).toFixed(0);
  return { label, confidence };
}
\`\`\`

### Range-Based Feedback System

After each prediction, user provides feedback by clicking one of three range buttons:

- **Low (1.00 – 2.50)** - Click if actual value fell in this range
- **Mid (2.51 – 3.75)** - Click if actual value fell in this range
- **High (3.76 – 5.00)** - Click if actual value fell in this range

**How it works:**
1. User clicks the range button corresponding to the actual value
2. System uses representative value for that range:
   - Low: 1.75
   - Mid: 3.10
   - High: 4.40
3. Representative value is appended to sequence (capped at 200)
4. Transition matrix updates automatically
5. Model retrains and generates new prediction instantly
6. Accuracy metrics update in real-time

**No manual input required** - just click the appropriate range button!

### Accuracy Tracking

- **Accuracy**: Tracks prediction correctness over last 20 range selections
- **Real-time Updates**: Metrics refresh immediately after each range button click
- **Formula**: (Correct predictions / Total predictions) × 100
- **Display**: Shown as percentage with progress bar in Statistics panel

### Data Persistence

All data is stored in localStorage with automatic capping at 200 entries:

\`\`\`typescript
// Stored in separate localStorage keys:
sequence: number[]              // Historical values (max 200)
rollingAccuracy: boolean[]      // Last 20 outcomes (true/false)
transitionMatrix: Record<string, number>  // Category transitions
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
- Displays predicted range (Low/Mid/High) with color coding
- Shows confidence percentage with progress bar
- Three range buttons for user feedback:
  - Low (1.00 – 2.50)
  - Mid (2.51 – 3.75)
  - High (3.76 – 5.00)
- Buttons highlight on click with smooth animations
- Instant model update on button click

#### `components/feedback-tracker.tsx`
- Displays accuracy percentage (based on last 20 predictions)
- Progress bar visualization with smooth animations
- Shows number of predictions tracked
- Current sequence length with max 200 cap indicator

#### `components/number-chart.tsx`
- Recharts line chart visualization
- Reference lines at 2.50 and 3.75 showing category boundaries
- Interactive tooltip on hover
- Y-axis scaled for 1.00-5.00 range

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
- Main prediction function using lag features
- Finds mode of recent 5 states
- Returns prediction object with label and confidence (no numeric estimate)

## Usage Workflow

### Step 1: Enter Sequence
\`\`\`
Input: "1.5 3.2 2.1 4.8"
Validation: ✓ All values in range 1.00-5.00
\`\`\`

### Step 2: View Prediction
\`\`\`
Predicted Range: Mid
Confidence: 82%
\`\`\`

### Step 3: Provide Feedback (One Click)
\`\`\`
Click the appropriate range button:
[ Low (1.00–2.50) ] [ Mid (2.51–3.75) ] [ High (3.76–5.00) ]

Example: Actual value was 3.50 → Click "Mid (2.51–3.75)"
- Representative value (3.10) added to sequence
- Model retrains instantly
- New prediction appears automatically
\`\`\`

### Step 4: Monitor Performance
\`\`\`
Accuracy: 73%
Based on last 20 predictions
Sequence Length: 22 numbers (max 200)
\`\`\`

### Step 5: View Visualization
\`\`\`
Line chart shows all numbers with category boundaries at 2.50 and 3.75
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

Lag Uniqueness: 2 unique states (Low, Mid)
Confidence: ((6-2)/5) × 100 = 80%

Prediction:
- Predicted Range: Low
- Confidence: 80%

User Feedback:
User clicks "Low (1.00–2.50)" button
→ Representative value 1.75 added to sequence
→ Transition matrix updated
→ New prediction generated automatically
\`\`\`

## Performance Characteristics

- Sequence capped at 200 entries for optimal performance
- Accuracy tracked over last 20 predictions
- Range-based feedback eliminates input errors
- Confidence typically ranges 40-100% based on pattern strength
- Instant model retraining on each feedback click
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
2. View the prediction with range category and confidence
3. Click the range button that matches where the actual value fell
4. Model automatically learns and generates next prediction instantly
5. Monitor accuracy improving over time

## localStorage Structure

Data saved to separate localStorage keys:

\`\`\`typescript
localStorage.setItem('sequence', JSON.stringify(number[]))
localStorage.setItem('rollingAccuracy', JSON.stringify(boolean[]))
localStorage.setItem('transitionMatrix', JSON.stringify(Record<string, number>))
\`\`\`

## Reset

Click "Reset All Data" to clear all stored information and start fresh. This action clears:
- Entire sequence history
- Accuracy counters
- Rolling accuracy data
- Transition matrix
- All predictions and feedback

## Latest Updates (November 2025)

### Major Changes
- **Feedback System**: Replaced manual input with range-based buttons
- **No Text Input**: Removed "Correct/Wrong" buttons and actual value input field
- **One-Click Feedback**: Click Low/Mid/High range button corresponding to actual value
- **Instant Updates**: Model retrains automatically on each button click
- **Representative Values**: Low=1.75, Mid=3.10, High=4.40 used for learning
- **Simplified Display**: Shows only Predicted Range and Confidence (no numeric estimate)
- **Streamlined UI**: Clean 3-color design with horizontal range buttons
- **Accuracy Only**: Single accuracy metric based on last 20 predictions

### Technical Details
- **Input Range**: 1.00 - 5.00 ONLY
- **Categorization**: Three ranges (Low, Mid, High)
- **Boundaries**: 2.50 and 3.75 thresholds
- **Category Midpoints**: 1.75 (Low), 3.10 (Mid), 4.40 (High)
- **Confidence**: ((6 - unique) / 5) × 100 formula
- **Sequence Cap**: 200 entries maximum for performance
- **Storage**: Separate localStorage keys for sequence, accuracy, and transition matrix
