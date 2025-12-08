"use client";

import { JSX, useEffect, useState } from "react";

export default function BubblesBackground() {
  const [bubbles, setBubbles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const bubbleCount = 50;
    const newBubbles = [];

    for (let i = 0; i < bubbleCount; i++) {
      // Випадкові значення для кожної бульбашки
      const leftOffset = `${Math.random() * 100}vw`;
      const radius = `${1 + Math.random() * 9}vw`;
      const floatDuration = `${6 + Math.random() * 6}s`;
      const swayDuration = `${4 + Math.random() * 2}s`;
      const floatDelay = `${Math.random() * 4}s`;
      const swayDelay = `${Math.random() * 4}s`;
      const swayType =
        Math.random() > 0.5 ? "sway-left-to-right" : "sway-right-to-left";

      newBubbles.push(
        <div
          key={i}
          className="bubble"
          style={{
            left: leftOffset,
            width: radius,
            height: radius,
            animationDuration: floatDuration,
            animationDelay: floatDelay,
          }}
          data-sway-duration={swayDuration}
          data-sway-delay={swayDelay}
          data-sway-type={swayType}
        />
      );
    }

    setBubbles(newBubbles);
  }, []);

  return <div className="bubbles">{bubbles}</div>;
}
