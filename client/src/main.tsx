import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Web Components for hybrid architecture
import "./widgets/register.ts";

createRoot(document.getElementById("root")!).render(<App />);
