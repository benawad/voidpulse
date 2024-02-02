import React from "react";

interface AiChatInterfaceProps {}

export const AiChatInterface: React.FC<AiChatInterfaceProps> = ({}) => {
  const greetingPrompts = [
    "What would you like to learn about your users?",
    "What report would you like to see?",
    "How can I help you visualize your data?",
  ];
  return (
    <div>
      <div className="bg-secondary-signature-100 p-3 rounded-lg m-3 shadow-lg">
        {greetingPrompts[Math.floor(Math.random() * greetingPrompts.length)]}
      </div>
    </div>
  );
};
