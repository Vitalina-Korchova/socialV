import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Card, CardTitle } from "../ui/card";
import { motion } from "framer-motion";

const mockNotifications = [
  {
    id: 1,
    img: "/back2.jpg",
    text: "You bought a new avatar",
  },
  {
    id: 2,
    img: "/back2.jpg",
    text: "Background was successfully applied",
  },
  {
    id: 3,
    img: "/back2.jpg",
    text: "You unlocked a new border",
  },
  {
    id: 4,
    img: "/back2.jpg",
    text: "Avatar changed on profile",
  },
  {
    id: 5,
    img: "/back2.jpg",
    text: "Purchase completed successfully",
  },
  {
    id: 6,
    img: "/back2.jpg",
    text: "New item available in store",
  },
];

export default function Notifications() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute right-4 top-16"
    >
      <Card className="w-full max-w-xs p-4 space-y-3">
        <CardTitle className="text-base">Notifications</CardTitle>

        <div className="space-y-2">
          {mockNotifications.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5
                         hover:bg-muted/40 transition-colors"
            >
              <Image
                src={item.img}
                alt="notification avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />

              <p className="flex-1 text-sm leading-tight">{item.text}</p>

              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
