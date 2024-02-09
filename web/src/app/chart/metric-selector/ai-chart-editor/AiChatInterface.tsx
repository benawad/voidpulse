import React from "react";
import PulseMotif1 from "../../../landing/PulseMotif1";

interface AiChatInterfaceProps {}

export const AiChatInterface: React.FC<AiChatInterfaceProps> = ({}) => {
  const greetingPrompts = [
    "What would you like to learn about your users?",
    "What report would you like to see?",
    "How can I help you visualize your data?",
  ];
  return (
    <div className="justify-center">
      <PulseMotif1
        className="mx-auto mt-12"
        style={{ width: 250, height: "auto" }}
      />
      <div className="bg-secondary-signature-100 p-3 rounded-lg m-3 shadow-lg">
        {greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)]}
      </div>
    </div>
  );
};
