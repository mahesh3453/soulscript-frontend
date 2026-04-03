import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker with auto-update
registerSW({
  onOfflineReady() {
    console.log('App ready for offline use.');
  },
  onNeedRefresh() {
    console.log('New version available. Refresh to update.');
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
