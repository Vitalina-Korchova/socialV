"use client";
import React, { JSX, useEffect, useState } from "react";

export default function StarsBackground() {
  const [stars, setStars] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const starCount = isMobile ? 20 : 40;
    const newStars = [];

    for (let i = 0; i < starCount; i++) {
      const starTailLength = `${5 + Math.random() * 2.5}em`;
      const topOffset = `${Math.random() * 150}vh`;
      const fallDuration = `${6 + Math.random() * 16}s`;
      const fallDelay = `${Math.random() * 6}s`;

      const starColor = `rgba(142, 81, 255, ${0.7 + Math.random() * 0.3})`;
      const starWidth = `${parseFloat(starTailLength) / 6}em`;

      newStars.push(
        <div
          key={i}
          className="star"
          style={
            {
              "--star-color": starColor,
              "--star-tail-length": starTailLength,
              "--star-width": starWidth,
              "--top-offset": topOffset,
              "--fall-duration": fallDuration,
              "--fall-delay": fallDelay,
            } as React.CSSProperties
          }
        />
      );
    }

    setStars(newStars);
  }, []);

  return (
    <div className="stars-background">
      <div className="stars">{stars}</div>
    </div>
  );
}
