import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './shared/context/ThemeContext'
import { AuthProvider } from './shared/context/AuthContext'
import { WorkdayTimerProvider } from './shared/context/WorkdayTimerContext'
import { TimerProvider } from './shared/context/TimerContext'
import { StatisticsProvider } from './shared/context/StatisticsContext'
import { installStorageSync } from './infrastructure/events/storageSync'
import App from './App.tsx'
import './index.css'

// Install cross-tab storage synchronization
installStorageSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <WorkdayTimerProvider>
            <TimerProvider>
              <StatisticsProvider refreshInterval={5000}>
                <App />
              </StatisticsProvider>
            </TimerProvider>
          </WorkdayTimerProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
