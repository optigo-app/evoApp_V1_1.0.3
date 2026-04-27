import React, { useEffect, useState } from "react";
import "./NotificationToast.scss";

const NotificationToast = ({
  message,
  bgColor = "#323232",
  fontColor = "#fff",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 16);
    const hideTimer = setTimeout(() => setHiding(true), duration - 400);
    const closeTimer = setTimeout(() => onClose(), duration);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  return (
    <div
      className={`notification-toast ${visible ? "toast-in" : ""} ${hiding ? "toast-out" : ""}`}
      style={{ background: bgColor, color: fontColor }}
    >
      {message}
    </div>
  );
};

export default NotificationToast;