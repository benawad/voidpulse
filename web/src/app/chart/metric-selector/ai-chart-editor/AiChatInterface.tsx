import React, { useState } from "react";
import PulseMotif1 from "../../../landing/PulseMotif1";
import { AiInputBar, LocalAiMsg } from "./AiInputBar";
import { MsgRole } from "@voidpulse/api";

interface AiChatInterfaceProps {}

export const AiChatInterface: React.FC<AiChatInterfaceProps> = ({}) => {
  const [msgs, setMsgs] = useState<LocalAiMsg[]>([]);
  const greetingPrompts = [
    "What would you like to learn today?",
    "What report would you like to see?",
    "How can I help you visualize your data?",
  ];
  return (
    <div className="justify-center">
      {/* <PulseMotif1
        className="mx-auto mt-12"
        style={{ width: 250, height: "auto" }}
      />
      <div className="bg-accent-100 p-3 rounded-lg m-3 shadow-lg text-sm mono-body">
        {greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)]}
      </div> */}
      {msgs.map((msg, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg m-3 shadow-lg text-sm mono-body ${
            msg.role === MsgRole.user
              ? "text-right bg-accent-100"
              : "bg-primary-700"
          }`}
        >
          {msg.text}
        </div>
      ))}
      <AiInputBar prevMsgs={msgs} onMsg={(msg) => setMsgs([...msgs, msg])} />
    </div>
  );
};
