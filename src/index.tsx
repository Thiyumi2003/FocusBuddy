import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { registerPushNotifications } from "./utils/pushRegister";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        // Once the service worker is ready, attempt push subscription
        void registerPushNotifications();
      })
      .catch((error: unknown) => {
        console.error('FocusBuddy offline support could not start.', error);
      });
  });
}