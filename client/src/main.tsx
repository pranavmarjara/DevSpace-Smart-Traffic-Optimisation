// Register Web Components for hybrid architecture FIRST
import "./widgets/register.ts";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
