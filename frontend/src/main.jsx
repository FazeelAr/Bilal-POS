import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Login from "./pages/Login";
import Pos from "./pages/Pos";
import Product from "./pages/Product";
import Receipt from "./pages/Receipt";
import Report from "./pages/Report";
import { BrowserRouter, Route, Routes } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="pos" element={<Pos />} />
          <Route path="product/:id" element={<Product />} />
          <Route path="receipt" element={<Receipt />} />
          <Route path="report" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
