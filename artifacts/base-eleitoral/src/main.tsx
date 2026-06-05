import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.lang = "pt-BR";
document.documentElement.setAttribute("translate", "no");
document.body.classList.add("notranslate");
document.body.setAttribute("translate", "no");

createRoot(document.getElementById("root")!).render(<App />);
