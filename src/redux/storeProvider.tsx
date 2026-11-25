"use client";
import { useEffect } from "react";
import { Provider } from "react-redux";

import { store } from "./store";
import { getCurrentUser } from "./slices/authSlice";

type StoreProviderProps = {
  children: React.ReactNode;
};

export default function StoreProvider({
  children,
}: StoreProviderProps) {
  useEffect(() => {
    store.dispatch(getCurrentUser());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
