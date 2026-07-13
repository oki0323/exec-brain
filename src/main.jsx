import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { storage } from './services/storage'

// One-time setup link support: visiting a URL with #key=... saves the API
// key to this browser's storage before routing/rendering ever starts, then
// strips it from the address bar so it doesn't linger there.
if (window.location.hash.startsWith('#key=')) {
  storage.setApiKey(decodeURIComponent(window.location.hash.slice('#key='.length)))
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
