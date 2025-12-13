---
inclusion: fileMatch
fileMatchPattern: "src/components/**/*.tsx"
---

# Component Guidelines

## Performance
- Always wrap components with `memo()` if they receive props that don't change often
- Use `useMemo` for expensive calculations (moon phase paths, data transformations)
- Avoid inline object/array creation in JSX props
- Keep animation durations reasonable (200-400ms for UI, longer for ambient effects)

## Styling
- Use Tailwind CSS classes
- Use CSS variables from `index.css` for theming
- Glass card effect: `glass-card` class
- Hover effects: `hover-lift` class

## Animation Patterns
- Use Framer Motion for complex animations
- Use `AnimatePresence` for enter/exit animations
- Keep ambient animations subtle (stars, glow effects)
- Use `transition` prop for smooth state changes

## Component Structure
```tsx
import { memo } from "react";
import { motion } from "framer-motion";

interface Props {
  // Define props with TypeScript
}

export const ComponentName = memo(({ prop1, prop2 }: Props) => {
  // Component logic
  return (
    // JSX
  );
});

ComponentName.displayName = "ComponentName";
```
