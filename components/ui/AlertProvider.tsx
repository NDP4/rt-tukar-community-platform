"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import AlertModal from "./AlertModal";

interface AlertOptions {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  confirmText?: string;
  showCancel?: boolean;
  cancelText?: string;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [alert, setAlert] = useState<
    (AlertOptions & { isOpen: boolean }) | null
  >(null);

  const showAlert = (options: AlertOptions) => {
    setAlert({ ...options, isOpen: true });
  };

  const showSuccess = (title: string, message: string) => {
    showAlert({ type: "success", title, message });
  };

  const showError = (title: string, message: string) => {
    showAlert({ type: "error", title, message });
  };

  const showWarning = (title: string, message: string) => {
    showAlert({ type: "warning", title, message });
  };

  const showInfo = (title: string, message: string) => {
    showAlert({ type: "info", title, message });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    showAlert({
      type: "warning",
      title,
      message,
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      {alert && (
        <AlertModal
          isOpen={alert.isOpen}
          onClose={closeAlert}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          confirmText={alert.confirmText}
          showCancel={alert.showCancel}
          cancelText={alert.cancelText}
          onConfirm={alert.onConfirm}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
