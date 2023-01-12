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

const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

const localRedirect = "http://localhost:3000/";
const productionRedirect = "https://master.d29thsukvcvws1.amplifyapp.com/";

const updatedAwsConfig = {
    ...awsExports,
    oauth: {
        ...awsExports.oauth,
        redirectSignIn: isLocalhost ? localRedirect : productionRedirect,
        redirectSignOut: isLocalhost ? localRedirect : productionRedirect,
    }
}

Amplify.configure(updatedAwsConfig);
root.render(
  <ThemeProvider theme={theme}>
    <AuthProvider>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </AuthProvider>
  </ThemeProvider>
);
