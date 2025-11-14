// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./modules/loginpage/components/loginpage.jsx";
import HRApp from "./modules/Hrmodule/src/HrApp.jsx";
import ManagerApp from "./modules/Managermodule/src/ManagerApp.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Specific routes first */}
        <Route path="/login" element={<LoginPage />} />

        {/* HR module */}
        <Route path="/hr/*" element={<HRApp />} />

        {/* Default redirect - only for root path */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Manager module */}
        <Route path="/manager/*" element={<ManagerApp />} />

        {/* Default redirect - only for root path */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* Catch all route - ONLY for truly unknown routes */}
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        {/* for usermodule */}
        {/* <Route path="/manager/*" element={<ManagerApp />} /> */}

        {/* for finance
          <Route path="/manager/*" element={<ManagerApp />} /> */}

        {/* for traveldesk
            <Route path="/manager/*" element={<ManagerApp />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
