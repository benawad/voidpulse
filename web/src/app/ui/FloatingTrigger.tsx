import {
  useClick,
  useHover,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import React, { useState } from "react";

interface FloatingTriggerProps {
  className?: string;
  appearsOnHover?: boolean;
  appearsOnClick?: boolean;
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
  className,
  children,
  appearsOnHover,
  appearsOnClick,
  placement,
  floatingContent,
}) => {
  //Floating content needs to know if it's open or not
  const [isOpen, setIsOpen] = useState(false);
  //Floating content needs to know where to position itself
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: placement ?? "bottom-start",
  });

  //Interactions
  //Here is where we decide what actions make the content spawn
  const interactions = [useDismiss(context)];
  if (appearsOnHover) {
    interactions.push(useHover(context));
  }
  if (appearsOnClick) {
    interactions.push(useClick(context));
  }
  const { getReferenceProps, getFloatingProps } = useInteractions(interactions);

  return (
    <button
      {...getReferenceProps()}
      ref={refs.setReference}
      className={className}
    >
      {children}
      {/* Floating content */}
      {isOpen ? (
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
        >
          {floatingContent}
        </div>
      ) : null}
    </button>
  );
};
