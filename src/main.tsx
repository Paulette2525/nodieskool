import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

// Check for updates every 60 seconds and auto-reload when a new version is ready
registerSW({
  onNeedRefresh() {
    window.location.reload();
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => { registration.update(); }, 60 * 1000);
    }
  },
});

createRoot(document.getElementById("root")!).render(<App />);
