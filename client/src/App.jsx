import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./loader";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {isLoading ? <Loader /> : <AppRoutes />}
      </AuthProvider>
    </BrowserRouter>
  );
}