import React, { useState } from "react";
import { MultiToggleButtonBar } from "../ui/MultiToggleButtonBar";
import { ManualChartOptions } from "./manual-sidebars/ManualChartOptions";
import { AiChatInterface } from "./metric-selector/ai-chart-editor/AiChatInterface";

interface ChartEditorSidebarProps {}

export const ChartEditorSidebar: React.FC<ChartEditorSidebarProps> = () => {
  const [editorMode, setEditorMode] = useState("ai");
  return (
    <div
      className="border-r bg-primary-900 border-primary-800"
      style={{ width: 400 }}
    >
      <MultiToggleButtonBar
        className="mono-body text-sm rounded-none p-0 border-0"
        buttonClassName="w-full justify-center"
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
