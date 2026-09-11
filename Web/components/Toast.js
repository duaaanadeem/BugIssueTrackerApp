"use client";

import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onDone }) {
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));

    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!visible || !message) {
    return null;
  }

  return <div className={`toast ${type === "error" ? "error" : ""}`}>{message}</div>;
}
