import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/forms.css";
import "./styles/booking.css";
import "./styles/admin.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
