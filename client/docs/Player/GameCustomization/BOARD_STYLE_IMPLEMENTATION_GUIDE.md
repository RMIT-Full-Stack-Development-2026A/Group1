# GameBoard Implementation Guide

## Using Customization Store in GameBoard

The GameBoard component should render the game using the customization options saved in the CustomizationStore.

### Basic Setup

```jsx
import { useCustomizationStore } from "@/stores/CustomizationStore";
import { renderXMarker, renderOMarker } from "@/utils/markerRenderer";

export default function GameBoard() {
    const { boardSize, gridStyle, markerVariant } = useCustomizationStore();
    
    // Now you have access to all customization options!
}
```

### Using Board Size

```jsx
const { boardSize } = useCustomizationStore();

// Parse board size: "10x10" or "15x15"
const [rows, cols] = boardSize.split('x').map(Number); // [10, 10] or [15, 15]

// Create grid
const cells = Array.from({ length: rows * cols }, (_, i) => i);
```

### Using Grid Style

```jsx
const { gridStyle } = useCustomizationStore();

// Apply different styles based on gridStyle value
const gridStyleClasses = {
    classic: "bg-gray-800",
    neon: "bg-[#0d0d1a]", // Dark background with neon grid
    block: "bg-gray-900"
};

// Apply to container
<div className={gridStyleClasses[gridStyle]}>
```

### Using Marker Variants

```jsx
import { renderXMarker, renderOMarker } from "@/utils/markerRenderer";

const { markerVariant } = useCustomizationStore();

// In your game cell component
<div className="flex items-center justify-center">
    {cellValue === 'X' && renderXMarker(markerVariant)}
    {cellValue === 'O' && renderOMarker(markerVariant)}
</div>
```

### Example GameBoard Cell Component

```jsx
function GameBoardCell({ cellValue, onCellClick }) {
    const { markerVariant } = useCustomizationStore();
    
    return (
        <button
            onClick={onCellClick}
            className="w-12 h-12 border border-[#4cc9f0] flex items-center justify-center hover:bg-[#1a1a2e] transition"
        >
            {cellValue === 'X' && renderXMarker(markerVariant, "text-xl")}
            {cellValue === 'O' && renderOMarker(markerVariant, "text-xl")}
        </button>
    );
}
```

### Complete Example

```jsx
import React from "react";
import { useCustomizationStore } from "@/stores/CustomizationStore";
import { renderXMarker, renderOMarker } from "@/utils/markerRenderer";

export default function GameBoard() {
    const { boardSize, gridStyle, markerVariant } = useCustomizationStore();
    const [gameState, setGameState] = React.useState({});
    
    const [rows, cols] = boardSize.split('x').map(Number);
    
    const gridStyleClasses = {
        classic: "bg-gray-800 border-2 border-yellow-400",
        neon: "bg-[#0d0d1a] border-2 border-[#4cc9f0]",
        block: "bg-gray-900 border-4 border-gray-600"
    };
    
    const handleCellClick = (index) => {
        // Game logic here
    };
    
    return (
        <div className={`p-4 ${gridStyleClasses[gridStyle]}`}>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({ length: rows * cols }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleCellClick(index)}
                        className="w-12 h-12 border border-[#4cc9f0] flex items-center justify-center hover:bg-[#1a1a2e] transition"
                    >
                        {gameState[index] === 'X' && renderXMarker(markerVariant, "text-xl")}
                        {gameState[index] === 'O' && renderOMarker(markerVariant, "text-xl")}
                    </button>
                ))}
            </div>
        </div>
    );
}
```

## Available Marker Variants

The markerVariant ID corresponds to these options:

1. **Classic Blue/Orange** (ID: 1)
   - X: `text-blue-400`
   - O: `text-orange-400`

2. **Pink/Green** (ID: 2)
   - X: `text-pink-400`
   - O: `text-green-400`

3. **White (Skewed)** (ID: 3) - Default
   - X: `text-white skew-x-6`
   - O: `text-white -skew-x-6`

4. **Purple/Cyan** (ID: 4)
   - X: `text-purple-400`
   - O: `text-cyan-400`

5. **Yellow/Red** (ID: 5)
   - X: `text-yellow-400`
   - O: `text-red-400`

6. **Symbol variant** (ID: 6)
   - X: Cyan square
   - O: Cyan hollow square

## Grid Styles

- **classic**: Traditional board with yellow border
- **neon**: Sci-fi aesthetic with cyan borders and dark background
- **block**: Bold block style with thick gray borders

## Board Sizes

- **10x10**: Standard tic-tac-toe (10x10 grid)
- **15x15**: Extended tic-tac-toe (15x15 grid)
