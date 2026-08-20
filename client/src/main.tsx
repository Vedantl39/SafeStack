import { createRoot } from "react-dom/client";
import Hotjar from '@hotjar/browser';
import App from "./App";
import "./index.css";

// Initialize Hotjar
const siteId = 6483980;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);

createRoot(document.getElementById("root")!).render(<App />);
