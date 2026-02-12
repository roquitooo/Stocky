import styled, { ThemeProvider } from "styled-components";
import { AuthContextProvider } from "./context/AuthContent";
import { GlobalStyles } from "./styles/GlobalStyles";
import { MyRoutes } from "./routers/routes";
import { useThemeStore } from "./store/ThemeStore";
import { Device } from "./styles/breakpoints";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";


function App() {
  const { themeStyle } = useThemeStore();
 
  return (
    <ThemeProvider theme={themeStyle}>
      <AuthContextProvider>
        <GlobalStyles />
        <Toaster richColors position="top-center"
  toastOptions={{
    style: { marginTop: '50px' }
  }} />
        <MyRoutes />

        <ReactQueryDevtools initialIsOpen={true} />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
