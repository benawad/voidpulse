import React, { useState } from "react";
import { MultiToggleButtonBar } from "../../../ui/MultiToggleButtonBar";
import { ManualChartOptions } from "./manual-sidebars/ManualChartOptions";
import { AiChatInterface } from "./metric-selector/ai-chart-editor/AiChatInterface";

interface ChartEditorSidebarProps {
  dataStr: string;
}

export const ChartEditorSidebar: React.FC<ChartEditorSidebarProps> = ({
  dataStr,
}) => {
  const [editorMode, setEditorMode] = useState<"ai" | "manual">("manual");
  return (
    <div
      className="border-r bg-primary-900 border-primary-800 overflow-y-auto"
      style={{ width: 400, height: "calc(100vh - 100px)" }}
    >
      <MultiToggleButtonBar
        className="mono-body text-sm rounded-none p-0 border-0"
        buttonClassName="w-full justify-center"
        buttonInfo={[
          {
            name: "Chat ✨",
            action: () => {
              setEditorMode("ai");
            },
          },
          {
            name: "Edit 📝",
            action: () => {
              setEditorMode("manual");
            },
          },
        ]}
        selectedButtonIdx={editorMode === "ai" ? 0 : 1}
      />
      {editorMode === "ai" ? (
        <AiChatInterface dataStr={dataStr} />
      ) : (
        <ManualChartOptions />
      )}
    </div>
  );
};
