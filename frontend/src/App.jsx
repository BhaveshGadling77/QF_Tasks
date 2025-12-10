import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import HistoricalStockDashboard from './components/HistoricalStockDashboard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HistoricalStockDashboard/>
    </>
  )
}

export default App
