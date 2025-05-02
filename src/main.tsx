import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create a visual indicator for direct data access
const directDataIndicator = document.createElement('div');
directDataIndicator.style.position = 'fixed';
directDataIndicator.style.bottom = '10px';
directDataIndicator.style.right = '10px';
directDataIndicator.style.backgroundColor = 'rgba(0, 128, 0, 0.8)';
directDataIndicator.style.color = 'white';
directDataIndicator.style.padding = '5px 10px';
directDataIndicator.style.borderRadius = '4px';
directDataIndicator.style.fontSize = '12px';
directDataIndicator.style.fontWeight = 'bold';
directDataIndicator.style.zIndex = '9999';
directDataIndicator.textContent = '📊 MOCK DATA';
document.body.appendChild(directDataIndicator);

console.log('📊 Using direct mock data access - no API calls');

createRoot(document.getElementById("root")!).render(<App />);
