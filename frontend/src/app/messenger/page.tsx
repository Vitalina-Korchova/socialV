"use client";
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck, SquarePen, MessageCircle, SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MessangerPage() {
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
    <div className="flex flex-col h-[calc(100vh-81px)] w-full overflow-hidden bg-background">
      {/* Messenger Header */}
      <header className="px-8 py-4 border-b border-muted/50 flex justify-between items-center bg-card/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            Messages
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Direct Communication
          </span>
        </div>


      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[320px] border-r border-muted/50 flex flex-col bg-muted/5">
          <div className="flex-1 overflow-y-auto custom-scrollbar--post scroll-smooth">
            <div className="p-3 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  className={cn(
                    "flex gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 group relative",
                    activeChat.id === chat.id
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeChat.id === chat.id && (
                    <motion.div
                      layoutId="active-chat"
                      className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(138,60,255,0.5)]"
                    />
                  )}

                  <div className="relative shrink-0">
                    <Image
                      src={chat.img}
                      alt={chat.name}
                      width={44}
                      height={44}
                      className={cn(
                        "w-11 h-11 rounded-full object-cover border-2 transition-all duration-300",
                        activeChat.id === chat.id ? "border-primary p-0.5" : "border-transparent"
                      )}
                    />
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-sm truncate">{chat.name}</span>
                      <span className="text-[10px] opacity-50 font-medium">12:45</span>
                    </div>
                    <span className="text-xs truncate opacity-70 leading-relaxed">
                      {chat.lastMessage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-muted/50 bg-muted/10">
            <button
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-background border border-muted-foreground/10 hover:border-primary/50 hover:bg-primary/5 transition-all group font-medium text-sm shadow-sm"
            >
              <SquarePen className="size-4 group-hover:text-primary transition-transform group-hover:scale-110" />
              <span>New Message</span>
            </button>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex flex-col flex-1 min-w-0 bg-transparent relative">
          {/* Active Chat Header */}
          <div className="px-6 py-3.5 border-b border-muted/30 flex items-center justify-between bg-card/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={activeChat.img}
                  alt={activeChat.name}
                  width={34}
                  height={34}
                  className="w-9 h-9 rounded-full border border-primary/20 object-cover shadow-sm"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{activeChat.name}</span>
                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              </button>
            </div>
          </div>

          {/* Message History */}
          <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6 custom-scrollbar--post bg-[radial-gradient(circle_at_bottom_right,rgba(138,60,255,0.03),transparent)]">
            {activeMessages?.messages.map((msg) => {
              const isOwn = msg.isOwnMessage;

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-end gap-3",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {!isOwn && (
                    <Image
                      src={activeMessages.img}
                      alt={activeMessages.nameUser}
                      width={32}
                      height={32}
                      className="w-7 h-7 rounded-full object-cover border border-muted/50 shrink-0 mb-1"
                    />
                  )}

                  <div
                    className={cn(
                      "max-w-[65%] px-5 py-3.5 rounded-2xl text-[13.5px] shadow-sm transition-all relative group",
                      isOwn
                        ? "bg-gradient-to-tr from-indigo-600 to-primary text-white rounded-br-none shadow-indigo-500/10"
                        : "bg-card border border-muted-foreground/10 rounded-bl-none shadow-black/5"
                    )}
                  >
                    <p className="leading-relaxed font-normal">{msg.message}</p>

                    <div className={cn(
                      "flex flex-row gap-1.5 items-center justify-end mt-2 opacity-70 text-[9px] font-bold tracking-tighter",
                      isOwn ? "text-white/80" : "text-muted-foreground"
                    )}>
                      <span>{msg.time}</span>
                      {isOwn && (
                        msg.isRead ? (
                          <CheckCheck className="size-3" />
                        ) : (
                          <Check className="size-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!activeMessages && (
              <div className="flex h-full items-center justify-center text-muted-foreground italic flex-col gap-3">
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                  <MessageCircle className="size-8 opacity-20" />
                </div>
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="px-8 pb-8 pt-4 border-t-0 bg-transparent flex justify-center">
            <div className="flex gap-4 items-center max-w-5xl w-full bg-card/60 backdrop-blur-xl border border-muted/50 rounded-3xl px-3 py-2.5 shadow-2xl shadow-black/20 ring-1 ring-white/5">
              <div className="flex gap-1 shrink-0 px-1">
                <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path></svg>
                </button>
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="Type your message..."
                  className="w-full rounded-2xl border-none px-4 py-6 text-[14px] bg-transparent focus-visible:ring-0 pr-12 transition-all placeholder:text-muted-foreground/40 font-medium h-12"
                />
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/90 text-white p-3 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center cursor-pointer active:translate-y-0.5"
                >
                  <SendHorizontal className="size-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
