import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { HashRouter } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkModeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </DarkModeProvider>
  </React.StrictMode>,
)