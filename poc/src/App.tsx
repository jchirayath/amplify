import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { ToastProvider } from "./components/Toast";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import NewRx from "./pages/NewRx";
import RxDetail from "./pages/RxDetail";
import SettingsPage from "./pages/Settings";

function RequireSession({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const loc = useLocation();
  if (!state.signedIn) return <Navigate to="/signin" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route element={<RequireSession><Layout /></RequireSession>}>
              <Route index element={<Home />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="rx/new" element={<NewRx />} />
              <Route path="rx/:id" element={<RxDetail />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
}
