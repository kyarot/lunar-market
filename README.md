<p align="center">
  <img src="public/moon-favicon.svg" alt="Lunar Markets Logo" width="120" height="120">
</p>

<h1 align="center">🌙 Lunar Markets</h1>

<p align="center">
  <strong>Where Celestial Cycles Meet Market Rhythms</strong>
</p>

<p align="center">
  An innovative AI-powered financial visualization platform that explores the mystical correlation between lunar phases and stock market behavior. Built with cutting-edge web technologies and powered by Mistral AI.
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-ai-capabilities">AI Capabilities</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Mistral_AI-Powered-FF6B6B?style=for-the-badge" alt="Mistral AI">
</p>

---

## 🎯 The Vision

**Lunar Markets** bridges the gap between ancient celestial wisdom and modern financial analysis. For centuries, traders and investors have speculated about the moon's influence on market behavior. Our platform brings this fascinating concept to life through:

- **Real-time lunar phase calculations** with astronomical precision
- **Live stock market data** integration
- **AI-powered pattern recognition** that identifies correlations
- **Immersive visual experience** that makes data exploration engaging

> "The moon affects tides, human behavior, and perhaps... market sentiment. Lunar Markets lets you explore this cosmic connection."

---

## ✨ Features

### 🌕 Interactive Moon Visualization
- **Realistic 3D Moon Rendering** - Accurate phase representation with crater details and dynamic lighting
- **Moon Carousel** - Navigate through 60 days of lunar history with smooth animations
- **Supermoon & Micromoon Detection** - Automatic identification of special lunar events
- **Zodiac Tracking** - Real-time moon position in the zodiac

### 📊 Financial Data Integration
- **Real-time Stock Data** - Integration with Alpha Vantage API for live market prices
- **Multiple Stock Support** - Track SPY, AAPL, GOOGL, MSFT, AMZN, TSLA, and more
- **Historical Analysis** - 60-day price history with volume data
- **Performance Metrics** - Period high/low, volatility calculations, and trend analysis

### 🤖 AI-Powered Intelligence (Mistral AI)

#### 1. Luna AI Chat Assistant
An intelligent conversational interface that answers questions about:
- Lunar cycle meanings and their historical market correlations
- Investment timing based on celestial events
- Zodiac influences on market sentiment
- Personalized insights based on current conditions

#### 2. Predictive Insights
AI-generated 3-day market predictions featuring:
- Directional forecasts (Bullish/Bearish/Neutral)
- Confidence scores with visual indicators
- Reasoning explanations connecting lunar patterns to predictions

#### 3. Daily Financial Horoscope
Mystical yet data-informed daily guidance including:
- Lucky trading hours
- Risk level assessment
- Action recommendations
- Cosmic alignment descriptions
- Lucky numbers

#### 4. Pattern Recognition Dashboard
Advanced AI analysis that identifies:
- Lunar-market correlations with confidence scores
- Historical pattern visualization with mini line charts
- Full moon rally patterns
- New moon dip tendencies
- Waxing/waning momentum indicators

### 🎨 Immersive User Experience
- **Animated Starfield Background** - Dynamic particle system creating cosmic atmosphere
- **Glass Morphism Design** - Modern translucent UI components
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Dark Theme** - Eye-friendly design for extended viewing

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn** or **bun**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kyarot/lunar-market.git
   cd lunar-market/celestial-data-viz
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build locally
```

---

## 🛠 Tech Stack

### Frontend Framework
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Library | 18.3.1 |
| **TypeScript** | Type Safety | 5.6.2 |
| **Vite** | Build Tool | 5.4.19 |

### Styling & UI
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **Lucide React** | Icon library |
| **shadcn/ui** | UI component library |

### AI & Data
| Technology | Purpose |
|------------|---------|
| **Mistral AI** | Large Language Model for insights |
| **Alpha Vantage API** | Real-time stock market data |
| **Custom Algorithms** | Lunar phase calculations |

### Development Tools
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |
| **Autoprefixer** | CSS vendor prefixing |

---

## 🏗 Architecture

```
celestial-data-viz/
├── src/
│   ├── components/
│   │   ├── AIChatAssistant.tsx      # Luna AI conversational interface
│   │   ├── Dashboard.tsx             # Main dashboard layout
│   │   ├── FinancialHoroscope.tsx   # Daily horoscope component
│   │   ├── HeroMoon.tsx             # 3D moon visualization
│   │   ├── ImmersiveDashboard.tsx   # Primary dashboard with all features
│   │   ├── InsightPanel.tsx         # AI insight display
│   │   ├── MiniChart.tsx            # Price trend visualization
│   │   ├── MoonCarousel.tsx         # Lunar phase navigation
│   │   ├── MoonPhase.tsx            # Moon phase renderer
│   │   ├── PatternRecognition.tsx   # AI pattern analysis with charts
│   │   ├── PredictiveInsights.tsx   # AI predictions component
│   │   ├── ScrollHint.tsx           # Navigation hint
│   │   ├── StarField.tsx            # Animated background
│   │   └── ui/                      # shadcn/ui components
│   ├── hooks/
│   │   ├── use-mobile.tsx           # Mobile detection hook
│   │   └── use-toast.ts             # Toast notification hook
│   ├── lib/
│   │   ├── alphaVantage.ts          # Stock API integration
│   │   ├── mistralAI.ts             # AI service layer
│   │   ├── moonPhases.ts            # Lunar calculations
│   │   └── utils.ts                 # Utility functions
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── public/
│   ├── moon-favicon.svg             # App icon
│   └── ...
└── package.json
```

---

## 🤖 AI Capabilities

### Mistral AI Integration

Lunar Markets leverages **Mistral AI's** powerful language model to provide intelligent, context-aware insights:

```typescript
// Example: Generating lunar insights
const insight = await generateLunarInsight(
  phaseName,      // "Full Moon"
  illumination,   // 98.5
  stockPrice,     // 456.78
  stockSymbol,    // "SPY"
  priceChange,    // +1.23
  zodiac,         // "Pisces"
  date            // Current date
);
```

### AI Features Breakdown

| Feature | Model | Temperature | Max Tokens |
|---------|-------|-------------|------------|
| Chat Assistant | mistral-small-latest | 0.7 | 200 |
| Predictions | mistral-small-latest | 0.5 | 200 |
| Horoscope | mistral-small-latest | 0.7 | 250 |
| Pattern Analysis | mistral-small-latest | 0.5 | 400 |

---

## 📱 User Journey

### Step 1: Landing Experience
Upon loading, users are greeted with an immersive starfield background and the current moon phase prominently displayed.

### Step 2: Explore Lunar Data
- View real-time moon phase, illumination percentage, and zodiac position
- Navigate through 60 days of lunar history using the carousel or date picker
- Discover special events like Supermoons and traditional moon names

### Step 3: Analyze Market Data
- Select from multiple stock symbols (SPY, AAPL, GOOGL, etc.)
- View current price, daily change, high/low, and volume
- Explore the interactive price chart

### Step 4: AI Insights
- Read AI-generated insights connecting lunar phases to market sentiment
- Check the 3-day prediction with confidence scores
- Review your daily financial horoscope
- Explore pattern recognition analysis with visual charts

### Step 5: Chat with Luna
- Click the floating moon button to open Luna AI
- Ask questions about lunar cycles, market timing, or zodiac influences
- Get personalized, context-aware responses

---

## 🎨 Design Philosophy

### Visual Language
- **Cosmic Theme**: Deep space gradients, glowing elements, and star particles
- **Glass Morphism**: Translucent cards with backdrop blur effects
- **Accent Colors**: Primary indigo/purple with cyan highlights
- **Typography**: Space Grotesk for headings, Inter for body text

### Animation Principles
- **Purposeful Motion**: Animations guide attention and provide feedback
- **Performance First**: GPU-accelerated transforms and opacity changes
- **Subtle Elegance**: Gentle easing curves and appropriate durations

---

## 🔮 The Science Behind It

### Lunar Phase Calculations
Our moon phase algorithm uses astronomical formulas to calculate:
- **Synodic Month**: 29.53059 days average lunar cycle
- **Phase Angle**: Precise illumination percentage
- **Moon Distance**: Perigee/Apogee detection for Supermoon identification
- **Zodiac Position**: Ecliptic longitude calculations

### Market Correlation Theory
While the correlation between lunar phases and markets is speculative, studies have explored:
- **Full Moon Effect**: Some research suggests increased volatility
- **Behavioral Finance**: Lunar cycles may influence investor sentiment
- **Historical Patterns**: Our AI analyzes 60-day windows for correlations

---

## 🏆 Why Lunar Markets Stands Out

1. **Unique Concept**: First-of-its-kind platform combining celestial data with financial analysis
2. **AI Integration**: Four distinct AI-powered features providing real value
3. **Technical Excellence**: Modern tech stack with TypeScript, React 18, and Vite
4. **Visual Polish**: Award-worthy design with attention to detail
5. **User Experience**: Intuitive navigation with delightful interactions
6. **Educational Value**: Learn about lunar cycles while exploring market data
7. **Accessibility**: Responsive design works on all devices

---

## 📄 API Reference

### Alpha Vantage (Stock Data)
```typescript
const stockData = await fetchDailyStockData("SPY");
// Returns: Array<{ date, open, high, low, close, volume }>
```

### Mistral AI (Insights)
```typescript
const response = await chatWithLunarAssistant(messages, context);
// Returns: AI-generated response string
```

### Moon Phases (Local Calculation)
```typescript
const moonData = calculateMoonPhase(new Date());
// Returns: { phase, illumination, phaseName, zodiac, distance, age }
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Mistral AI** for powering our intelligent features
- **Alpha Vantage** for providing financial data
- **shadcn/ui** for beautiful UI components
- **Framer Motion** for smooth animations
- The open-source community for inspiration and tools

---

<p align="center">
  <strong>Built with 💜 for the intersection of cosmos and commerce</strong>
</p>

<p align="center">
  <sub>Lunar Markets - Transforming how we understand the celestial influence on financial markets</sub>
</p>
