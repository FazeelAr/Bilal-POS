import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartProvider"; // CHANGE THIS IMPORT

function App() {
  return (
    <CartProvider>
      <div
        className="app-root"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background: "#f0f4ff",
        }}
      >
        <Header />

        <main
          className="app-main"
          style={{
            flex: 1,
            padding: "0 1.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
