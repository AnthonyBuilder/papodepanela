import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { SavedRecipesProvider } from './context/SavedRecipesContext'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <SavedRecipesProvider>
          <App />
        </SavedRecipesProvider>
      </LanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
