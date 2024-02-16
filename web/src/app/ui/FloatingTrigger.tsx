import {
  useClick,
  useHover,
  useDismiss,
  useFloating,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import React, { useState } from "react";

interface FloatingTriggerProps {
  portal?: boolean;
  startOpen?: boolean;
  className?: string;
  appearsOnHover?: boolean;
  appearsOnClick?: boolean;
  hideIfOpen?: boolean;
  placement?:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-start"
    | "top-end"
    | "right-start"
    | "right-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end";
  floatingContent: React.JSX.Element;
}

export const FloatingTrigger: React.FC<
  React.PropsWithChildren<FloatingTriggerProps>
> = ({
  portal,
  startOpen = false,
  className,
  children,
  appearsOnHover = false,
  appearsOnClick = false,
  hideIfOpen,
  placement,
  floatingContent,
}) => {
  //Floating content needs to know if it's open or not
  const [isOpen, setIsOpen] = useState(startOpen);
  //Floating content needs to know where to position itself
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement ?? "bottom-start",
  });

  //Interactions
  //Here is where we decide what actions make the content spawn
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useDismiss(context),
    useHover(context, { enabled: appearsOnHover }),
    useClick(context, { enabled: appearsOnClick }),
  ]);

  //Fade in/out effect styles
  const fadeIn = "transition-opacity duration-200 opacity-100";
  const fadeOut = "transition-opacity duration-200 opacity-0";
  const inside = isOpen ? (
    <div
      ref={refs.setFloating}
      {...getFloatingProps()}
      style={floatingStyles}
      className={"z-30 flex" + isOpen ? fadeIn : fadeOut}
    >
      <div>{floatingContent}</div>
    </div>
  ) : null;

  return (
    <button
      {...getReferenceProps()}
      ref={refs.setReference}
      className={className}
    >
      <div className="flex" style={{ opacity: hideIfOpen && isOpen ? 0 : 1 }}>
        {children}
      </div>
      {/* Floating content */}
      {isOpen ? (
        portal ? (
          <FloatingPortal>{inside}</FloatingPortal>
        ) : (
          inside
        )
      ) : null}
    </button>
  );
};
