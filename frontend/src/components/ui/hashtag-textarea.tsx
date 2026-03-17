import React, { useRef } from "react";
import { Textarea } from "./textarea";
import { FormattedText } from "./formatted-text";
import { cn } from "@/lib/utils";

interface HashtagTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onInput?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
}

export const HashtagTextarea = React.forwardRef<
  HTMLTextAreaElement,
  HashtagTextareaProps
>(({ value, className, onInput, ...props }, ref) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const internalRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="relative w-full">
      <div
        ref={backdropRef}
        className={cn(
          "absolute inset-0 pointer-events-none whitespace-pre-wrap break-words border border-transparent px-3 py-2 text-base md:text-sm text-foreground overflow-hidden",
          className
        )}
        aria-hidden="true"
      >
        <FormattedText text={value} />
      </div>
      <Textarea
        {...props}
        ref={(node) => {
          // Handle both the forwarded ref and local internalRef
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          (internalRef as any).current = node;
        }}
        value={value}
        onInput={(e) => {
          if (onInput) onInput(e);
        }}
        className={cn(
          "relative bg-transparent text-transparent caret-foreground focus-visible:ring-primary/20",
          className
        )}
      />
    </div>
  );
});

HashtagTextarea.displayName = "HashtagTextarea";
