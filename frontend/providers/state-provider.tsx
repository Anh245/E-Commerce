"use client";
import { persistor, store } from "../store";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { refreshSession } from "@/services/api/session";

interface ReduxProviderProps {
  children: React.ReactNode;
}

function SessionGate({ children }: ReduxProviderProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    refreshSession().finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  return ready ? children : <p role="status">Đang khôi phục phiên…</p>;
}

function StateProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionGate>{children}</SessionGate>
      </PersistGate>
    </Provider>
  );
}

export default StateProvider;
