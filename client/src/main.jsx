import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/auth.jsx'
import { SelectionProvider } from './context/selection.jsx'
import { ThemeProvider } from './context/theme.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <SelectionProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SelectionProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
