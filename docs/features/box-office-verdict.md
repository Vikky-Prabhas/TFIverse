# Box Office Verdict Engine

## Philosophy
Arbitrary UI logic must never dictate a movie's commercial outcome. A film's verdict (Hit, Flop, Blockbuster) in TFiverse is calculated by a strictly deterministic mathematical engine based on vetted financial inputs.

If the necessary financial inputs (Budget, Pre-Release Business, Break-Even) are unavailable, the engine outputs `UNKNOWN`. It does not guess.

## 1. Required Inputs
To calculate a verdict, the `movies` table (or its financial extension) requires the following fields:

- `pre_release_business` (PRB): Total amount paid by distributors to acquire theatrical rights.
- `break_even_target`: Generally `PRB + P&A (Prints & Advertising)`. Often slightly higher than PRB.
- `worldwide_theatrical_share`: The actual share (money returned to distributors) calculated from the Gross collections.
  - *Note: Gross is total ticket sales. Share is usually 50-60% of Gross in Telugu states, and roughly 40% Overseas.*

## 2. The Deterministic Formula
The core metric is the **Recovery Percentage (ROI)**:
`Recovery % = (Worldwide Theatrical Share / Break-Even Target) * 100`

### The Verdict Tiers

| Recovery % | Verdict Output | UI Treatment (Emoji/Color) |
|------------|----------------|----------------------------|
| < 50% | **Disaster** | 💀 Deep Red |
| 50% - 79% | **Flop** | 📉 Red |
| 80% - 99% | **Below Average / Average** | 😐 Gray / Zinc |
| 100% - 119% | **Hit** | 🎯 Emerald Green |
| 120% - 149% | **Super Hit** | 🚀 Blue / Cyan |
| 150% - 199% | **Blockbuster** | 🔥 Amber / Orange |
| >= 200% | **All-Time Blockbuster** | 👑 Gold / Purple |
| *Missing Data* | **UNKNOWN** | --- Gray |

## 3. UI Implementation Rule (The Speedometer)
The visual "Verdict Speedometer" gauge on `/box-office/track/[id]` directly maps the `Recovery %` to the dial.
- **0%** is the far left.
- **100%** is dead center (Break-even).
- **200%** is the far right limit.

If `Recovery %` cannot be calculated because `Break-Even Target` is null or `0`, the gauge component must gracefully fallback to a standard Gross Collection display, hiding the Verdict UI entirely, rather than showing a broken 0% "Disaster".
