"use client";
import React, { useState, useMemo, useEffect } from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";

import { motion } from "framer-motion";
import {
  Check,
  CheckCheck,
  SquarePen,
  MessageCircle,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  useGetAllChatsQuery,
  useGetAllMessagesQuery,
  useSendMessageMutation,
  useGetUnreadEachQuery,
  useRemoveChatMutation,
  useRemoveMessageMutation,
} from "@/store/chat/chat.api";
import { useGetMeQuery } from "@/store/user/user.api";
import { getSocket } from "@/utils/socket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { NewChatModal } from "@/components/chat/new-chat-modal";
import { TbUserStar } from "react-icons/tb";

export default function MessangerPage() {
  const { data: me } = useGetMeQuery();
  const { data: chatsResponse, isLoading: chatsLoading } = useGetAllChatsQuery({});
  const { data: unreadEach } = useGetUnreadEachQuery();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    type: 'chat' | 'message' | null;
    id: number | null;
  }>({ isOpen: false, type: null, id: null });

  const { data: messagesResponse, isLoading: messagesLoading } = useGetAllMessagesQuery(
    { chatId: activeChatId! },
    { skip: !activeChatId }
  );

  const [sendMessage] = useSendMessageMutation();
  const [removeChat] = useRemoveChatMutation();
  const [removeMessage] = useRemoveMessageMutation();
  const [messageInput, setMessageInput] = useState("");

  const handleRemoveChat = (chatId: number) => {
    setDeleteState({ isOpen: true, type: 'chat', id: chatId });
  };

  const handleRemoveMessage = (messageId: number) => {
    setDeleteState({ isOpen: true, type: 'message', id: messageId });
  };

  const confirmDelete = async () => {
    if (!deleteState.id) return;

    try {
      if (deleteState.type === 'chat') {
        await removeChat(deleteState.id).unwrap();
        setActiveChatId(null);
      } else if (deleteState.type === 'message') {
        await removeMessage(deleteState.id).unwrap();
      }
    } catch (error) {
      toast.error("Failed to delete")
    } finally {
      setDeleteState({ isOpen: false, type: null, id: null });
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChatId && messagesResponse && me) {
      const unreadMessageIds = messagesResponse.data
        .filter(m => !m.is_read && m.sender.id !== me.id)
        .map(m => m.id);

      if (unreadMessageIds.length > 0) {
        const socket = getSocket();
        socket.emit("mark_messages_read", {
          chat_id: activeChatId,
          message_ids: unreadMessageIds
        });
      }
    }
  }, [activeChatId, messagesResponse, me]);

  const chats = useMemo(() => {
    if (!chatsResponse || !me) return [];
    return chatsResponse.data.map((chat) => {
      const otherUser = chat.first_user.id === me.id ? chat.second_user : chat.first_user;
      const unreadCount = unreadEach?.find(u => u.chat_id === chat.id)?.unread_count || 0;

      return {
        id: chat.id,
        name: otherUser.username,
        img: otherUser.avatar_url,
        border: otherUser.border_url,
        lastMessage: chat.last_message?.text_content || "No messages yet",
        online: false,
        time: chat.last_message ? formatTime(chat.last_message.created_at) : "",
        unreadCount,
      };
    });
  }, [chatsResponse, me, unreadEach]);

  const activeChat = chats.find(c => c.id === activeChatId);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChatId) return;

    try {
      await sendMessage({ chat_id: activeChatId, text: messageInput }).unwrap();
      setMessageInput("");
    } catch (error) {
      toast.error("Failed to send message")
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-83px)] w-full overflow-hidden bg-transparent ">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Card className="w-[320px] border-r border-muted/50 flex flex-col rounded-none ">
          <div className="flex-1 overflow-y-auto custom-scrollbar--post scroll-smooth">
            <div className="p-3 space-y-1 ">
              {chatsLoading ? (
                <div className="p-4 text-center text-muted-foreground font-medium italic">Loading chats...</div>
              ) : chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "flex gap-3 px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 group relative border-b",
                    activeChatId === chat.id
                      ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {activeChatId === chat.id && (
                    <motion.div
                      layoutId="active-chat"
                      className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(138,60,255,0.5)]"
                    />
                  )}

                  <div className="relative shrink-0 flex items-center justify-center size-11">
                    {chat.border && (
                      <div className="absolute inset-x-0 inset-y-0 overflow-hidden">
                        <Image
                          src={chat.border}
                          alt="border"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover scale-150"
                        />
                      </div>
                    )}
                    <div className="size-9 rounded-full bg-muted flex items-center justify-center relative z-10 overflow-hidden">
                      {chat.img ? (
                        <Image
                          src={chat.img}
                          alt={chat.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <TbUserStar className="text-primary size-5" />
                      )}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm z-20" />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 justify-center ">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-sm truncate">
                        {chat.name}
                      </span>
                      <span className="text-[10px] opacity-50 font-medium shrink-0">
                        {chat.time}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-xs truncate opacity-70 leading-relaxed pr-2">
                        {chat.lastMessage}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-1.5 shadow-sm shadow-primary/30">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveChat(chat.id);
                    }}
                    className="p-2 text-muted-foreground/50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Chat"
                  >
                    <Trash2 className="size-4 cursor-pointer" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-muted/50 bg-muted/10">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="cursor-pointer w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-background border border-muted-foreground/10 hover:border-primary/50 hover:bg-primary/5 transition-all group font-medium text-sm shadow-sm"
            >
              <SquarePen className="size-4 group-hover:text-primary transition-transform group-hover:scale-110" />
              <span>New Message</span>
            </button>
          </div>
        </Card>

        {/* New Chat Selection Modal */}
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          onSelectChat={(chatId) => setActiveChatId(chatId)}
        />

        {/* Chat Area */}
        <main className="flex flex-col flex-1 min-w-0 bg-transparent relative">
          {activeChat ? (
            <>
              <div className="px-6 py-3.5 border-b border-muted/30 flex items-center justify-between bg-card/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center size-9">
                    {activeChat.border && (
                      <div className="absolute inset-0 overflow-hidden">
                        <Image
                          src={activeChat.border}
                          alt="border"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover scale-150"
                        />
                      </div>
                    )}
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center relative z-10 overflow-hidden">
                      {activeChat.img ? (
                        <Image
                          src={activeChat.img}
                          alt={activeChat.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <TbUserStar className="text-primary size-4" />
                      )}
                    </div>
                    {activeChat.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background z-20" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {activeChat.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveChat(activeChat.id)}
                  className="p-2 text-muted-foreground/50 hover:text-red-500 transition-colors"
                  title="Delete Chat"
                >
                  <Trash2 className="size-5 cursor-pointer" />
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto px-10 py-8 space-y-6 custom-scrollbar--post bg-[radial-gradient(circle_at_bottom_right,rgba(138,60,255,0.03),transparent)] flex flex-col-reverse">
                <div className="flex flex-col gap-6 ">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground py-10 font-medium">Loading messages...</div>
                  ) : messagesResponse?.data.slice().reverse().map((msg) => {
                    const isOwn = msg.sender.id === me?.id;

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex items-end gap-3",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isOwn && (
                          <div className="relative flex items-center justify-center size-8 shrink-0 mb-1">
                            {msg.sender.border_url && (
                              <div className="absolute inset-0 overflow-hidden">
                                <Image
                                  src={msg.sender.border_url}
                                  alt="border"
                                  width={100}
                                  height={100}
                                  className="w-full h-full object-cover scale-150"
                                />
                              </div>
                            )}
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center relative z-10 overflow-hidden">
                              {msg.sender.avatar_url ? (
                                <Image
                                  src={msg.sender.avatar_url}
                                  alt={msg.sender.username}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <TbUserStar className="text-primary size-4" />
                              )}
                            </div>
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[65%] px-5 py-3.5 rounded-2xl text-[13.5px] shadow-sm transition-all relative group",
                            isOwn
                              ? "bg-gradient-to-tr from-indigo-600 to-primary text-white rounded-br-none shadow-indigo-500/10"
                              : "bg-card border border-muted-foreground/10 rounded-bl-none shadow-black/5"
                          )}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="leading-relaxed font-normal">{msg.text_content}</p>
                            {isOwn && (
                              <button
                                onClick={() => handleRemoveMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity"
                                title="Delete Message"
                              >
                                <Trash2 className="size-3.5 cursor-pointer" />
                              </button>
                            )}
                          </div>

                          <div
                            className={cn(
                              "flex flex-row gap-1.5 items-center justify-end mt-2 opacity-70 text-[9px] font-bold tracking-tighter",
                              isOwn ? "text-white/80" : "text-muted-foreground"
                            )}
                          >
                            <span>{formatTime(msg.created_at)}</span>
                            {isOwn &&
                              (msg.is_read ? (
                                <CheckCheck className="size-3" />
                              ) : (
                                <Check className="size-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Input Area */}
              <div className="px-8 pb-8 pt-4 border-t-0 bg-background flex justify-center">
                <div className="flex gap-4 items-center max-w-5xl w-full bg-card/60 backdrop-blur-xl border border-muted/50 rounded-3xl px-3 py-2.5 shadow-2xl shadow-black/20 ring-1 ring-white/5">
                  <div className="flex gap-1 shrink-0 px-1 items-center">
                    <div className="relative flex items-center justify-center size-10">
                      {me?.border_url && (
                        <div className="absolute inset-0 overflow-hidden">
                          <Image
                            src={me.border_url}
                            alt="border"
                            width={100}
                            height={100}
                            className="w-full h-full object-cover scale-150"
                          />
                        </div>
                      )}
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center relative z-10 overflow-hidden">
                        {me?.avatar_url ? (
                          <Image
                            src={me.avatar_url}
                            alt="My Avatar"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <TbUserStar className="text-primary size-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="w-full rounded-2xl px-4 py-6 text-[14px] bg-transparent pr-12 transition-all placeholder:text-muted-foreground/40 font-medium h-12"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className="bg-primary hover:bg-primary/90 text-white p-3 rounded-2xl shadow-xl shadow-primary/30 transition-all flex items-center justify-center cursor-pointer active:translate-y-0.5"
                    >
                      <SendHorizontal className="size-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground italic flex-col gap-3 ">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                <MessageCircle className="size-8 opacity-20" />
              </div>
              <p className="font-medium">Select a conversation to start messaging</p>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={deleteState.isOpen} onOpenChange={(open) => !open && setDeleteState(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteState.type === 'chat'
                ? "This will permanently delete this chat history."
                : "This will permanently delete this message."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-primary hover:bg-primary/40 text-white cursor-pointer">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
