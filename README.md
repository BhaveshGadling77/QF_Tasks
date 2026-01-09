# Historical Stock Data Player

An interactive web application for visualizing and replaying historical stock price data over time. The project allows users to compare multiple stocks, control the timeline like a media player, and observe how prices evolve day by day.

Live Demo: https://historicalplaybackdashboard.vercel.app/

---

## Overview

This project was built to explore time-series visualization, state-driven UI updates, and clean component-based architecture in React. Instead of showing static charts, the dashboard plays stock data progressively, making market movement easier to understand.

The UI and interaction patterns are inspired by trading and analytics platforms.

---

## Features

- Timeline-based playback of historical stock prices
- Play, pause, skip to start, and skip to end controls
- Adjustable playback speed (milliseconds per trading day)
- Multi-stock comparison on a single line chart
- Current date and progress indicator
- Dynamic stock selection (toggle stocks on and off)
- Responsive, dark-themed UI

---

## Tech Stack

- React (with Hooks)
- Vite (development and build tooling)
- Recharts (data visualization)
- Tailwind CSS (styling)
- Lucide React (icons)

---

## Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── StockChart.jsx
│   ├── PlaybackControls.jsx
│   ├── StockSelector.jsx
│   ├── StockMetrics.jsx
│   └── LoadingScreen.jsx
│
│
├── pages/
│   └── HistoricalStockDashboard.jsx
│
├── utils/
│   └── data.js
│
└── main.jsx
```

Each component has a single responsibility, which keeps the codebase modular and easy to extend.

---

## Data Format

Stock data is loaded from JSON files placed in the public directory:

```
public/data/
├── AAPL.json
├── MSFT.json
├── GOOGL.json
└── ...
```

Each file contains timestamp-based historical data (Open, High, Low, Close, Volume). The application parses this data and converts it into a format suitable for time-series playback.

---

## How Playback Works

- A shared `currentIndex` represents the active trading day
- On play, a timer (`setInterval`) increments the index
- The chart renders data points from day 0 up to `currentIndex`
- Pausing stops the timer without resetting state
- Sliders allow manual control of speed and timeline position

This approach mimics how a video player works, but for market data.

---

## Running Locally

Clone the repository:

```
git clone <repository-url>
cd historical-stock-data-player
```

Install dependencies:

```
npm install
```

Start the development server:

```
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Possible Improvements

- Add volume charts or candlestick charts
- Persist selected stocks using local storage
- Fetch live data from an external API
- Add annotations for major market events
- Improve performance with memoization for large datasets

---

## Author

Built by **Bhavesh Gadling** as a learning-focused project to practice React architecture, data visualization, and UI design.
