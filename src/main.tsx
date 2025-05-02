import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupMockApi } from "./lib/mockSetup";

// Setup mock API if enabled
setupMockApi();

createRoot(document.getElementById("root")!).render(<App />);
