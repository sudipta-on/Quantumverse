import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/common/ThemeProvider";

import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <BrowserRouter basename="/QuantumVerse"> */}
    <Router>
      <ThemeProvider>

        <App />

      </ThemeProvider>
    </Router>
  </React.StrictMode>
);