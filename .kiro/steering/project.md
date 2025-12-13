# Celestial Data Viz - Project Guidelines

## Project Overview
This is a React + TypeScript dashboard that visualizes the correlation between lunar phases and stock market data. It combines real-time stock data from Alpha Vantage API with accurate astronomical moon phase calculations.

## Tech Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- Recharts for data visualization
- shadcn/ui components

## Key Features
- Real-time stock data from Alpha Vantage API
- Accurate moon phase calculations based on astronomical algorithms
- AI-powered insights using Mistral AI
- Interactive moon carousel with swipe/keyboard navigation
- Responsive design with mobile support

## Code Standards
- Use functional components with hooks
- Memoize components with `memo()` for performance
- Use `useMemo` and `useCallback` for expensive computations
- Keep animations smooth (60fps target)
- Follow accessibility best practices

## File Structure
- `/src/components/` - React components
- `/src/lib/` - Utility functions and API integrations
- `/src/hooks/` - Custom React hooks
- `/src/pages/` - Page components

## API Keys (stored in code for demo purposes)
- Alpha Vantage: Stock market data
- Mistral AI: AI-powered insights
