import React, { useEffect, useRef, useState } from "react";
import "./NotificationToast.scss";
import { BadgeInfo, BadgeMinus, Sparkles, TriangleAlert } from "lucide-react";

const SWIPE_THRESHOLD = 60;      // px dragged before it counts as a dismiss swipe
const SWIPE_EXIT_DISTANCE = 400; // how far it flies off-screen once dismissed

const NotificationToast = ({
  message,
  bgColor = "#323232",
  fontColor = "#fff",
  duration = 3000,
  icon,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [noTransition, setNoTransition] = useState(false);

  const startXRef = useRef(0);
  const dragXRef = useRef(0);
  const draggingRef = useRef(false);
  const closedRef = useRef(false);

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const clearTimers = () => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    clearTimeout(closeTimerRef.current);
  };

  const startAutoTimers = () => {
    hideTimerRef.current = setTimeout(() => setHiding(true), duration - 400);
    closeTimerRef.current = setTimeout(() => handleClose(), duration);
  };

  useEffect(() => {
    showTimerRef.current = setTimeout(() => setVisible(true), 16);
    startAutoTimers();
    return clearTimers;
  }, []);

  const handleClose = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    onClose();
  };

  const getClientX = (e) => {
    if (typeof e.clientX === "number") return e.clientX;
    if (e.touches && e.touches[0]) return e.touches[0].clientX;
    return 0;
  };

  const handlePointerDown = (e) => {
    draggingRef.current = true;
    setNoTransition(true);
    startXRef.current = getClientX(e);
    clearTimers(); // pause auto-dismiss while the user is interacting
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const delta = getClientX(e) - startXRef.current;
    dragXRef.current = delta;
    setDragX(delta);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setNoTransition(false);

    if (Math.abs(dragXRef.current) > SWIPE_THRESHOLD) {
      // dragged far enough → fly off in that direction and close
      const direction = dragXRef.current > 0 ? 1 : -1;
      setDragX(direction * SWIPE_EXIT_DISTANCE);
      setHiding(true);
      setTimeout(() => handleClose(), 300);
    } else {
      // not far enough → snap back and resume auto-dismiss
      setDragX(0);
      dragXRef.current = 0;
      startAutoTimers();
    }
  };

  return (
    <div
      className={[
        "notification-toast",
        visible ? "toast-in" : "",
        hiding ? "toast-out" : "",
        noTransition ? "no-transition" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: bgColor,
        color: fontColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        transform: visible ? `translateX(${dragX}px)` : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <p>
        <span style={{ marginTop: "-2px" }}>
          {icon == "info" && <BadgeInfo style={{ width: "17px" }} />}
          {icon == "warr" && <TriangleAlert style={{ width: "17px" }} />}
          {icon == "remove" && <BadgeMinus style={{ width: "17px" }} />}
          {icon == "success" && <Sparkles style={{ width: "17px" }} />}
        </span>
        {message}
      </p>
    </div>
  );
};

export default NotificationToast;