// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";   // this needs the file we just created

createRoot(document.getElementById("root")).render(<App />);
