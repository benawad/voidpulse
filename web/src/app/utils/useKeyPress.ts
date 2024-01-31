import { on } from "events";
import { useEffect, useRef, useState } from "react";

export const useKeyPress = ({
  onLeftArrowKey,
  onRightArrowKey,
}: {
  onLeftArrowKey: () => void;
  onRightArrowKey: () => void;
}) => {
  const onLeftArrowKeyRef = useRef(onLeftArrowKey);
  onLeftArrowKeyRef.current = onLeftArrowKey;
  const onRightArrowKeyRef = useRef(onRightArrowKey);
  onRightArrowKeyRef.current = onRightArrowKey;

  useEffect(() => {
    const handler = ({ key }: KeyboardEvent) => {
      if (key === "ArrowLeft") {
        onLeftArrowKeyRef.current();
      } else if (key === "ArrowRight") {
        onRightArrowKeyRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);
};
