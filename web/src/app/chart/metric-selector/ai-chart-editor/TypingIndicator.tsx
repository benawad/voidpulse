import React, { useEffect, useRef, useState } from "react";
import "./TypingIndicator.css"; // You can define your CSS for the typing animation

interface TypingIndicatorProps {
  isVisible: boolean;
  interval?: number;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  interval = 500,
}) => {
  const [isTyping, setIsTyping] = useState<boolean>(false);
  let typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      typingTimer.current = setInterval(() => {
        setIsTyping((prevIsTyping) => !prevIsTyping);
      }, interval);
    } else {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
      }
      setIsTyping(false);
    }

    return () => {
      if (typingTimer.current) {
        clearInterval(typingTimer.current);
      }
    };
  }, [isVisible, interval]);

  return isVisible ? (
    <div className="typing-indicator-container">
      <div className={`typing-indicator ${isTyping ? "typing" : ""}`}>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  ) : null;
};

export default TypingIndicator;
