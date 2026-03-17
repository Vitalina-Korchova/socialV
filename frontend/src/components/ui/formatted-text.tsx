import React from "react";

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
}) => {
  const regex = /\B#\w+/g;

  if (!text) return null;

  const parts = text.split(/(\B#\w+)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(regex)) {
          return (
            <span key={index} className="text-purple-500 italic font-medium">
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};
