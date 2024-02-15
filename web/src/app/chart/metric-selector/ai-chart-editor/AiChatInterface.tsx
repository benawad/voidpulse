import React, { useState } from "react";
import PulseMotif1 from "../../../landing/PulseMotif1";
import { AiInputBar, LocalAiMsg } from "./AiInputBar";
import { MsgRole } from "@voidpulse/api";

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
  return (
    //Shell for the entire chat interface
    <div className="relative justify-center flex overflow-hidden">
      {/* <PulseMotif1
        className="mx-auto mt-12"
        style={{ width: 250, height: "auto" }}
      />
      <div className="bg-accent-100 p-3 rounded-lg m-3 shadow-lg text-sm mono-body">
        {greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)]}
      </div> */}

      {/* Shell for the chat messages */}
      <div className="relative">
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
      </div>

      {/* Pinned input bar area*/}
      <div className="flex bottom-0 pb-12">
        <div className="w-full bg-primary-800">
          <AiInputBar
            dataStr={dataStr}
            prevMsgs={msgs}
            onMsg={(msg) => setMsgs([...msgs, msg])}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
