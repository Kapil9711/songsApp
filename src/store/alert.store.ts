import { create } from "zustand";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

type AlertOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type AlertState = {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  show: (type: AlertType, options: AlertOptions) => void;
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
  warning: (title: string, message: string) => void;
  info: (title: string, message: string) => void;
  confirm: (options: AlertOptions) => void;
  hide: () => void;
  accept: () => void;
  cancel: () => void;
};

const initialAlert = {
  visible: false,
  type: "info" as AlertType,
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  onConfirm: undefined,
  onCancel: undefined,
};

export const useAlertStore = create<AlertState>((set, get) => ({
  ...initialAlert,

  show: (type, options) => {
    set({
      visible: true,
      type,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    });
  },

  success: (title, message) => {
    get().show("success", { title, message });
  },

  error: (title, message) => {
    get().show("error", { title, message });
  },

  warning: (title, message) => {
    get().show("warning", { title, message });
  },

  info: (title, message) => {
    get().show("info", { title, message });
  },

  confirm: (options) => {
    get().show("confirm", options);
  },

  hide: () => {
    set({
      visible: false,
      onConfirm: undefined,
      onCancel: undefined,
    });
  },

  accept: () => {
    const callback = get().onConfirm;

    // Close the alert before executing the action.
    get().hide();
    callback?.();
  },

  cancel: () => {
    const callback = get().onCancel;

    get().hide();
    callback?.();
  },
}));
