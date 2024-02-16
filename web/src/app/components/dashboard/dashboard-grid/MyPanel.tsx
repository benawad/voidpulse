import { Kids } from "../../../ui/FullScreenModalOverlay";
import { useHorizontalResizable } from "./HorizontalResizableContext";

interface ResizableElementProps {
  index: number; // Index needed to identify which element to resize
}

export const MyPanel: Kids<ResizableElementProps> = ({ index, children }) => {
  const { widths } = useHorizontalResizable();

  return (
    <div
      style={{
        flex: `${widths[index]} 1 0px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {children}
    </div>
  );
};
