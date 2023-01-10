import * as React from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import theme from "./theme";
import AuthProvider from "./contexts/AuthContext";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

Amplify.configure(awsExports);
root.render(
  <ThemeProvider theme={theme}>
    <AuthProvider>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </AuthProvider>
  </ThemeProvider>
);
