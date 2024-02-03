import React, { useState } from "react";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";
import { ManualChartOptions } from "./ManualChartOptions";
import { AiChatInterface } from "./metric-selector/ai-chart-editor/AiChatInterface";

interface ChartEditorSidebarProps {}

export const ChartEditorSidebar: React.FC<ChartEditorSidebarProps> = () => {
  const [editorMode, setEditorMode] = useState("manual");
  return (
    <div
      className="border-r p-4 bg-primary-900 border-primary-800"
      style={{ width: 400 }}
    >
      <MultiToggleButtonBar
        className="font-semibold text-md"
        buttonClassName="w-full"
        buttonInfo={[
          {
            name: "AI Chat ✨",
            action: () => {
              setEditorMode("ai");
            },
          },
          {
            name: "Manual 💪",
            action: () => {
              setEditorMode("manual");
            },
          },
        ]}
        selectedButtonIdx={editorMode === "ai" ? 0 : 1}
      />
      {editorMode === "ai" ? <AiChatInterface /> : <ManualChartOptions />}
    </div>
  );
};
