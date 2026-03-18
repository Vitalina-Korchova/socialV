"use client";
import React from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setSearch } from "@/store/post/search.slice";

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className,
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const regex = /\B#\w+/g;

  if (!text) return null;

  const parts = text.split(/(\B#\w+)/g);

  const handleHashtagClick = (hashtag: string) => {
    dispatch(setSearch(hashtag));
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(regex)) {
          return (
            <span
              key={index}
              className="text-purple-500 italic font-medium cursor-pointer hover:underline"
              onClick={() => handleHashtagClick(part)}
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};
