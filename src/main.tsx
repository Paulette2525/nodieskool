import { createRoot } from "react-dom/client";
import { registerSW } from 'virtual:pwa-register';
import App from "./App.tsx";
import "./index.css";

registerSW({
  onNeedRefresh() {
    console.log('[SW] New version available – reload to update.');
  },
  onOfflineReady() {
    console.log('App ready for offline use');
  },
});

createRoot(document.getElementById("root")!).render(<App />);
