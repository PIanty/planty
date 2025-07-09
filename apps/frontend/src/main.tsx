import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { enableBrowserProtection } from "./util";

// Enable right-click and inspect protection in production only
enableBrowserProtection();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
