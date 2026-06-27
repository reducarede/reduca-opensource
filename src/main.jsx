import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SetupWizard from './components/SetupWizard/SetupWizard.jsx'
import { isSupabaseConfigured } from './supabase.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSupabaseConfigured ? <App /> : <SetupWizard />}
  </StrictMode>,
)
