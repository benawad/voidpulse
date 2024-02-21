import React, { useState } from "react";
import PulseMotif1 from "../../../landing/PulseMotif1";
import { AiInputBar, LocalAiMsg } from "./AiInputBar";
import { MsgRole } from "@voidpulse/api";
import { RiSendPlaneFill } from "react-icons/ri";
import TypingIndicator from "./TypingIndicator";

interface AiChatInterfaceProps {
  dataStr: string;
}

export const AiChatInterface: React.FC<AiChatInterfaceProps> = ({
  dataStr,
}) => {
  const [msgs, setMsgs] = useState<LocalAiMsg[]>([]);
  const greetingPrompts = [
    "What would you like to learn today?",
    "What report would you like to see?",
    "How can I help you visualize your data?",
  ];
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (messagesEndRef.current) {
      const scrollPosition = messagesEndRef.current.scrollTop;
      const scrollHeight = messagesEndRef.current.scrollHeight;
      const divHeight = messagesEndRef.current.clientHeight;
      const atBottom = scrollHeight - scrollPosition === divHeight;
      const atTop = scrollPosition === 0;

      if (atBottom && !atTop) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [msgs]);
  return (
    //Shell for the entire chat interface
    <div className="relative flex flex-col justify-start">
      {/* Shell for the chat messages */}
      <div
        className="relative overflow-y-auto w-full px-2"
        style={{ height: "calc(70vh)" }}
      >
        {msgs.map((msg, i) => (
          <>
            <div>
              {MsgRole[msg.role] === "ai" ? (
                <div className="text-left text-primary-700 text-xs mt-2">
                  Voidpulse
                </div>
              ) : (
                <div className="text-right text-primary-700 text-xs mt-2">
                  You
                </div>
              )}
              <div
                key={i}
                className={`p-3 rounded-lg my-1 shadow-lg text-sm text-primary-100 ${
                  msg.role === MsgRole.user
                    ? "text-right bg-accent-100"
                    : "bg-primary-700"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </>
        ))}
        {/* If the AI has not responded, show loading... */}
        {msgs[msgs.length - 1]?.role === MsgRole.user ? (
          <div className="w-full pl-4 py-2">
            <TypingIndicator isVisible={true} />
          </div>
        ) : null}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Pinned input bar area*/}
      <div className="bg-primary-900/50 w-full">
        <div className="w-full flex flex-row p-2">
          <div className="w-full">
            <AiInputBar
              dataStr={dataStr}
              prevMsgs={msgs}
              onMsg={(msg) => setMsgs([...msgs, msg])}
              className="w-full m-0 border border-primary-500/50"
              placeholder="Ask me about this report..."
            />
          </div>
          <div className="items-center flex text-center py-1 px-3 my-1 rounded-md bg-primary-700 accent-hover">
            <RiSendPlaneFill className="my-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
