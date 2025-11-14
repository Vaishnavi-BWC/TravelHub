import React from "react";
import ReactDOM from "react-dom/client";
import HrApp from "./HrApp";
import { AppProvider } from "./contexts/AppContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <HrApp />
    </AppProvider>
  </React.StrictMode>
);
