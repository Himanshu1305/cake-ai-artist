import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} catch (error) {
  console.error('Failed to initialize app:', error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #e11d48;">Application Error</h1>
        <p style="color: #666;">Something went wrong while loading the application.</p>
        <p style="color: #999; font-size: 14px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #e11d48; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}
