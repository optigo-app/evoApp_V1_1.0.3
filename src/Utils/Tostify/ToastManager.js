import React, { useState, useCallback } from "react";
import NotificationToast from "./NotificationToast";

let _showToast;

export const ToastContainer = () => {
  const [toast, setToast] = useState(null);

  _showToast = useCallback(({ message, bgColor, fontColor, duration }) => {
    setToast({ message, bgColor, fontColor, duration });
  }, []);

  const handleClose = () => setToast(null);

  if (!toast) return null;

  return (
    <NotificationToast
      message={toast.message}
      bgColor={toast.bgColor}
      fontColor={toast.fontColor}
      duration={toast.duration}  // pass duration here
      onClose={handleClose}
    />
  );
};

export const showToast = ({ message, bgColor, fontColor, duration }) => {
  if (_showToast) {
    _showToast({ message, bgColor, fontColor, duration });
  } else {
    console.warn("ToastContainer is not mounted yet.");
  }
};
