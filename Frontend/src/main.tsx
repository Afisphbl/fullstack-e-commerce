import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// ── i18n must be imported before App so translations are ready on first render ──
import "./lib/i18n";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
