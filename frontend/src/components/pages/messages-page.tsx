"use client";
import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Input } from "../ui/input";
import { motion } from "framer-motion";
import { Check, CheckCheck, SquarePen } from "lucide-react";

export default function MessagesPage() {
  const chats = [
    {
      id: 1,
      name: "Bessie Cooper",
      img: "/back2.jpg",
      lastMessage: "Hi, how are you? I need help",
      online: true,
    },
    {
      id: 2,
      name: "Lily Anderson",
      img: "/back2.jpg",
      lastMessage: "Hello, how can I help you?",
      online: true,
    },
    {
      id: 3,
      name: "Kevin Anderson",
      img: "/back2.jpg",
      lastMessage: "I have job inenterested in",
      online: false,
    },
    {
      id: 4,
      name: "Andrew Harris",
      img: "/back2.jpg",
      lastMessage: "Tommorow will be my birthday",
      online: false,
    },
    {
      id: 5,
      name: "Lily Anderson",
      img: "/back2.jpg",
      lastMessage: "Hello, how can I help you?",
      online: true,
    },
  ];
  const messagesWithUsers = [
    {
      id: 1,
      nameUser: "Bessie Cooper",
      img: "/back2.jpg",
      messages: [
        {
          id: 1,
          message:
            "Hi, how are you? I need help, please. ldskfjdfij fhoidshfios hfeiuhfi ihdsfoihsd dsi hfiusdh sdfduis fdhs fuihifsdhfoidsh fds jfides fdsifjdsf hsdfefnsdui hfil",
          time: "12:00",
          isOwnMessage: true,
          isRead: true,
        },
        {
          id: 2,
          message: "Hello, how can I help you?",
          time: "11:00",
          isOwnMessage: false,
          isRead: true,
        },
        {
          id: 3,
          message: "I have job inenterested in",
          time: "10:00",
          isOwnMessage: true,
          isRead: false,
        },
        {
          id: 4,
          message: "Tommorow will be my birthday",
          time: "09:00",
          isOwnMessage: false,
          isRead: false,
        },
        {
          id: 5,
          message: "I have job inenterested in",
          time: "08:00",
          isOwnMessage: true,
          isRead: false,
        },
        {
          id: 6,
          message: "Tommorow will be my birthday",
          time: "07:00",
          isOwnMessage: false,
          isRead: false,
        },
        {
          id: 7,
          message: "I have job inenterested in",
          time: "06:00",
          isOwnMessage: true,
          isRead: false,
        },
        {
          id: 8,
          message: "Tommorow will be my birthday",
          time: "05:00",
          isOwnMessage: false,
          isRead: false,
        },
        {
          id: 9,
          message: "I have job inenterested in",
          time: "04:00",
          isOwnMessage: true,
          isRead: false,
        },
        {
          id: 10,
          message: "Tommorow will be my birthday",
          time: "03:00",
          isOwnMessage: false,
          isRead: false,
        },
      ],
    },
    {
      id: 2,
      nameUser: "Lily Anderson",
      img: "/back2.jpg",
      messages: [
        {
          id: 1,
          message: "Hi, how are you? I need help",
          time: "12:00",
          isOwnMessage: true,
          isRead: true,
        },
      ],
    },
  ];

  const [activeChat, setActiveChat] = useState(chats[0]);

  const activeMessages = messagesWithUsers.find(
    (u) => u.nameUser === activeChat.name
  );

  return (
    <Card className="w-full h-[540px] pb-0 gap-0!">
      <CardTitle className="px-8 pb-4 border-b flex justify-between items-center">
        <span className="text-xl">Messages</span>

        <span className="text-xs px-3 py-1 rounded-full bg-muted border">
          Online
        </span>
      </CardTitle>

      <CardContent className="flex h-full py-0! px-0! ">
        <div className="w-[300px] border-r flex flex-col h-full">
          <div className="overflow-y-auto max-h-[400px] flex-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={cn(
                  "flex gap-3 px-5 py-4 cursor-pointer hover:bg-muted transition",
                  activeChat.id === chat.id && "bg-muted"
                )}
              >
                <div className="relative">
                  <Image
                    src={chat.img}
                    alt={chat.name}
                    width={100}
                    height={100}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full " />
                  )}
                </div>

                <div className="flex flex-col ">
                  <span className="font-medium text-sm">{chat.name}</span>
                  <span className="text-xs text-muted-foreground truncate w-[180px]">
                    {chat.lastMessage}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-5 py-4 border-t text-sm 
          cursor-pointer flex items-center justify-center shrink-0 gap-3 text-white hover:text-primary"
          >
            <SquarePen className="size-5" /> <span>New Message</span>
          </div>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[400px]">
            {activeMessages?.messages.map((msg) => {
              const isOwn = msg.isOwnMessage;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {!isOwn && (
                    <Image
                      src={activeMessages.img}
                      alt={activeMessages.nameUser}
                      width={100}
                      height={100}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] px-4 py-3 rounded-xl text-sm",
                      isOwn
                        ? "bg-indigo-500 text-white rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    {!isOwn && (
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {activeMessages.nameUser}
                      </p>
                    )}

                    <p>{msg.message}</p>

                    <div className="flex flex-row gap-1 items-center justify-end mt-2">
                      <span className=" text-[10px] opacity-70 ">
                        {msg.time}
                      </span>

                      {msg.isRead ? (
                        <CheckCheck className="size-4 text-gray-200" />
                      ) : (
                        <Check className="size-4 text-gray-200" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!activeMessages && (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            )}
          </div>

          <div className="px-6 py-4 border-t flex gap-3 items-center shrink-0 ">
            <Input
              placeholder="Message ..."
              className="flex-1 rounded-lg border px-4 py-2 text-sm outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-indigo-500 text-xl cursor-pointer">➤</div>
            </motion.button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
